const express = require("express");

const { imageUpload } = require("../utils/upload");
const { predictFromImage, predictFromText } = require("../controllers/predictionController");

const router = express.Router();

router.post("/image", imageUpload.single("image"), predictFromImage);
router.post("/text", predictFromText);

module.exports = router;
