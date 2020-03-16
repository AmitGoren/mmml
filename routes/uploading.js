const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const fs = require("fs");
const crypto = require('crypto');
const axios = require('axios').default;
const sharp = require('sharp');

const config = require('../config.json');

var router = express.Router();

const azure_options = {
  headers: {
    'Content-Type': 'application/octet-stream',
    'Ocp-Apim-Subscription-Key': config.azure.key
  },
  params: {
    'returnFaceId': 'false',
    'returnFaceLandmarks': 'false',
    'returnFaceAttributes': 'age,gender'
  }
};

var con = mysql.createConnection(config.database);

// Connect to the database
con.connect((err) => {
  if (err)
    throw err;

  console.log("Connected to database");
});

// Automatically validate, crop, resize, encode, save the picture and insert the data to the databaseu
function processImage(path) {
  var filename = crypto.randomBytes(6).toString("base64").substring(0, 6); // Generate a random filename, the file will be renamed

  const imageBuffer = fs.readFileSync(path);

  return new Promise((resolve, reject) => {
    // Find the properties of the face
    axios.post(`${config.azure.endpoint}/face/v1.0/detect`, imageBuffer, azure_options).then((res) => {
      if (!res.data[0])
        reject("No faces detected.");
      else {
        var fp = new Object();

        fp.sex = 0;
        switch (res.data[0].faceAttributes.gender) {
          case 'male':
          fp.sex = 1;
          break;
          case 'female':
          fp.sex = 2;
          break;
        }

        fp.age = res.data[0].faceAttributes.age * config.upload_processing.age_multiplier;

        fp.rect = res.data[0].faceRectangle;

        // Crop and resize the image
        var img = sharp(path);
        console.log(1);
        // .then((img) => {
          // Calculate where to crop the picture
          const croppedSize = Math.sqrt(fp.rect.width * fp.rect.height) / config.upload_processing.face_area;

          cropRect = {
            top: Math.floor(Math.max(0, fp.rect.top + fp.rect.height/2 - croppedSize/2)),
            left: Math.floor(Math.max(0, fp.rect.left + fp.rect.width/2 - croppedSize/2))
          };
          img.metadata().then((m) => {
            cropRect.width = Math.floor(Math.min(croppedSize, m.width - cropRect.left));
            cropRect.height = Math.floor(Math.min(croppedSize, m.height - cropRect.top));
            console.log(cropRect);

            // Crop and write the picture
            img
            .extract(cropRect)
            .resize(
              Math.floor(
                (cropRect.width == cropRect.height)
                ? config.upload_processing.size
                : cropRect.width / cropRect.height * config.upload_processing.size),
                Math.floor(config.upload_processing.size))
                .toFile(config.dir.pictures + filename + ".jpg", (err) => { if (err) reject(err) });

                // Insert the data about the picture to the database
                const q = `INSERT INTO pictures (filename, age, sex, public) VALUES ("${filename}.jpg", ${Math.floor(fp.age)}, ${fp.sex}, true)`;
                console.log(q);
                con.query(q, (err, res) => {
                  console.log(4);
                  if(err)
                  reject(err);

                  resolve();
                });
                console.log(5);
              }).catch((err) => reject(err));
      }
    });
  });
}

const storage = multer.diskStorage({
  destination: config.dir.tmp,
  filename: function(req, file, cb) {
    //var filename = crypto.randomBytes(3).toString("base64").substring(0, 3); // Generate a random filename, the file will be renamed
    cb(null, Date.now() + "_" + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 3000000 }, // Limit the filesize to 3 MB
  fileFilter: function(req, file, cb) {
    var isImage = file.mimetype.startsWith("image/");
    isImage
    ? cb(null, true)
    : cb(new Error('The file is not an image'));
  }
}).single('i');

router.post('/', upload, (req, res, next) => {
  upload(req, res, (err) => {
    if (err)
      res.render('upload', { msg: "Error: " + err.message });
    else {
      processImage(req.file.path).then(() => res.send("uploaded")).catch((err) => res.send(err));
    }
  });
});

module.exports = router;
