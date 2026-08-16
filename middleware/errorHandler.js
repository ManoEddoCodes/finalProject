const errorHandler = (err, req, res, next) => {
  if (!err) err = new Error("Unknown error");
  let statusCode = (err && err.statusCode) || 500;
  let message =
    err && err.isOperational
      ? err.message
      : "Something went wrong on the server";

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field "${err.path}"`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {}).join(", ");
    message = `Duplicate value for field: ${field}`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (process.env.NODE_ENV !== "test") {
    const method = req && req.method ? req.method : "N/A";
    const url = req && req.originalUrl ? req.originalUrl : "N/A";
    console.error(
      `[ERROR] ${method} ${url} -> ${statusCode}:`,
      err && err.message ? err.message : err,
    );
  }

  if (res && typeof res.status === "function") {
    return res.status(statusCode).json({
      status: statusCode >= 500 ? "error" : "fail",
      message,
    });
  }

  // If no response object is available (handler called incorrectly), log and swallow.
  console.error("errorHandler invoked without a response object");
};

module.exports = errorHandler;
