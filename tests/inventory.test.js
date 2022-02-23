require("dotenv").config();
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");
const {
  calculateUPC,
  createNewInventory,
  deleteAllInventory,
} = require("../services/inventory.service");

describe("INVENTORY routes", () => {
  let validInventory1;
  let validInventory2;

  beforeAll(async () => {
    await mongoose.disconnect();
    await mongoose.connect(process.env.TEST_URL);

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

  beforeEach(async () => {
    await deleteAllInventory();
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

    test("should return 400 if name is not supplied", async () => {
      let noNameInventory = {
        description: validInventory1.description,
        cost: validInventory1.cost,
        amount: validInventory1.amount,
      };
      const res = await request(app)
        .post("/inventory")
        .type("form")
        .send(noNameInventory)
        .set("Accept", "application/json")
        .expect(400);

      expect(res.body).toEqual({
        message: "Inventory validation failed: name: Path `name` is required.",
      });
    });
  });

  describe("GET /inventory", () => {
    test("should return 200 and return all inventory items", async () => {
      await createNewInventory(validInventory1);
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
      await createNewInventory(validInventory1);
      const res = await request(app)
        .get("/inventory")
        .type("form")
        .query({ upc: calculateUPC(validInventory1.name) })
        .set("Accept", "application/json")
        .expect(200);

      expect(res.body).toEqual({
        ...validInventory1,
        upc: calculateUPC(validInventory1.name),
        _id: expect.anything(),
        __v: expect.anything(),
      });
    });

    test("should return 200 with no inventory that matches invalid UPC", async () => {
      await createNewInventory(validInventory1);
      const res = await request(app)
        .get("/inventory/")
        .type("form")
        .set("Accept", "application/json")
        .query({ upc: "invalidUPC" })
        .expect(200);

      expect(res.body).toEqual({});
    });

    test("should return 200 with one inventory item that matches id", async () => {
      const test_inventory = await createNewInventory(validInventory1);
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

    test("should return 500 if a query is made with an invalid mongoose object id", async () => {
      await createNewInventory(validInventory1);
      const res = await request(app)
        .get("/inventory/invalidId")
        .type("form")
        .set("Accept", "application/json")
        .expect(500);

      expect(res.body).toEqual({
        message:
          'Cast to ObjectId failed for value "invalidId" (type string) at path "_id" for model "Inventory"',
      });
    });
  });

  describe("PUT /inventory", () => {
    test("should return 200 if an object is successfully updated", async () => {
      const inventoryToUpdate = await createNewInventory(validInventory1);
      const updateBody = { amount: 50 };
      const res = await request(app)
        .put(`/inventory/${inventoryToUpdate._id}`)
        .type("form")
        .send({ amount: 50 })
        .set("Accept", "application/json")
        .expect(200);

      expect(res.body).toEqual({
        message: `Inventory item with id: ${inventoryToUpdate._id} updated.`,
        updatedInventory: {
          _id: `${inventoryToUpdate._id}`,
          name: validInventory1.name,
          description: validInventory1.description,
          amount: updateBody.amount,
          cost: validInventory1.cost,
          upc: calculateUPC(validInventory1.name),
          __v: 0,
        },
      });
    });
  });

  describe("DELETE /inventory", () => {
    test("should first return 200 and get 2 valid inventory pieces then return 204 and delete all inventory then return 200 with no inventory", async () => {
      await createNewInventory(validInventory1);
      await createNewInventory(validInventory2);
      const getRes1 = await request(app)
        .get("/inventory")
        .type("form")
        .set("Accept", "application/json")
        .expect(200);

      expect(getRes1.body.length).toBe(2);
      expect(getRes1.body[0]).toEqual({
        ...validInventory1,
        upc: calculateUPC(validInventory1.name),
        _id: expect.anything(),
        __v: expect.anything(),
      });
      expect(getRes1.body[1]).toEqual({
        ...validInventory2,
        upc: calculateUPC(validInventory2.name),
        _id: expect.anything(),
        __v: expect.anything(),
      });

      const delRes = await request(app)
        .delete("/inventory")
        .type("form")
        .set("Accept", "application.json")
        .expect(204);

      const getRes2 = await request(app)
        .get("/inventory")
        .type("form")
        .set("Accept", "application/json")
        .expect(200);

      expect(getRes2.body.length).toBe(0);
    });

    test("should first return 200 and get 2 valid inventory pieces then return 200 when deleting a single piece of inventory then return 200 with one piece of inventory", async () => {
      const inventoryToDelete = await createNewInventory(validInventory1);
      await createNewInventory(validInventory2);
      const getRes1 = await request(app)
        .get("/inventory")
        .type("form")
        .set("Accept", "application/json")
        .expect(200);

      expect(getRes1.body.length).toBe(2);
      expect(getRes1.body[0]).toEqual({
        ...validInventory1,
        upc: calculateUPC(validInventory1.name),
        _id: expect.anything(),
        __v: expect.anything(),
      });
      expect(getRes1.body[1]).toEqual({
        ...validInventory2,
        upc: calculateUPC(validInventory2.name),
        _id: expect.anything(),
        __v: expect.anything(),
      });

      const delRes = await request(app)
        .delete(`/inventory/${inventoryToDelete._id}`)
        .type("form")
        .set("Accept", "application.json")
        .expect(200);

      expect(delRes.body).toEqual({
        message: `Inventory item with id: ${inventoryToDelete._id} deleted.`,
        deletedInventory: {
          _id: `${inventoryToDelete._id}`,
          name: validInventory1.name,
          description: validInventory1.description,
          amount: validInventory1.amount,
          cost: validInventory1.cost,
          upc: `${inventoryToDelete.upc}`,
          __v: 0,
        },
      });

      const getRes2 = await request(app)
        .get("/inventory")
        .type("form")
        .set("Accept", "application/json")
        .expect(200);

      expect(getRes2.body.length).toBe(1);
      expect(getRes2.body[0]).toEqual({
        ...validInventory2,
        upc: calculateUPC(validInventory2.name),
        _id: expect.anything(),
        __v: expect.anything(),
      });
    });
  });
});
