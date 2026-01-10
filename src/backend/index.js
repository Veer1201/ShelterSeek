const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const admin = require('firebase-admin');
const cors = require('cors');

// --- FIREBASE SETUP ---

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// --- SERVER SETUP ---
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// --- THE SMS ROUTE ---
app.post('/sms', async (req, res) => {
  const twiml = new MessagingResponse();
  const incomingMsg = req.body.Body ? req.body.Body.trim().toLowerCase() : '';
  
  console.log(`📩 Text Received: ${incomingMsg}`);

  try {
    if (incomingMsg.includes('bed') || incomingMsg.includes('status')) {
      // Find shelters with open beds
      const snapshot = await db.collection('shelters').where('beds', '>', 0).get();

      if (snapshot.empty) {
        twiml.message("⚠️ All shelters are currently FULL. We will text you if a spot opens.");
      } else {
        let msg = "🟢 OPEN BEDS:\n";
        snapshot.forEach(doc => {
          const data = doc.data();
          msg += `\n📍 ${data.name}: ${data.beds} beds\n`;
        });
        twiml.message(msg);
      }
    } else {
      twiml.message("ShelterSeek: Text 'BEDS' to find a spot near you.");
    }
  } catch (error) {
    console.error("Error:", error);
    twiml.message("System Error. Please try again.");
  }

  res.type('text/xml').send(twiml.toString());
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});