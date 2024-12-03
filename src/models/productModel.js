import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"

const productCollection = "Product";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String,
    required: true 
  },
  available: { type: Boolean, default: true },
  stock: { type: Number, required: true, default: 0 },
  description: { type: String },
  thumbnails: { type: [String], default: [] },
});

productSchema.plugin(mongoosePaginate)

export const productModel = mongoose.model(productCollection, productSchema);
