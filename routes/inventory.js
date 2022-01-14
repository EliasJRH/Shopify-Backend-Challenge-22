const express = require("express");
const router = express.Router();
const inventoryService = require("../services/inventory.service");

router.get("/", async (req, res) => {
  if (req.query.upc) {
    try {
      const inventoryFromUpc = await inventoryService.getInventoryFromUpc(
        req.query.upc
      );
      res.status(200).send(inventoryFromUpc);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    try {
      const allInventory = await inventoryService.getAllInventory();
      res.status(200).send(allInventory);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
});

router.get("/:id", async (req, res) => {
  try {
    const inventoryFromId = await inventoryService.getInventoryFromId(
      req.params.id
    );
    res.status(200).send(inventoryFromId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newInventory = await inventoryService.createNewInventory(req.body);
    res.status(200).send(newInventory);
  } catch (err) {
    if (
      err.message == "Inventory validation failed" ||
      err.message.startsWith("Inventory with name:") ||
      err.message.startsWith("E11000 duplicate key error collection:")
    ) {
      res.status(400).send({ message: err.message });
    } else {
      res.status(500).send({ message: err.message });
    }
  }
});

router.put("/:id", async (req, res) => {
  try {
    const inventoryItem = await inventoryService.updateInventoryById(
      req.params.id,
      req.body
    );

    res
      .status(200)
      .send(
        `Inventory item with id: ${req.params.id} updated. \n ${inventoryItem}`
      );
  } catch (err) {
    if (
      err.message.startsWith("Item with id:") ||
      err.message.startsWith("E11000 duplicate key error collection:") ||
      err.message.startsWith("Cast to ObjectId failed")
    ) {
      res.status(400).send({ message: err.message });
    } else {
      res.status(500).send({ message: err.message });
    }
  }
});

router.delete("/", async (req, res) => {
  await inventoryService.deleteAllInventory();
  res.status(200).send("All inventory deleted");
});

router.delete("/:id", async (req, res) => {
  try {
    const inventoryToDelete = await inventoryService.deleteInventoryById();
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
