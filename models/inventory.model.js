const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
  },
  amount: {
    type: Number,
    min: 0,
    default: 1,
  },
  cost: {
    type: Number,
    required: true,
  },
  upc: {
    type: String
  },
});

inventorySchema.pre("save", function (next) {
  const { calculateUPC } = require("../services/inventory.service")
  this.upc = calculateUPC(this.name);
  next();
});

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;
