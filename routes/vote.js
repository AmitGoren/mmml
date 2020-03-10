var fs = require('fs');

var express = require('express');
var url = require('url');

var snoowrap = require('snoowrap')

var router = express.Router();

let rawconf = fs.readFileSync('conf.json');
let rawposts = fs.readFileSync('posts.0');

var conf = JSON.parse(rawconf);

var r = new snoowrap({
  userAgent: '0',
  clientId: conf.client_id,
  clientSecret: conf.client_secret,
  username: conf.username,
  password: conf.password
});

// Parse a list of all of the posts specified
var posts = rawposts.toString().replace(/\0/g, '').split('\n');

function getImage(url, body) {
  var urlSuffix = url.substr(url.length - 3);
  if (urlSuffix === "jpg" || urlSuffix === "png" || url.includes("imgur")) {
    return url;
  }

  var bodyWords = body.split(/[\s\n()]+/);
  var url = "";
  bodyWords.forEach((w) => {
      if (w.includes("imgur")) {
        console.log(w);
        url = w;
      }
    });
  return url;
}

router.get('/', function(req, res, next) {
  // Redirect to use random posts if not specified
  if (req.query.l && req.query.r) {
    var c = new Object();

    c.id_0 = req.query.l;
    c.id_1 = req.query.r;

    Promise.all([r.getSubmission(c.id_0).url,
                 r.getSubmission(c.id_1).url,
                 r.getSubmission(c.id_0).selftext,
                 r.getSubmission(c.id_1).selftext]).then((v) => {
        c.link_0 = v[0];
        c.link_1 = v[1];

        c.img_0 = getImage(v[0].toString(), v[2].toString());
        c.img_1 = getImage(v[1].toString(), v[3].toString());
        fs.appendFileSync('images.0', c.img_0 + "\n" + c.img_1 + "\n");
        res.render('vote', c);
      });
  } else {
    var id0 = posts[Math.floor(Math.random() * posts.length)];
    var id1 = posts[Math.floor(Math.random() * posts.length)];
    console.log("Redirecting to " + "/vote?l=" + id0 + "&r=" + id1);
    res.redirect("/vote?l=" + id0 + "&r=" + id1);
  }
});

module.exports = router;
