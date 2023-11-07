const mongoose = require("mongoose");

// Define possible categories

const MVT = new mongoose.Schema({
  nlot: { type: String, required: true },
  date: {type:Date , required:true},
  sortieQuantity : {type:Number ,required:true}


});

const Mvt = mongoose.model("Mvt", MVT);
module.exports = Mvt
