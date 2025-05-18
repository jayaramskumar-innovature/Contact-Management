const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');


const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({message:'Please provide name, email, and password'})
  }

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(409).json({message:'User already exists'})
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000 
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      accessToken 
    });

  } catch (err) {
    next(err); 
  }
};


const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    console.log("user is ",user);

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    
    // Save refreshToken to DB
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000
    })

    res.json({
      accessToken,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};


const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email
      });
    } else {
      res.status(404).json({message:'User not found'})
    }
  } catch (err) {
    next(err);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    const refreshToken = cookies.jwt;
 
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      // Check if token exists in DB
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(403).json({ error: 'User not found' });
      }
      
      if (user.refreshToken !== refreshToken) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      // Issue new access token
      const accessToken = generateToken(user._id);
      
      res.json({ accessToken });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Refresh token expired, please log in again' });
      }
      throw err;
    }
  } catch (err) {
    res.status(403).json({ error: 'Refresh token verification failed' });
    next(err);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    
    if (!cookies?.jwt) {
      return res.status(204).json({ message: 'No content' }); // Success but no content
    }
    
    const refreshToken = cookies.jwt;
    
    const user = await User.findOne({ refreshToken });
    
    if (user) {
      // Clear the refresh token in DB
      user.refreshToken = null;
      await user.save();
    }
    
    // Clear the cookie
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: true
    });
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  refreshAccessToken
};