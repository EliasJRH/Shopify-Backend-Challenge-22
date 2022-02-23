require("dotenv").config();
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");
const {
  calculateUPC,
  createNewInventory,
  deleteAllInventory,
  getInventoryFromUpc
} = require("../services/inventory.service");

describe("INVENTORY routes", () => {
  let validInventory1;
  let validInventory2;

  beforeAll(async () => {
    await mongoose.disconnect();
    await mongoose.connect(process.env.TEST_URL);
    await deleteAllInventory();

    validInventory1 = {
      name: "Bananas",
      description: "Good ready to eat bananas",
      amount: 1000,
      cost: 4,
    };
    validInventory2 = {
      name: "Apples",
      description: "Delicious red apples",
      amount: 500,
      cost: 5,
    };
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe("POST /inventory", () => {
    test("should return 201 and successfully create new inventory with all the data", async () => {
      const res = await request(app)
        .post("/inventory")
        .type("form")
        .send(validInventory1)
        .set("Accept", "application/json")
        .expect(201);

      expect(res.body).toEqual({
        name: validInventory1.name,
        description: validInventory1.description,
        amount: validInventory1.amount,
        cost: validInventory1.cost,
        upc: calculateUPC(validInventory1.name),
        _id: expect.anything(),
        __v: 0,
      });
    });
  });

  describe("GET /inventory", () => {
    test("should return 200 and return all inventory items", async () => {
      await createNewInventory(validInventory2);
      const res = await request(app)
        .get("/inventory")
        .type("form")
        .set("Accept", "application/json")
        .expect(200);

      expect(res.body.length).toBe(2);
      expect(res.body[0]).toEqual({
        ...validInventory1,
        upc: calculateUPC(validInventory1.name),
        _id: expect.anything(),
        __v: expect.anything(),
      });
      expect(res.body[1]).toEqual({
        ...validInventory2,
        upc: calculateUPC(validInventory2.name),
        _id: expect.anything(),
        __v: expect.anything(),
      });
    });

    test("should return 200 with one inventory item that matches UPC", async () => {
      const res = await request(app)
        .get("/inventory")
        .type("form")
        .query({upc: calculateUPC(validInventory1.name)})
        .set("Accept", "application/json")
        .expect(200);

      expect(res.body).toEqual({
        ...validInventory1,
        upc: calculateUPC(validInventory1.name),
        _id: expect.anything(),
        __v: expect.anything(),
      });
    });

    test("should return 200 with one inventory item that matches id", async () => {
      const test_inventory = await getInventoryFromUpc(calculateUPC(validInventory1.name))
      const res = await request(app)
        .get(`/inventory/${test_inventory._id}`)
        .type("form")
        .set("Accept", "application/json")
        .expect(200);

      expect(res.body).toEqual({
        ...validInventory1,
        upc: calculateUPC(validInventory1.name),
        _id: expect.anything(),
        __v: expect.anything(),
      });
    });
  });
});
