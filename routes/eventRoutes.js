const express = require("express");
const { body } = require("express-validator");
const eventController = require("../controllers/eventController.js");
const requireAuth = require("../middleware/requireAuth.js");
const requireRole = require("../middleware/requireRole.js");
const validator = require("../middleware/validator.js");

const router = express.Router();

const eventValidationRules = [
  body("name").trim().notEmpty().withMessage("Event name is required"),
  body("date").isISO8601().toDate().withMessage("A valid date is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("capacity")
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer"),
  body("category").isMongoId().withMessage("A valid category id is required"),
];

const eventUpdateValidationRules = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Event name cannot be empty"),
  body("date")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("A valid date is required"),
  body("city").optional().trim().notEmpty().withMessage("City cannot be empty"),
  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer"),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("A valid category id is required"),
];

router
  .route("/")
  .get(eventController.listEvents)
  .post(
    requireAuth,
    requireRole("admin"),
    eventValidationRules,
    validator,
    eventController.createEvent,
  );

router
  .route("/:id")
  .get(eventController.getEvent)
  .patch(
    requireAuth,
    requireRole("admin"),
    eventUpdateValidationRules,
    validator,
    eventController.updateEvent,
  )
  .delete(requireAuth, requireRole("admin"), eventController.deleteEvent);

module.exports = router;
