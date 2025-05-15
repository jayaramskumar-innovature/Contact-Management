// errorHandler.js - Example advanced handler
const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message 
    });
  };


  
  module.exports = errorHandler;

//Most platforms automatically set NODE_ENV=production when deploying:
//Heroku, Render, Railway: Set it automatically