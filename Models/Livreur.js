const mongoose = require('mongoose');

// Define the Source schema
const LivreurSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },

});

// Create the Source model
const Livreur = mongoose.model('Livreur', LivreurSchema);

module.exports = Livreur;
