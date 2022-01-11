const express = require("express");
const router = express.Router();
const { Inventory } = require("../models");

router.get("/", async (req, res) => {
  if (req.query.upc) {
    try {
      const inventoryFromUpc = await Inventory.findOne({ upc: req.query.upc });
      res.status(200).send(inventoryFromUpc);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    try {
      const allInventory = await Inventory.find();
      res.status(200).send(allInventory);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
});

router.get("/:id", async (req, res) => {
  try {
    const inventoryFromId = await Inventory.findById(req.params.id);
    res.status(200).send(inventoryFromId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newInventory = await Inventory.create(req.body);
    res.status(200).send(newInventory);
  } catch (err) {
    if (err._message == "Inventory validation failed") {
      res.status(400).send({ message: err.message });
    } else {
      res.status(500).send({ message: err.message });
    }
  }
});

router.put("/:id", async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);
    if (!inventoryItem) {
      throw new Error(`Item with id: ${req.params.id} not found`);
    }

    await Inventory.findByIdAndUpdate(req.params.id, req.body);
    Object.assign(inventoryItem, req.body);

    res
      .status(200)
      .send(
        `Inventory item with id: ${req.params.id} updated. \n ${inventoryItem}`
      );
  } catch (err) {
    if (
      err.message.startsWith("Item with id:") ||
      err.message.startsWith("Cast to ObjectId failed")
    ) {
      res.status(400).send({ message: err.message });
    } else {
      res.status(500).send({ message: err.message });
    }
  }
});

router.put("/:upc", async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.upc);
    if (!inventoryItem) {
      throw new Error(`Item with UPC code: ${req.params.upc} not found`);
    }

    await Inventory.findByIdAndUpdate(req.params.id, req.body);
    Object.assign(inventoryItem, req.body);

    res
      .status(200)
      .send(
        `Inventory item with id: ${req.params.id} updated. \n ${inventoryItem}`
      );
  } catch (err) {
    if (
      err.message.startsWith("Item with id:") ||
      err.message.startsWith("Cast to ObjectId failed")
    ) {
      res.status(400).send({ message: err.message });
    } else {
      res.status(500).send({ message: err.message });
    }
  }
});

router.delete("/", async (req, res) => {
  await Inventory.deleteMany();
  res.status(200).send("All inventory deleted");
});

router.delete("/:id", async (req, res) => {
  try {
    const inventoryToDelete = await Inventory.findById(req.params.id);

    if (!inventoryToDelete) {
      throw new Error(`Item with id: ${req.params.id} not found`);
    }

    await Inventory.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .send(`Item with id: ${req.params.id} deleted. \n${inventoryToDelete}`);
  } catch (err) {
    if (
      err.message.startsWith("Item with id:") ||
      err.message.startsWith("Cast to ObjectId failed")
    ) {
      res.status(400).send({ message: err.message });
    } else {
      res.status(500).send({ message: err.message });
    }
  }
});

module.exports = router;
