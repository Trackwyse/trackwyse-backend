import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import mongoose from 'mongoose';

export default async function globalSetup() {
  const instance = await MongoMemoryServer.create();
  const uri = instance.getUri();
  (global as any).__MONGOINSTANCE = instance;
  process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));

  // The following is to make sure the database is clean before an test starts
  await mongoose.connect(`${process.env.MONGO_URI}`, {
    dbName: 'testSuite',
  });

  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}
