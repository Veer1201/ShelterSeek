require('dotenv').config(); 

const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors'); 

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors()); 

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 1. SMS BOT ROUTE ---
app.post('/sms', async (req, res) => {
  const incomingMsg = req.body.Body ? req.body.Body.trim() : "";
  const userPhone = req.body.From;
  const twiml = new MessagingResponse();

  try {
    if (incomingMsg.toUpperCase() === "WAITLIST") {
      const snapshot = await db.collection('shelters').get();
      let openShelters = [];
      snapshot.forEach(doc => {
        if (doc.data().beds > 0) openShelters.push(doc.data().name);
      });

      if (openShelters.length > 0) {
        twiml.message(`❌ Waitlist Rejected. There are beds available right now at: ${openShelters.join(', ')}. Please go there directly.`);
        res.type('text/xml').send(twiml.toString());
        return;
      }
      await db.collection('waitlist').add({
        phone: userPhone,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // Get position
      const waitSnapshot = await db.collection('waitlist').get();
      twiml.message(`✅ You are #${waitSnapshot.size} on the Priority Waitlist. We will text you the moment a bed opens.`);
      res.type('text/xml').send(twiml.toString());
      return; 
    }

    const snapshot = await db.collection('shelters').get();
    let shelterData = "";
    snapshot.forEach(doc => {
      const s = doc.data();
      shelterData += `- ${s.name}: ${s.beds} beds.\n`;
    });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
    Role: Shelter Dispatcher. Data: ${shelterData}. User: "${incomingMsg}"
    Rules:
    1. If beds > 0, tell them where to go.
    2. If beds == 0, tell them where to go and how many rooms are available at each shelter house"
    3. Short reply (<160 chars).
    `;
    const result = await model.generateContent(prompt);
    twiml.message(result.response.text());

  } catch (error) {
    console.error(error);
    twiml.message("System busy.");
  }
  res.type('text/xml').send(twiml.toString());
});

app.post('/api/notify-waitlist', async (req, res) => {
  const { shelterName } = req.body;
  
  try {
    const snapshot = await db.collection('waitlist').orderBy('timestamp').limit(1).get();
    
    if (snapshot.empty) {
      return res.json({ status: 'no_users', message: 'No one on waitlist.' });
    }

    const userDoc = snapshot.docs[0];
    const userPhone = userDoc.data().phone;
    await client.messages.create({
      body: `🔔 GOOD NEWS! A bed just opened at ${shelterName}. You are first in line. Please head there immediately!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: userPhone
    });

    console.log(`🔔 Notified ${userPhone} about ${shelterName}`);
    res.json({ status: 'success', sentTo: userPhone });

  } catch (error) {
    console.error("Notification Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('🤖 Backend with Notification System running on 3000');
});