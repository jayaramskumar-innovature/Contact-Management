const bcrypt = require('bcryptjs');
const fs = require('fs');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');



dotenv.config();
// Configuration - adjust as needed
const NUM_RECORDS = 20;
const PASSWORD = '1234';
const SALT_ROUNDS = 10;
const MONGODB_URI = process.env.MONGO_URI; // Update with your DB name

console.log(MONGODB_URI);

// Function to generate a MongoDB ObjectId
function generateObjectId() {
  return new mongoose.Types.ObjectId();
}

// Function to hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(password, salt);
}

// Generate sample data
async function generateSampleData() {
  // Hash the password once - all users will have the same password
  const hashedPassword = await hashPassword(PASSWORD);
  
  const users = [];
  const contacts = [];
  
  // Company names for variety
  const companies = [
    "Tech Solutions Inc.", 
    "Global Innovations", 
    "Apex Systems", 
    "Harmony Corp", 
    "Everest Enterprises",
    "Pinnacle Partners", 
    "Quantum Industries", 
    "Zenith Technologies", 
    "Crescent Corp", 
    "Horizon Systems"
  ];
  
  // Generate data
  for (let i = 0; i < NUM_RECORDS; i++) {
    // Create user ID first so we can reference it in contacts
    const userId = generateObjectId();
    
    // Create user
    users.push({
      _id: userId,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      password: hashedPassword,
      refreshToken: null,
      createdAt: new Date()
    });
    
    // Create matching contact for this user
    contacts.push({
      _id: generateObjectId(),
      firstName: `Contact${i + 1}`,
      lastName: `Surname${i + 1}`,
      address: `${100 + i} Main Street, City${i + 1}, State ${i + 1}`,
      company: companies[i % companies.length],
      phoneNumber: `+1-555-${String(100 + i).padStart(3, '0')}-${String(i).padStart(3, '0')}`,
      user: userId,
      createdAt: new Date()
    });
  }
  
  // Return the data
  return { users, contacts };
}

// Function to directly insert data into MongoDB
async function insertDataIntoMongoDB(data) {
  // Connect to MongoDB
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Clear existing collections
    await db.collection('users').deleteMany({});
    await db.collection('contacts').deleteMany({});
    
    // Insert new data
    if (data.users.length > 0) {
      const userResult = await db.collection('users').insertMany(data.users);
      console.log(`${userResult.insertedCount} users inserted`);
    }
    
    if (data.contacts.length > 0) {
      const contactResult = await db.collection('contacts').insertMany(data.contacts);
      console.log(`${contactResult.insertedCount} contacts inserted`);
    }
    
    console.log('Data successfully inserted into MongoDB');
  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Main function
async function main() {
  try {
    const data = await generateSampleData();
    
    // OPTION 1: Write to JSON files (with string IDs for reference)
    // Convert ObjectIds to strings for JSON files
    const jsonData = {
      users: data.users.map(user => ({
        ...user,
        _id: user._id.toString()
      })),
      contacts: data.contacts.map(contact => ({
        ...contact,
        _id: contact._id.toString(),
        user: contact.user.toString()
      }))
    };
    
    fs.writeFileSync('sample-users.json', JSON.stringify(jsonData.users, null, 2));
    fs.writeFileSync('sample-contacts.json', JSON.stringify(jsonData.contacts, null, 2));
    console.log('JSON files created (with string IDs): sample-users.json, sample-contacts.json');
    
    // OPTION 2: Insert directly into MongoDB (with proper ObjectIds)
    await insertDataIntoMongoDB(data);
    
    console.log(`Successfully generated ${NUM_RECORDS} sample users and contacts!`);
    console.log('All users have the password: ' + PASSWORD);
    
  } catch (error) {
    console.error('Error generating sample data:', error);
  }
}

// Run the script
main();