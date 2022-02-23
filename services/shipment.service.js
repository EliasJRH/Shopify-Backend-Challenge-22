const { Shipment, Inventory } = require("../models");

/**
 * Checks current inventory to see if shipment can be made
 * @param {Map} listOfInventory
 * @returns {Boolean} - true if requested inventory is available for shipment, error otherwise
 */
const verifyInventory = async (listOfInventory) => {
  for (var upc in listOfInventory) {
    const currentItem = await Inventory.findOne({ upc: upc });

    if (!currentItem) {
      throw new Error(`Could not find product with UPC code: ${upc}`);
    }

    if (currentItem.amount < parseInt(listOfInventory[upc])) {
      throw new Error(
        `Product with UPC code: ${upc} only has ${currentItem.amount} in stock while ${listOfInventory[upc]} was requested`
      );
    }
  }

  return true;
};

/**
 * Checks inventory to see if shipment can be made after possibly returning inventory from old list of inventory
 * @param {Map} listOfInventory
 * @param {Map} newList
 * @returns {Boolean} - true if requested inventory update can be made after returning inventory in current shipment, error otherwise
 */
const verifyInventoryUpdate = async (listOfInventory, newList) => {
  for (var upc in newList) {
    if (listOfInventory.get(upc) !== undefined) {
      const currentInventory = await Inventory.findOne({ upc: upc });
      const totalAfterReturn =
        currentInventory.amount + listOfInventory.get(upc);

      if (totalAfterReturn < parseInt(newList[upc])) {
        throw new Error(
          `Product with UPC code: ${upc} only has ${totalAfterReturn} in stock while ${newList[upc]} was requested`
        );
      }
    } else {
      const currentItem = await Inventory.findOne({ upc: upc });

      if (!currentItem) {
        throw new Error(`Could not find product with UPC code: ${upc}`);
      }

      if (currentItem.amount < parseInt(newList[upc])) {
        throw new Error(
          `Product with UPC code: ${upc} only has ${currentItem.amount} in stock while ${newList[upc]} was requested`
        );
      }
    }
  }

  return true;
};

/**
 * Update inventory after shipment is made
 * @param {Map} listOfInventory
 */
const updateInventory = async (listOfInventory) => {
  for (var upc in listOfInventory) {
    const currentItem = await Inventory.findOne({ upc: upc });
    await Inventory.findByIdAndUpdate(currentItem._id, {
      amount: currentItem.amount - parseInt(listOfInventory[upc]),
    });
  }
};

/**
 * Update inventory after shipment update is made
 * @param {Map} listOfInventory
 * @param {Map} newList
 */
const updateNewInventory = async (listOfInventory, newList) => {
  //For each upc code in the new list
  for (var upc in newList) {
    //If it existed in the old list
    if (listOfInventory.get(upc) !== undefined) {
      //modify it's amount to reflect whats now being used
      const currentItem = await Inventory.findOne({ upc: upc });
      await Inventory.findByIdAndUpdate(currentItem._id, {
        amount: currentItem.amount + listOfInventory.get(upc) - newList[upc],
      });

      //If it didn't exist in the old list, update normally
    } else {
      const currentItem = await Inventory.findOne({ upc: upc });
      await Inventory.findByIdAndUpdate(currentItem._id, {
        amount: currentItem.amount - parseInt(newList[upc]),
      });
    }
  }

  //For each upc code in the old list
  for (const upc of listOfInventory.keys()) {
    //If the upc doesn't exist in the new list (item was removed from shipment)
    if (newList[upc] === undefined) {
      //Add items back to inventory
      const currentItem = await Inventory.findOne({ upc: upc });
      await Inventory.findByIdAndUpdate(currentItem._id, {
        amount: currentItem.amount + listOfInventory.get(upc),
      });
    }
  }
};

/**
 * Get all shipments
 * @returns {Promise<Shipment>}
 */
const getAllShipments = async () => {
  const allShipments = await Shipment.find();
  return allShipments;
};

/**
 * Get shipment by id
 * @param {ObjectId} id
 * @returns {Promise<Shipment>}
 */
const getShipmentById = async (id) => {
  const shipmentFromId = await Shipment.findById(id);
  return shipmentFromId;
};

/**
 * Create shipment
 * @param {Object} body
 * @returns {Promise<Shipment>}
 */
const createShipment = async (body) => {
  const hasEnoughStock = await verifyInventory(body.contents);
  if (hasEnoughStock) {
    await updateInventory(body.contents);
  }
  const newShipment = await Shipment.create(body);
  return newShipment;
};

/**
 * Update shipment by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Shipment>}
 */
const updateShipment = async (id, updateBody) => {
  const shipment = await Shipment.findById(id);
  if (!shipment) {
    throw new Error(`Shipment with id: ${id} not found`);
  }

  if (updateBody.contents) {
    const hasEnoughAfterReturns = await verifyInventoryUpdate(
      shipment.contents,
      updateBody.contents
    );
    if (hasEnoughAfterReturns) {
      await updateNewInventory(shipment.contents, updateBody.contents);
    }
  }

  await Shipment.findByIdAndUpdate(id, updateBody);
  Object.assign(shipment, updateBody);

  return shipment;
};

/**
 * Delete all shipments
 */
const deleteAllShipments = async () => {
  await Shipment.deleteMany();
};

/**
 * Delete shipment by id
 * @param {ObjectId} id
 * @returns
 */
const deleteShipmentById = async (id) => {
  const shipmentToDelete = await Shipment.findById(id);

  if (!shipmentToDelete) {
    throw new Error(`Shipment with id: ${id} not found`);
  }

  await Shipment.findByIdAndDelete(id);
  return shipmentToDelete;
};

module.exports = {
  verifyInventory,
  verifyInventoryUpdate,
  updateInventory,
  updateNewInventory,
  getAllShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteAllShipments,
  deleteShipmentById,
};
