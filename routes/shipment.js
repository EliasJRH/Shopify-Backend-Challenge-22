const express = require("express");
const router = express.Router();
const shipmentService = require("../services/shipment.service");

router.get("/", async (req, res) => {
  try {
    const allShipments = await shipmentService.getAllShipments();
    res.status(200).send(allShipments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const shipmentFromId = await shipmentService.getShipmentById(req.params.id);
    res.status(200).send(shipmentFromId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newShipment = await shipmentService.createShipment(req.body);
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
    const updatedShipment = await shipmentService.updateShipment(
      req.params.id,
      req.body
    );
    res.status(200).send(updatedShipment);
  } catch (err) {
    if (
      err.message.startsWith("Shipment with id:") ||
      err.message.startsWith("Could not find product with UPC code:") ||
      err.message.startsWith("Cast to ObjectId failed") ||
      err.message.startsWith("Product with UPC code:")
    ) {
      res.status(400).send({ message: err.message });
    } else {
      res.status(500).send({ message: err.message });
    }
  }
});

router.delete("/", async (req, res) => {
  await shipmentService.deleteAllShipments();
  res.status(200).send("All shipments deleted");
});

router.delete("/:id", async (req, res) => {
  try {
    const shipmentToDelete = await shipmentService.deleteShipmentById(
      req.params.id
    );
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
