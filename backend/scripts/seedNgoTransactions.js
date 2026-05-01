require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const NgoTransaction = require('../models/NgoTransaction');
const data = require('../../frontend/src/data/ngo_transactions.json');

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Optional: Clear existing data
    await NgoTransaction.deleteMany({});
    console.log('Cleared existing NGO transactions');

    // Insert new data
    await NgoTransaction.insertMany(data);
    console.log(`Successfully seeded ${data.length} NGO transactions`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedData();
