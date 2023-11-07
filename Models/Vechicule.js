const mongoose = require('mongoose');

// Define the Source schema
const vehiculeSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },

});

// Create the Source model
const vehicule = mongoose.model('vehicule', vehiculeSchema);

module.exports = vehicule;
