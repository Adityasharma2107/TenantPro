import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const connectionUri = process.env.MONGODB_URI;

  if (!connectionUri) {
    throw new Error('MONGODB_URI is missing. Add it to server/.env before starting the API.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(connectionUri);

  console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
};
