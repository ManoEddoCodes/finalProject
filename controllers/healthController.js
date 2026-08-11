const { getDBState } = require('../config/db.js');

exports.getHealth = (req, res) => {
  const db = getDBState();

  res.status(200).json({
    status: 'success',
    server: 'up',
    database: db,
    timestamp: new Date().toISOString(),
  });
};