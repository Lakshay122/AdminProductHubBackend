//create Product
//edit Product
//fetch Products on the basis of user login and apply the pagination
//fetch single product
///for fetch make a route post and get route if id come in body then give that user data otherwise give login user data

const catchAsyncError = require("../middleware/catchAsyncError");
const Product = require("../models/Product");
const { imagePush, deleteImage } = require("../utilis/cloudnary");
const ErrorHandler = require("../utilis/errorhandler");

exports.createProduct = catchAsyncError(async (req, res, next) => {
  const image = req.files?.image;
  const imageData = image ? await imagePush(image, "category") : {};
  try {
    req.body.user = req.user._id;

    const product = await Product.create({ ...req.body, ...imageData });
    res.status(201).json({
      success: true,
      message: "Product created successfully",
    });
  } catch (err) {
    //delete uploaded image
    if (imageData.image_key) {
      deleteImage(imageData.image_key);
    }

    return next(new ErrorHandler(`error: ${err.message} `, 400));
  }
});

exports.updateProduct = catchAsyncError(async (req, res, next) => {
  const productId = req.params.id;
  const userId = req.user._id;

  // Check if the product ID is valid and if the product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Check if the logged-in user is authorized to update the product
  if (product.user.toString() !== userId.toString()) {
    return next(
      new ErrorHandler("You are not authorized to update this product", 403)
    );
  }

  const image = req.files?.image;
  let imageData = {};
  if (image) {
    try {
      imageData = await imagePush(image, "category");
    } catch (err) {
      return next(new ErrorHandler(`Image upload failed: ${err.message}`, 400));
    }
  }

  try {
    req.body.user = userId;
    const updatedProductData = { ...req.body, ...imageData };

    // Update the product with the new data
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedProductData,
      {
        new: true,
        runValidators: true,
      }
    );

    // Delete the previous image if a new image is uploaded
    if (product.image_key) {
      await deleteImage(product.image_key);
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    // Delete the newly uploaded image if there was an error
    if (imageData.image_key) {
      await deleteImage(imageData.image_key);
    }

    return next(new ErrorHandler(`Error: ${err.message}`, 400));
  }
});

exports.fetchProducts = catchAsyncError(async (req, res, next) => {
  const userId = req?.body?.userId || req.user._id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  try {
    // Fetch products with pagination and user filter
    const products = await Product.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count total products for the user
    const totalProducts = await Product.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      products,
      userName: req.user?.name,
    });
  } catch (err) {
    return next(
      new ErrorHandler(`Error fetching products: ${err.message}`, 500)
    );
  }
});

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    // Check if the product ID is valid and if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Check if the logged-in user is authorized to update the product
    if (product.user.toString() !== userId.toString()) {
      return next(
        new ErrorHandler("You are not authorized to update this product", 403)
      );
    }
    await Product.findByIdAndDelete(productId);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(`Error: ${error.message}`, 400));
  }
});
