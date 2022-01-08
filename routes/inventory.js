const express = require("express");
const { route } = require("express/lib/application");
const router = express.Router();
const Inventory = require("../models/Inventory");

router.get("/", async (req, res) => {
  const allInventory = await Inventory.find();
  res.status(200).send(allInventory);
});

router.post("/", async (req, res) => {
  const newInventory = await Inventory.create(req.body);
  res.status(200).send("OK");
});

module.exports = router;
