const express = require("express");
const messageController = require("../controllers/messageController.js");
const requireAuth = require("../middleware/requireAuth.js");

const router = express.Router();

router.get(
  "/:eventId/messages",
  requireAuth,
  messageController.getEventMessages,
);

module.exports = router;
