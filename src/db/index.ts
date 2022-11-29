import mongoose from 'mongoose';
import config from '../config';

const connect = async () => {
  await mongoose.connect(config.DBUri, {
    dbName: config.DBName,
  });

  mongoose.connection.on('error', (err) => {
    console.log('MongoDB connection error: ', err);
    process.exit();
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });

  console.log('MongoDB connected');
};

const disconnect = () => {
  mongoose.connection.close();
};

export default {
  connect,
  disconnect,
};
