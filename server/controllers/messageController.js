const Message = require('../models/Message');

// @desc    Get discussion thread messages for an item
// @route   GET /api/items/:itemId/messages
// @access  Private
const getItemMessages = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const messages = await Message.find({ item: itemId }).sort({ createdAt: 1 });

    const formattedMessages = messages.map((msg) => ({
      _id: msg._id,
      author: msg.author,
      body: msg.body,
      mine: msg.sender.toString() === req.user._id.toString(),
      createdAt: msg.createdAt,
    }));

    return res.json(formattedMessages);
  } catch (error) {
    next(error);
  }
};

// @desc    Post a message to an item's discussion thread
// @route   POST /api/items/:itemId/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const message = await Message.create({
      item: itemId,
      sender: req.user._id,
      author: req.user.name,
      body: body.trim(),
    });

    return res.status(201).json({
      _id: message._id,
      author: message.author,
      body: message.body,
      mine: true,
      createdAt: message.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItemMessages,
  sendMessage,
};
