const Message = require('../models/messageModel.js');
const AppError = require('../utils/appError.js');
const asyncHandler = require('../utils/asyncHandler.js');

exports.postAnnouncement = asyncHandler(async (req, res, next) => {
  const { eventId, text } = req.body;
  const message = await Message.create({ event: eventId, sender: req.user.id, text });
  const populated = await message.populate('sender', 'name role');

  const io = req.app.get('io');
  io.to(eventId).emit('announcement', populated); 

  res.status(201).json({ status: 'success', data: populated });
});

exports.getAnnouncements = asyncHandler(async (req, res) => {
  const messages = await Message.find({ event: req.params.eventId })
    .populate('sender', 'name email')
    .sort('createdAt');
  res.status(200).json({ status: 'success', data: messages });
});