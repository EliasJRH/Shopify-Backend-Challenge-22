const express = require("express");
const router = express.Router();
const Shipment = require("../models/Shipment");

router.get("/", async (req, res) => {
  try {
    const allShipments = Shipment.find();
    res.status(200).send(allShipments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newShipment = await Shipment.create(req.body);
    res.status(200).send(newShipment);
  } catch (err) {
    if (err._message == "Shipment validation failed") {
      res.status(400).send({ message: err.message });
    } else {
      res.status(500).send({ message: err.message });
    }
  }
});
