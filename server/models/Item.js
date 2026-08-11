const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    kind: {
      type: String,
      enum: ['lost', 'found'],
      required: [true, 'Kind/type (lost or found) is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      default: () => new Date().toISOString(),
    },
    imageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'open', 'matched', 'resolved', 'rejected', 'claimed', 'approved'],
      default: 'pending',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    claimCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for query performance
itemSchema.index({ kind: 1, status: 1, category: 1, location: 1 });
itemSchema.index({ title: 'text', description: 'text', location: 'text' });

// Virtual getter for 'type' (alias for 'kind')
itemSchema.virtual('type').get(function () {
  return this.kind;
});

// Virtual getter for 'reporter' object formatted for frontend ({ _id, name })
itemSchema.virtual('reporter').get(function () {
  if (this.reportedBy && typeof this.reportedBy === 'object') {
    return {
      _id: this.reportedBy._id,
      name: this.reportedBy.name || 'Anonymous',
    };
  }
  return { _id: this.reportedBy, name: 'Anonymous' };
});

module.exports = mongoose.model('Item', itemSchema);
