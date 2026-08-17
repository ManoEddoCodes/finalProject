const express = require("express");
const { body } = require("express-validator");
const userController = require("../controllers/userController.js");
const validator = require("../middleware/validator.js");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validator,
  userController.register,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validator,
  userController.login,
);

module.exports = router;