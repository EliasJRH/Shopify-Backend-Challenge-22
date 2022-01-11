const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },
  dateOfArrival: {
    type: Date,
    required: true,
  },
  contents: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("Shipment", shipmentSchema);
