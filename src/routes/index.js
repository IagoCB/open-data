const express = require("express");
const router = express.Router();
const { getApiData } = require("../controllers/openBankingController");

router.get("/api-data", getApiData);

router.get("/health", (req, res) => {
  res.status(200).json({ status: "API is running" });
});

module.exports = router;
