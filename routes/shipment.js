const express = require("express");
const router = express.Router();
const { Shipment, Inventory } = require("../models");

const verifyInventory = async (listOfInventory) => {
  for (var upc in listOfInventory) {
    const currentItem = await Inventory.findOne({ upc: upc });

    if (!currentItem) {
      throw new Error(
        `Could not find product with UPC code: ${upc}`
      );
    }

    if (currentItem.amount < parseInt(listOfInventory[upc])) {
      throw new Error(
        `Product with UPC code: ${upc} only has ${currentItem.amount} in stock while ${listOfInventory[upc].amount} was requested`
      );
    }
  }

  return true;

};

const updateInventory = async (listOfInventory) => {
  for (var upc in listOfInventory){
    const currentItem = await Inventory.findOne({upc: upc})
    await Inventory.findByIdAndUpdate(currentItem._id, {amount: currentItem.amount - parseInt(listOfInventory[upc])})
  }
};

router.get("/", async (req, res) => {
  try {
    const allShipments = await Shipment.find();
    res.status(200).send(allShipments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const hasEnoughStock = await verifyInventory(req.body.contents);
    if (hasEnoughStock){
      await updateInventory(req.body.contents)
    }
    const newShipment = await Shipment.create(req.body);
    res.status(200).send(newShipment);
  } catch (err) {
    if (
      err._message == "Shipment validation failed" ||
      err.message.startsWith("Could not find product with UPC code:") ||
      err.message.startsWith("Product with UPC code:")
    ) {
      res.status(400).send({ message: err.message });
    } else {
      res.status(500).send({ message: err.message });
    }
  }
});

router.put("/:id", async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.query.id);
    if (!shipment) {
      throw new Error(`Shipment with id: ${req.params.id} not found`);
    }

    if (req.body.contents) {
      await verifyUpdate(shipment.contents, req.body.contents);
    }

    await Shipment.findByIdAndUpdate(req.params.id, req.body);
    Object.assign(shipment, req.body);
  } catch (err) {
    if (
      err.message.startsWith("Shipment with id:") ||
      err.message.startsWith("Cast to ObjectId failed")
    ) {
      res.status(400).send({ message: err.message });
    }
  }
});

router.delete("/", async (req, res) => {
  await Shipment.deleteMany();
  res.status(200).send("All shipments deleted");
});

router.delete("/:id", async (req, res) => {
  try {
    const shipmentToDelete = await Shipment.findById(req.params.id);

    if (!shipmentToDelete) {
      throw new Error(`Shipment with id: ${req.params.id} not found`);
    }

    await Shipment.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .send(`Item with id: ${req.params.id} deleted. \n${shipmentToDelete}`);
  } catch (err) {
    if (
      err.message.startsWith("Shipment with id:") ||
      err.message.startsWith("Cast to ObjectId failed")
    ) {
      res.status(400).send({ message: err.message });
    } else {
      res.status(500).send({ message: err.message });
    }
  }
});

module.exports = router;
