const express = require('express');
const mysql = require('mysql');

var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('upload', {});
});

module.exports = router;
