import { model, Schema, Types } from 'mongoose';

export interface IProperty {
  name: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
  };
  manager?: Types.ObjectId;
  unitCount: number;
  contactEmail?: string;
}

const propertySchema = new Schema<IProperty>(
  {
    name: { type: String, required: true, trim: true },
    address: {
      line1: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
    },
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    unitCount: { type: Number, required: true, min: 1 },
    contactEmail: { type: String, trim: true, lowercase: true },
  },
  { timestamps: true },
);

export const Property = model<IProperty>('Property', propertySchema);
