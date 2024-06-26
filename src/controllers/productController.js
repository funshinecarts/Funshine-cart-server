import ErrorHandler from "../middlewares/error/errorHandler.js";
import Branch from "../models/branchModel.js";
import Product from "../models/productModel.js";
import Sale from "../models/saleModel.js";
import catchAsyncError from "../utils/catchAsyncError.js";
import deleteFile from "../utils/files/deleteFile.js";
import { fileUrlParser } from "../utils/files/fileUrlParser.js";
import { uploadImage } from "../utils/uploadImage/uploadImage.js";

// Controller Function To Add a Product To DB
export const createProduct = catchAsyncError(async (req, res, next) => {
  const photos = await uploadImage(req, res, next);


  // storing the product on database
  // add a random productId to each product make sure don't repeat
  const productId = Math.floor(100000 + Math.random() * 900000);

  const product = await Product.create({ ...req.body, photos, productId });
  res.status(200).json({
    success: true,
    message: "Product Added Successfully",
    product,
  });




});

// Controller function to get all products with total stock and branch-wise stock
export const getProductDetails = catchAsyncError(async (req, res, next) => {
  // Fetch single products
  const { id } = req.params;
  const product = await Product.findById(id);

  res.status(200).json({
    success: true,
    product
  });
});

// Controller function to get all products with total stock and branch-wise stock
export const getProductList = catchAsyncError(async (req, res, next) => {
  // Fetch all products
  const products = await Product.find().sort({ createdAt: -1 });;

  res.status(200).json({
    success: true,
    products
  });
});

// Controller function to delete product
export const deleteProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // throwing error if there is no product id
  if (!id) return next(new ErrorHandler(400, "Product Id Required"));

  // getting the product first from the database to get image url
  const product = await Product.findById(id);

  // deleting the product
  await Product.findByIdAndDelete(id);

  // sending response back to client
  res.status(200).json({
    success: true,
    message: "Product Deleted!",
  });
});


// controller function to update the product
export const editProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // searching for product with the req id
  const product = await Product.findById(id);

  // sending error if there is no product with the id
  if (!product)
    return next(new ErrorHandler(400, "No Product Found With This Id"));

  // Update only the specified fields from req.body
  console.log(req.body, 'req.body')
  const { stock } = req.body; // Update these fields as needed
  console.log(stock, 'stock')
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { stock },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Edit Product was Successful",
    product: updatedProduct,
  });
});


// controller function to search product
export const searchProduct = catchAsyncError(async (req, res, next) => {
  const { productId } = req.query;

  // searching for product with the custom product id
  const product = await Product.findOne({ productId });

  // throwing error if product id doesn't matches any any id
  if (!product)
    return next(new ErrorHandler(404, "No product found with this id"));

  // searching for branches the product is available
  const branches = await Branch.aggregate([
    { $match: { "products.id": product._id } },
    {
      $project: {
        _id: 0,
        name: 1,
        quantity: {
          $arrayElemAt: [
            {
              $map: {
                input: {
                  $filter: {
                    input: "$products",
                    cond: { $eq: ["$$this.id", product._id] },
                  },
                },
                as: "product",
                in: "$$product.quantity",
              },
            },
            0,
          ],
        },
      },
    },
  ]);

  // Search for sales that include the product
  const sales = await Sale.find({ "items.id": product.productId }).populate(
    "branch"
  );

  // sending the product and the branchs the product available in
  res.status(200).json({
    success: true,
    product: { ...product._doc, branches, sales },
  });
});
