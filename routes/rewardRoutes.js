const express = require("express");
const router = express.Router();
const { getCatalog, redeemReward } = require("../controllers/rewardController");

// Ver catálogo de recompensas activas
router.get("/catalog", getCatalog);

// Canjear recompensa
router.post("/redeem", redeemReward);

module.exports = router;