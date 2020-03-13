const express = require('express');
const mysql = require('mysql');

var router = express.Router();

const config = require('../config.json');

var con = mysql.createConnection(config.database);

// Connect to the database
con.connect((err) => {
  if (err)
    throw err;

  console.log("Connected to database");
});

function getRandomPicture() {
  var q = "SELECT id, filename, age, sex FROM pictures WHERE id IN (SELECT id FROM (SELECT id FROM \
    pictures ORDER BY RAND() LIMIT 1) t);";
  return new Promise((resolve, reject) => {
    con.query(q, (err, res) => {
      if(err)
        reject(err);

      resolve(res[0]);
    });
  });
}

// Returns a different picture from the same sex and age as the picture given
function getComparablePicture(picture) {
  // Calculate the age range
  var ln = Math.log(picture.age);
  var min_age = Math.exp(ln / config.age_deviation);
  var max_age = Math.exp(config.age_deviation * ln);

  var q = "SELECT id, filename, age, sex FROM pictures WHERE "
          + Math.round(min_age) + " < age AND age < " + Math.round(max_age)
          + " AND sex = " + picture.sex + " AND NOT id = " + picture.id
          + " ORDER BY RAND() LIMIT 1;";
  return new Promise((resolve, reject) => {
    con.query(q, (err, res) => {
      if (err)
        reject(err);

      resolve(res[0]);
    });
  });
}

router.get('/', function(req, res, next) {
  if (req.query.picture_0 && req.query.picture_0) {
    var c = new Object();

    const q = "SELECT id, filename FROM pictures WHERE id IN (" + req.query.picture_0
              + "," + req.query.picture_1 + ");";
    con.query(q, (err, pic) => {
      if (err)
        throw err;

      if (req.query.picture_0 < req.query.picture_1) {
        c.picture_0 = pic[0];
        c.picture_1 = pic[1];
      }
      else {
        c.picture_0 = pic[1];
        c.picture_1 = pic[0];
      }

      res.render('vote', c);
    });
  } else {
    // Redirect to use random pictures
    getRandomPicture().then((picture_0) => {
      getComparablePicture(picture_0).then((picture_1) => {
        res.redirect("/vote?picture_0=" + picture_0.id + "&picture_1=" + picture_1.id);
      });
    });
  }
});

module.exports = router;
