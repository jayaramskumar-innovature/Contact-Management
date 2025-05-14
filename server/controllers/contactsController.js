const Contact = require('../models/Contact');

// @desc    Get all contacts with search and pagination
// @route   GET /api/contacts
// @access  Private
const getContacts = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Search
    const searchQuery = {};
    if (req.query.search) {
      searchQuery.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { company: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const contacts = await Contact.find(searchQuery)
      .skip(skip)
      .limit(limit);
      
    const total = await Contact.countDocuments(searchQuery);
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: contacts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
const getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Private
const createContact = async (req, res, next) => {
  try {
    // Validate required fields
    if (!req.body.firstName || !req.body.phoneNumbers || !req.body.phoneNumbers.length) {
      return res.status(400).json({
        success: false,
        error: 'First name and at least one phone number are required'
      });
    }

    const contact = await Contact.create(req.body);
    
    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
const updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact
};