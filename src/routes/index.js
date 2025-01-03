const express = require("express");
const router = express.Router();

// Endpoint de exemplo
router.get("/health", (req, res) => {
  res.status(200).json({ status: "API is running" });
});

module.exports = router;
