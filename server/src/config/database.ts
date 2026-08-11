import mongoose from 'mongoose';

/**
 * Opens the application's single MongoDB connection before the API starts.
 * Mongoose reuses this connection when models create or read documents.
 */
export const connectDatabase = async (): Promise<void> => {
  const connectionUri = process.env.MONGODB_URI;

  if (!connectionUri) {
    throw new Error('MONGODB_URI is missing. Add it to server/.env before starting the API.');
  }

  // Rejects query fields that are not defined in a Mongoose schema.
  mongoose.set('strictQuery', true);
  await mongoose.connect(connectionUri);

  console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
};
