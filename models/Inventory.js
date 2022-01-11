const mongoose = require("mongoose");
const crypto = require("crypto");

const manufacturerCode = "420690";

const calculateCheckSum = (itemCode) => {
  let stringLessCheckSum = `${manufacturerCode}${itemCode}`;

  let num1 = 0;
  let num2 = 0;

  for (let i = 0; i < stringLessCheckSum.length; i++) {
    if (i % 2 == 0) {
      num1 += parseInt(stringLessCheckSum[i]);
    } else {
      num2 += parseInt(stringLessCheckSum[i]);
    }
  }

  num1 *= 3;
  sum = num1 + num2;

  checkSum = 0;
  while (sum % 10 != 0) {
    sum += 1;
    checkSum += 1;
  }

  return checkSum;
};

const calculateItemCode = (itemHash) => {
  let itemCode = "";

  for (let i = 0; i < itemHash.length; i++) {
    if (!isNaN(itemHash[i])) {
      itemCode += itemHash[i];
    }

    if (itemCode.length == 5) {
      break;
    }
  }

  while (itemCode.length < 5) {
    itemCode += crypto.randomInt(0, 10);
  }

  return itemCode;
};

const calculateUPCCode = (itemName) => {
  let itemHash = crypto.createHash("md5").update(itemName).digest("hex");
  let itemCode = calculateItemCode(itemHash);
  let checkSum = calculateCheckSum(itemCode);

  return `${manufacturerCode}${itemCode}${checkSum}`;
};

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
  cost: {
    type: Number,
    required: true,
  },
  upc: {
    type: String,
  },
});

inventorySchema.pre("save", function (next) {
  this.upc = calculateUPCCode(this.name);
  next();
});

module.exports = mongoose.model("Inventory", inventorySchema);
