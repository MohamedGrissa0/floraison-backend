
const mongoose = require("mongoose");
const possibleCategories = ["mp", "em",];

const NlotdSchema = new mongoose.Schema({
  Nlot: { type: String, required: true },
  CodeArticle: { type: String }, // Ensure CodeArticle is unique
  Designation: { type: String },
  NBL: { type: String },
  iventoryDate: { type: Date },
  Category: { type: String, enum: possibleCategories },
  Fournisseur: { type: String },
  Unite: { type: String },
  Consommation: { type: Number, default: 0 },
  itemId : { type: String },
  Stockintiale: { type: Number },
  StockfiniInitial: { type: Number, default: 0 },
  dailydechet: [{
    date: { type: Date, required: true },
    entre: { type: Number, default: 0 },
    sortie: { type: Number, default: 0 },
    source: { type: String,  },
    destination: { type: String,  },
  }],
  totalDechet: { type: Number, default: 0 },
  DateFabricarion: { type: Date },
  DateExpiration: { type: Date },
  dailyEntries: [{
    date: { type: Date, required: true },
    entre: { type: Number, default: 0 },
    sortie: { type: Number, default: 0 },
    DateNow: { type: Date },
    source: { type: String,  },
    destination: { type: String,   },
    type: { type: String,required: true    },

  }],
  Stockfini: { type: Number, default: 0 },
  Min: { type: Number, default: 0 },

  totalEntres: { type: Number, default: 0 },
  totalSorties: { type: Number, default: 0 },
});


// Pre-save hook for NlotSchema


const PfinidSchema = new mongoose.Schema({
  CodeArticle: { type: String, required: true },
  Designation: { type: String },
  Category: { type: String, enum: possibleCategories },
  Unite: { type: String },
  Stockintiale: { type: Number, default: 0 },
  Stockfini: { type: Number, default: 0 },
  Consommation: { type: Number, default: 0 },
  status: { type: String, default: "accepted" },
  totalEntresall: { type: Number, default: 0 },
  totalSortiesall: { type: Number, default: 0 },
  totaldechets: { type: Number, default: 0 },
  Min: { type: Number, default: 0 },

  nlots: [NlotdSchema],
});

// Pre-save hook for PfiniSchema
PfinidSchema.pre("save", function(next) {
  this.Stockintiale = this.nlots.reduce((total, nlot) => total + nlot.Stockintiale, 0);
  this.Consommation = this.nlots.reduce((total, nlot) => total + nlot.Consommation, 0);
  this.totalEntresall = this.nlots.reduce((total, nlot) => total + nlot.totalEntres, 0);
  this.totalSortiesall = this.nlots.reduce((total, nlot) => total + nlot.totalSorties, 0);
  this.totaldechets = this.nlots.reduce((total, nlot) => total + nlot.totalDechet, 0);
  this.Stockfini = this.Stockintiale + this.totalEntresall - this.totalSortiesall;
  next();
});
const PfinidModel = mongoose.model("depot", PfinidSchema);
const NlotdModel = mongoose.model("dNlot", NlotdSchema);

module.exports = { PfinidModel, NlotdModel };






















