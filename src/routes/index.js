const express = require("express");
const router = express.Router();
const express = require('express');
const { getApiData } = require('../controllers/openBankingController');

// Endpoint de exemplo
router.get('/api-data', getApiData);
router.get("/health", (req, res) => {
  res.status(200).json({ status: "API is running" });
});

module.exports = router;
