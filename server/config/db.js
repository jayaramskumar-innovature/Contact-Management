const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

//0BbAtiss39G1bgAb
//UseNewUrlParser: true
// MongoDB's Node.js driver had a legacy URL parser that
// was replaced with a newer, more robust one. The new parser handles MongoDB connection strings more reliably and is required for some newer MongoDB features.
//useUnifiedTopology: true
//This option enables the new unified topology engine for MongoDB connections.
//Since Mongoose 6.0 (released in late 2021), these options are enabled by default
