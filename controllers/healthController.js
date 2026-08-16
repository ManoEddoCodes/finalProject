const { getDBState } = require('../config/db.js');

exports.getHealth = (req, res) => {
  const db = getDBState();
  res.status(200).json({
    status: 'ok',     
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    database: db.state,
  });
};