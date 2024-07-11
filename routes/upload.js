const express = require('express');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config();

const router = express.Router();

// AWS S3 configuration
const s3Client = new S3Client({
  region: 'ap-northeast-2', // Replace with your S3 bucket region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer configuration for file upload
const storage = multer.memoryStorage(); // Using memory storage for temporary storage of the file

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
});

// POST route for file upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload file to S3 bucket
    const uploadParams = {
      Bucket: 'mylostbucket', // Replace with your S3 bucket name
      Key: Date.now().toString() + path.extname(req.file.originalname),
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

  
    // Respond with the S3 file path
    res.status(200).json({ filePath: `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}` });
  } catch (error) {
    console.error('Upload error', error);
    res.status(500).json({ message: 'File upload failed' });
  }
});

module.exports = router;
