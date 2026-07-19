const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({   // basically it integrates backend with cloudinary storage.
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({    // after integration, storage will be defined.
  cloudinary: cloudinary,
  params: {
    folder: 'wanderlust_DEV',
    allowedFormat: ["png" , "jpg" , "jpeg" , "avif"],
    public_id: (req, file) => 'computed-filename-using-request',
  },
});

module.exports = {
    cloudinary,
    storage,
};