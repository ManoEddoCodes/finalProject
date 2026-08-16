const express = require('express');
const { body } = require('express-validator');
const announcementController = require('../controllers/announcementController.js');
const requireAuth = require('../middleware/requireAuth.js');
const requireRole = require('../middleware/requireRole.js');
const validator = require('../middleware/validator.js');

const router = express.Router();

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  [body('eventId').isMongoId(), body('text').trim().notEmpty()],
  validator,
  announcementController.postAnnouncement
);

router.get('/:eventId', announcementController.getAnnouncements);

module.exports = router;