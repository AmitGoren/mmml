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

var router = express.Router();

router.get('/', function(req, res, next) {
  if (req.query.picture_0 == undefined || req.query.picture_1 == undefined
      || req.query.preference == undefined || req.query.preference < 0
      || req.query.preference > 2 || req.query.a < 0 || req.query.b < 0) {
    res.status(418);
    res.send("Error in the GET parameters.");
  } else {
    res.redirect('vote');

    var q = "INSERT INTO votes (picture_0, picture_1, preference) values ("
    + req.query.picture_0 + "," + req.query.picture_1 + "," + req.query.preference + ");";
    con.query(q, (err, res) => {
      if (err)
        console.log("[mysql error]",err);
        //throw err;
    });
  }

});

module.exports = router;
