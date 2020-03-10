var fs = require('fs');

var express = require('express');

var router = express.Router();

router.get('/', function(req, res, next) {
  fs.appendFileSync('results.0', req.query.l + " " + req.query.r + " "
                    + req.query.prefer + "\n");
  res.redirect('vote');
});

module.exports = router;
