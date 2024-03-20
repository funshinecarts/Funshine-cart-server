import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required."],
    },
    productId: {
      unique: true,
      type: Number,
      required: [true, "Enter Product Id"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required."],
    },
    description: {
      type: String,
      required: [true, "Product description is required."],
    },
    photo: {
      type: String,
      required: [true, "Product photo is required."],
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required."],
    },
    condition: {
      type: String,
      enum: ["new", "used"],
      required: [true, "Product condition is required."],
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
