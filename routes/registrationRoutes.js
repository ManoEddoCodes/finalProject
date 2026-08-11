const express = require("express");
const { body } = require("express-validator");
const registrationController = require("../controllers/registrationController.js");
const requireAuth = require("../middleware/requireAuth.js");
const validator = require("../middleware/validator.js");

const router = express.Router();

router.use(requireAuth);

router.post(
  "/",
  [body("eventId").isMongoId().withMessage("A valid eventId is required")],
  validator,
  registrationController.registerForEvent,
);

router.get("/me", registrationController.getMyRegistrations);

router.delete("/:id", registrationController.cancelRegistration);

module.exports = router;
