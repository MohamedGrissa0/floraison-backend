const mongoose = require("mongoose");


const DestinationSchema = new mongoose.Schema({
	Name: { type: String, required: true },
	Place: { type: String, required: true },
	

});



const Destination = mongoose.model("Destination", DestinationSchema);




module.exports = { Destination  };