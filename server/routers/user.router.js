const express = require("express");
let router = express.Router();

const User = require("../models/user.model");
const userService = require("../services/user.service");

router.get("/login", async function (req, res) {});

module.exports = router;
