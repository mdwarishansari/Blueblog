require("dotenv").config({ path: "./.env" });

const { v2: cloudinary } = require("cloudinary");

console.log("Cloudinary runtime config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY?.slice(0, 6),
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.uploader
  .upload("https://res.cloudinary.com/demo/image/upload/sample.jpg", {
    folder: "test",
  })
  .then((res) => {
    console.log("UPLOAD OK:", res.secure_url);
  })
  .catch((err) => {
    console.error("UPLOAD FAILED:", err);
  });
