const request = require("supertest");
const app = require("../src/app");

describe("API Endpoints", () => {
  it("should return API health status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "API is running");
  });
});
