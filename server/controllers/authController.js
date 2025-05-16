const User = require('../models/User');
const {generateToken,generateRefrestToken} = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400); 
      throw new Error('User already exists blablabla');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefrestToken(user._id);
 

    // Save refreshToken to DB
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
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
      res.status(404);
      throw new Error('User not found');
    }
  } catch (err) {
    next(err);
    //when next is called with a prametre automatically control
    //skips all the upcoming middlewares if there are any
    //and calls the middleware with 4 parametres
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    // Verify refresh token
    console.log("inside refershToken");
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // console.log('decoded is ',decoded)

    // Check if token exists in DB
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Issue new access token
    const newAccessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  refreshAccessToken
};