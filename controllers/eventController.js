const Event = require('../models/eventModel.js');
const AppError = require('../utils/appError.js');
const asyncHandler = require('../utils/asyncHandler.js');

exports.createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, createdBy: req.user.id });
  const populated = await event.populate('category', 'name description');
  res.status(201).json({ status: 'success', data: populated });
});

exports.listEvents = asyncHandler(async (req, res) => {
  const { category, city, dateFrom, dateTo, search, sort } = req.query;

  const filter = {};

  if (category) filter.category = category;
  if (city) filter.city = new RegExp(`^${city}$`, 'i');

  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
  const skip = (page - 1) * limit;

  let sortOption = { date: 1 };
  if (sort === 'date') sortOption = { date: 1 };
  else if (sort === '-date') sortOption = { date: -1 };
  else if (sort === 'registrations') sortOption = { registrationsCount: 1 };
  else if (sort === '-registrations') sortOption = { registrationsCount: -1 };

  const [events, total] = await Promise.all([
    Event.find(filter)
      .populate('category', 'name description')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Event.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    results: events.length,
    data: events,
  });
});

exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate('category', 'name description');
  if (!event) return next(new AppError('Event not found', 404));
  res.status(200).json({ status: 'success', data: event });
});

exports.updateEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name description');

  if (!event) return next(new AppError('Event not found', 404));
  res.status(200).json({ status: 'success', data: event });
});

exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return next(new AppError('Event not found', 404));
  res.status(204).json({ status: 'success', data: null });
});