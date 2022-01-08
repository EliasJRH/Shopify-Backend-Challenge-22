const { query } = require("express");
const express = require("express");
const router = express.Router();
const Inventory = require("../models/Inventory");

router.get("/", async (req, res) => {
  try {
    const allInventory = await Inventory.find(req.query);
    res.status(200).send(allInventory);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

router.post("/", async (req, res) => {
    try{
        const newInventory = await Inventory.create(req.body);
        res.status(200).send(newInventory);
    }catch(err){
        if (err._message == "Inventory validation failed"){
            res.status(400).send({message: err.message})
        }else{
            res.status(500).send({message: err.message})
        }
    }
  
});

module.exports = router;
