const express = require("express");

const { discover } =
require("../controllers/moviesController");

const router = express.Router();

router.get("/discover", discover);

module.exports = router;