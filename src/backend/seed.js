const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

// Fake Data: Shelters in Surrey/Vancouver area
const shelters = [
  {
    id: 'shelter_01',
    name: 'Surrey Urban Mission',
    beds: 5,
    phone: '+16045550101',
    lat: 49.1913,
    lng: -122.8490,
    status: 'OPEN'
  },
  {
    id: 'shelter_02',
    name: 'Gateway Shelter',
    beds: 0, // FULL
    phone: '+16045550102',
    lat: 49.2096,
    lng: -122.8755,
    status: 'FULL'
  },
  {
    id: 'shelter_03',
    name: 'Cove Shelter',
    beds: 2,
    phone: '+16045550103',
    lat: 49.1850,
    lng: -122.8100,
    status: 'OPEN'
  },
  {
    id: 'shelter_04',
    name: 'Hyland House',
    beds: 1,
    phone: '+16045550104',
    lat: 49.1350,
    lng: -122.8500,
    status: 'OPEN'
  },
  {
    id: 'shelter_05',
    name: 'Lookout Society',
    beds: 0,
    phone: '+16045550105',
    lat: 49.1100,
    lng: -122.9000,
    status: 'FULL'
  }
];

async function seedDB() {
  console.log(' Seeding database...');
  for (const shelter of shelters) {
    await db.collection('shelters').doc(shelter.id).set(shelter);
    console.log(`Added: ${shelter.name}`);
  }
  console.log('✅ Database populated!');
}

seedDB();