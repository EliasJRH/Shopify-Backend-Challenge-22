const express = require("express");
const router = express.Router();
const { Shipment, Inventory } = require("../models");

const verifyInventory = async (listOfInventory) => {
  for (let i = 0; i < listOfInventory.length; i++) {
    const currentItem = await Inventory.findOne({
      upc: listOfInventory[i].upc,
    });

    console.log(currentItem.amount, parseInt(listOfInventory[i].amount))

    if (!currentItem) {
      throw new Error(
        `Could not find product with UPC code: ${listOfInventory[i].upc}`
      );
    }

    if (currentItem.amount < parseInt(listOfInventory[i].amount)) {
      throw new Error("no")
      // throw new Error(`Product with UPC code: ${listOfInventory[i].upc} only has ${currentItem.amount} in stock while ${listOfInventory[i].amount} was requested`)
    }

    await Inventory.findByIdAndUpdate(currentItem._id, { amount: currentItem.amount - listOfInventory[i].amount})

  }
  return true;
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
    await verifyInventory(req.body.contents);
    const newShipment = await Shipment.create(req.body);
    res.status(200).send(newShipment);
  } catch (err) {
    if (
      err._message == "Shipment validation failed" ||
      err.message.startsWith("Could not find product")
    ) {
      res.status(400).send({ message: err.message });
    } else {
      res.status(500).send({ message: err.message });
    }
  }
});

router.delete("/", async (req, res) => {
  await Shipment.deleteMany();
  res.status(200).send("All shipments deleted");
});

module.exports = router;
