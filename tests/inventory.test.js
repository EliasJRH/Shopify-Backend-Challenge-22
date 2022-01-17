const request = require("supertest");
const httpStatus = require("http-status");
const app = require("../index");

describe("INVENTORY routes", () => {
  describe("POST /inventory", () => {
    let validInventory;
    beforeEach(() => {
      validInventory = {
        name: "Bananas",
        description: "Good ready to eat bananas",
        amount: 1000,
        cost: 4,
      };
    });

    test("should return 201 and successfully create new inventory with all the data", async () => {
      const res = await request(app)
        .post("/inventory")
        .type("form")
        .send(validInventory)
        .set("Accept", "application/json")
        .expect(201);

      expect(res.body).toEqual({
        name: validInventory.name,
        description: validInventory.description,
        amount: validInventory.amount,
        cost: validInventory.cost,
        upc: expect.anything(),
      });
    });
  });
});
