const Category = require('../models/categoryModel.js');
const AppError = require('../utils/appError.js');
const asyncHandler = require('../utils/asyncHandler.js');

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ status: 'success', data: category });
});

exports.listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name');
  res.status(200).json({ status: 'success', results: categories.length, data: categories });
});

exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new AppError('Category not found', 404));
  res.status(200).json({ status: 'success', data: category });
});