const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

async function imagePush(image, folderName) {
  // Read the file to get its type
  const fileBuffer = fs.readFileSync(image.tempFilePath);

  // Check if the file type is allowed
  if (image.mimetype === "image/png" || image.mimetype === "image/jpeg") {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        image.tempFilePath,
        { folder: `thirdEssential/${folderName}` },
        (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          removeTmp(image.tempFilePath);
          const data = {
            image_key: result.public_id,
            image: result.secure_url,
          };
          resolve(data);
        }
      );
    });
  } else {
    // If file type is not allowed, reject with an error
    return Promise.reject(
      new Error("Invalid file type. Only PNG and JPEG are allowed.")
    );
  }
}

async function deleteImage(key) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(key, (err, result) => {
      if (err) reject(err);
      resolve("true");
    });
  });
}

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      console.error("Failed to remove temporary file:", err);
    }
  });
};

module.exports = { imagePush, deleteImage };
