const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  amount: {
    type: Number,
    default: 1,
  },
  upc: {
    type: String,
  },
});

module.exports = mongoose.model("Inventory", inventorySchema)