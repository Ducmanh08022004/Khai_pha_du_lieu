const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.resolve(__dirname, "../../", process.env.UPLOAD_DIR || "tmp");
const maxImageSizeMB = Number(process.env.MAX_IMAGE_SIZE_MB) || 10;

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

function fileFilter(_req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"));
  }

  cb(null, true);
}

const imageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxImageSizeMB * 1024 * 1024 }
});

module.exports = {
  imageUpload
};
