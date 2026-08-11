require('dotenv').config()
const mongoose = require('mongoose')

const MONGO_URI = process.env.MONGO_URI

let isConnected = false
 
const connectDB = async () => {
  if (!MONGO_URI) {
    console.error('[DB] MONGO_URI is not set in the environment.')
    throw new Error('MONGO_URI is not set');
  }
 
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(MONGO_URI)
    isConnected = true
    console.log('[DB] MongoDB connected successfully.')
  } catch (err) {
    isConnected = false
    console.error('[DB] MongoDB connection failed:', err.message)
    throw err
  }
 
  mongoose.connection.on('disconnected', () => {
    isConnected = false
    console.warn('[DB] MongoDB disconnected.')
  })
 
  mongoose.connection.on('reconnected', () => {
    isConnected = true
    console.log('[DB] MongoDB reconnected.')
  })
}

const getDBState = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    connected: mongoose.connection.readyState === 1,
    state: states[mongoose.connection.readyState] || 'unknown',
  };
};
 
module.exports = { connectDB, getDBState }