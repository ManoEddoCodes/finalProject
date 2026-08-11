const Message = require('../models/messageModel.js');
const asyncHandler = require('../utils/asyncHandler.js');
 
exports.getEventMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ event: req.params.eventId })
    .populate('sender', 'name role')
    .sort('createdAt');
 
  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: messages,
  });
});
 