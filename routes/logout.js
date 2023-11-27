const express = require("express");
const router = express.Router();
const logoutController = require("../controllers/logout-controller");

router.get("/logout", logoutController.logoutUser);

module.exports = router;
