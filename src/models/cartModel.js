import mongoose from "mongoose";

const cartCollection = "Cart"

const cartSchema = new mongoose.Schema({
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
      },
    ],
  });
  
export const cartModel = mongoose.model(cartCollection,cartSchema)