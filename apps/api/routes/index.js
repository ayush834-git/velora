const express = require("express");

const { getHealth } = require("../controllers/healthController");

const moviesRoutes = require("./movies");

const router = express.Router();

router.get("/", getHealth);

// mount movies routes under /api
router.use("/api", moviesRoutes);

module.exports = router;