const Event = require('../models/eventModel.js');
const Registration = require('../models/registrationModel.js');
const AppError = require('../utils/appError.js');
const asyncHandler = require('../utils/asyncHandler.js');

exports.registerForEvent = asyncHandler(async (req, res, next) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  if (!eventId) {
    return next(new AppError('eventId is required', 400));
  }

  const eventExists = await Event.exists({ _id: eventId });
  if (!eventExists) {
    return next(new AppError('Event not found', 404));
  }

  const updatedEvent = await Event.findOneAndUpdate(
    { _id: eventId, $expr: { $lt: ['$registrationsCount', '$capacity'] } },
    { $inc: { registrationsCount: 1 } },
    { new: true }
  );

  if (!updatedEvent) {
    return next(new AppError('Event is full', 409));
  }

  try {
    const registration = await Registration.create({ user: userId, event: eventId });
    const populated = await registration.populate('event', 'name date city capacity');

    return res.status(201).json({ status: 'success', data: populated });
  } catch (err) {
        await Event.findByIdAndUpdate(eventId, { $inc: { registrationsCount: -1 } });

        if (err.code === 11000) {
            return next(new AppError('You are already registered for this event', 409));
        }
        throw err;
    }
});

exports.getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ user: req.user.id })
    .populate({
      path: 'event',
      select: 'name description date city capacity registrationsCount category',
      populate: { path: 'category', select: 'name' },
    })
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: registrations.length,
    data: registrations,
  });
});

exports.cancelRegistration = asyncHandler(async (req, res, next) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    return next(new AppError('Registration not found', 404));
  }

  if (registration.user.toString() !== req.user.id) {
    return next(new AppError('You can only cancel your own registration', 403));
  }

  await registration.deleteOne();

  await Event.findByIdAndUpdate(registration.event, {
    $inc: { registrationsCount: -1 },
  });
  await Event.updateOne(
    { _id: registration.event, registrationsCount: { $lt: 0 } },
    { $set: { registrationsCount: 0 } }
  );

  res.status(200).json({ status: 'success', message: 'Registration cancelled' });
});