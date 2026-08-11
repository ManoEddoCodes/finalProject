const express = require("express");
const { body } = require("express-validator");
const categoryController = require("../controllers/categoryController.js");
const requireAuth = require("../middleware/requireAuth.js");
const requireRole = require("../middleware/requireRole.js");
const validator = require("../middleware/validator.js");

const router = express.Router();

router
  .route("/")
  .get(categoryController.listCategories)
  .post(
    requireAuth,
    requireRole("admin"),
    [body("name").trim().notEmpty().withMessage("Category name is required")],
    validator,
    categoryController.createCategory,
  );

router.route("/:id").get(categoryController.getCategory);

module.exports = router;
