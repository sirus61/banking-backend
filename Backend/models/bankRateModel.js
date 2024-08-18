const mongoose = require('mongoose')

const bankRate = new mongoose.Schema(
  {
    bankRate: {
      type: String,
      require: [true, 'Please Provide Sending Account Id!'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

exports.bankRate = mongoose.model('bankRate', bankRate)
