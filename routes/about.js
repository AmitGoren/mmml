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

function getPictureFilename(id) {
  var q = `SELECT filename FROM pictures WHERE id = ${id}`;

  return new Promise((resolve, reject) => {
    con.query(q, (err, res) => {
      if(err)
        reject(err);
      resolve(res[0].filename);
    });
  });
}

function getPictureVotes(id) {
  var q = `SELECT votes.preference, p_0.filename AS f_0, p_1.filename AS f_1 \
                   FROM votes \
                 INNER \
                     JOIN pictures AS p_0 \
                       ON p_0.id = votes.picture_0 \
                 INNER \
                     JOIN pictures AS p_1 \
                       ON p_1.id = votes.picture_1 \
                 WHERE votes.picture_0 = ${id} OR votes.picture_1 = ${id};`;

  return new Promise((resolve, reject) => {
    con.query(q, (err, res) => {
      if(err)
        reject(err);
      resolve(res);
    });
  });
}

router.get('/:id', function(req, res, next) {
  Promise.all([getPictureFilename(req.params.id), getPictureVotes(req.params.id)]).then((v) => {
    console.log(v);
    res.render('about', { id: req.params.id, filename: v[0], votes: v[1] });
  });
});

module.exports = router;
