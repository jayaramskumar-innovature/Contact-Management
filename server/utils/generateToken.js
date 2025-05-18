const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const generateRefreshToken = (id)=>{
  return jwt.sign({id}, process.env.REFRESH_TOKEN_SECRET,{
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
  })
}

module.exports = {
  generateToken,
  generateRefreshToken
};