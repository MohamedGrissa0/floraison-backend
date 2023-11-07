const mongoose = require('mongoose');

// Define the Source schema
const sourceSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Place: {
    type: String,
    required: true,
  },
  Case: {
    type: Boolean,
    required: true,
  },
});

// Create the Source model
const Source = mongoose.model('Source', sourceSchema);

module.exports = Source;
