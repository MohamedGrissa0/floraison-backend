// NoteSchema.js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  nlot: String,
  CodeArticle: String,
  Des: String,
  quantity: Number,
  unit: String,
  noteType: String,
});

module.exports = mongoose.model('Note', noteSchema);
