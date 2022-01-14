const { Inventory } = require("../models");
const crypto = require("crypto");

const manufacturerCode = "420690";

/**
 * Gets all inventory
 * @returns {Promise<Inventory>}
 */
const getAllInventory = async () => {
  const allInventory = await Inventory.find();
  return allInventory;
};

/**
 * Get inventory by UPC
 * @param {string} upc - upc of inventory
 * @returns {Promise<Inventory>}
 */
const getInventoryFromUpc = async (upc) => {
  const inventoryFromUpc = await Inventory.findOne({ upc: upc });
  return inventoryFromUpc;
};

/**
 * Get inventory by id
 * @param {ObjectId} id
 * @returns {Promise<Inventory>}
 */
const getInventoryFromId = async (id) => {
  const inventoryFromId = await Inventory.findById(id);
  return inventoryFromId;
};

/**
 * Create piece of inventory
 * @param {Object} inventoryInfo
 * @returns {Promise<Inventory>}
 */
const createNewInventory = async (inventoryInfo) => {
  const newInventory = await Inventory.create(inventoryInfo);
  return newInventory;
};

/**
 * Update inventory by id
 * @param {ObjectId} id
 * @param {Object} updateInfo
 * @returns {Promise<Inventory>}
 */
const updateInventoryById = async (id, updateInfo) => {
  const inventoryToUpdate = await Inventory.findById(id);
  if (!inventoryToUpdate) {
    throw new Error(`Item with id: ${id} not found`);
  }

  if (updateInfo.name){
    updateInfo.upc = calculateUPC(updateInfo.name)
  }

  await Inventory.findByIdAndUpdate(id, updateInfo);
  Object.assign(inventoryToUpdate, updateInfo);

  return inventoryToUpdate;
};

/**
 * Delete all inventory
 */
const deleteAllInventory = async () => {
  await Inventory.deleteMany();
};

/**
 * Delete inventory by id
 * @param {string} id
 * @returns {Promise<Inventory>}
 */
const deleteInventoryById = async (id) => {
  const inventoryToDelete = await Inventory.findById(id);

  if (!inventoryToDelete) {
    throw new Error(`Item with id: ${id} not found`);
  }

  await Inventory.findByIdAndDelete(id);

  return inventoryToDelete;
};

/**
 * Calculutes checksum from manufacturer code and item code
 * @param {string} itemCode 
 * @returns {number} - The last number in a UPC called the checksum
 */
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

/**
 * Calculate item code from hashed item name
 * @param {string} itemHash - hex hash of item name
 * @returns {string} - item code
 */
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

/**
 * Calculates UPC for an item from its name
 * @param {string} itemName 
 * @returns {string} - UPC of item
 */
const calculateUPC = (itemName) => {
  let itemHash = crypto.createHash("md5").update(itemName).digest("hex");
  let itemCode = calculateItemCode(itemHash);
  let checkSum = calculateCheckSum(itemCode);

  return `${manufacturerCode}${itemCode}${checkSum}`;
};

module.exports = {
  getAllInventory,
  getInventoryFromUpc,
  getInventoryFromId,
  createNewInventory,
  updateInventoryById,
  deleteAllInventory,
  deleteInventoryById,
  calculateUPC
};
