const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: [true, 'Message body cannot be empty'],
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ item: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
