const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });
};

const generateRefrestToken = (id)=>{
  return jwt.sign({id}, process.env.REFRESH_TOKEN_SECRET,{
    expiresIn: '7d'
  })
}

module.exports = {
  generateToken,
  generateRefrestToken
};