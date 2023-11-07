const mongoose = require('mongoose');

// Define the Source schema
const FournisseurSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Place: {
    type: String,
    required: true,
  },
});

// Create the Source model
const Fournisseur = mongoose.model('Fournisseur', FournisseurSchema);

module.exports = Fournisseur;
