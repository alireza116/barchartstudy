const express = require("express");
const router = express.Router();
const randomstring = require("randomstring");
const mongoose = require("mongoose");
const csv = require("csv-parser");
const fs = require("fs");
const math = require("mathjs");

// const url =
//   "mongodb://markant:emotion2019@ds159025.mlab.com:59025/markantstudy";

const url =
  "mongodb://viscenter:anchoring2019@ds051831.mlab.com:51831/anchoring";

mongoose.connect(url);
mongoose.promise = global.Promise;

// const db = mongoose.anchoring;

function zip() {
  let args = [].slice.call(arguments);
  let shortest =
    args.length === 0
      ? []
      : args.reduce(function(a, b) {
          return a.length < b.length ? a : b;
        });

  return shortest.map(function(_, i) {
    return args.map(function(array) {
      return array[i];
    });
  });
}

const Schema = mongoose.Schema;

//stance : 1 == for  & 0 == against
// claim : 1== high  & 0 == low
// block: 1== Block & 0 == turn
// sentiment: 1== Hight & 0 == low
const responseSchema = new Schema({
  usertoken: {
    type: String,
    required: true,
    unique: true
  },
  group: Number,
  startTime: Number,
  endTime: Number,
  firstBar: Schema.Types.Mixed,
  secondBar: Schema.Types.Mixed
});

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const Response = mongoose.model("wrapBarChart", responseSchema);

router.get("/api/userinfo", function(req, res) {
  if (req.session.userid) {
    res.json({
      group: req.session.group,
      token: req.session.userid
    });
  } else {
    res.send("please give consent first");
  }
});

router.get("/api/consent", function(req, res) {
  // 0 is low 1 is high 2 is control //
  // for order 0 is basic anchoring first, then with map visualization and 1 is map visualization first and then basic anchoring//

  if (!req.session.userid) {
    let token = randomstring.generate(8);
    let group = getRandomInt(2);
    req.session.userid = token;
    req.session.group = group;
    let newResponse = new Response({
      usertoken: token,
      group: group
    });

    newResponse.save(function(err) {
      if (err) console.log(err);
      res.send({ user: token, group: group });
    });
  } else {
    res.send("consent already given");
  }
});

router.post("/api/study", function(req, res) {
  let token = req.session.userid;
  let data = req.body.data;
  console.log(data);
  Response.findOneAndUpdate({ usertoken: token }, data, function(err, doc) {
    if (err) {
      return res.send(500, { error: err });
    }
    return res.send(200, `successfully saved responses`);
  });
});

router.get("/", function(req, res) {
  if (req.session.completed) {
    res.render("debrief.html");
  } else {
    res.render("consent.html");
  }
});

router.get("/consent", function(req, res) {
  if (req.session.completed) {
    res.render("debrief.html");
  } else {
    res.render("consent.html");
  }
});

router.get("/instructions", function(req, res) {
  if (req.session.completed) {
    res.render("debrief.html");
  } else {
    res.render("instructions.html");
  }
});

router.get("/study", function(req, res) {
  if (!req.session.completed) {
    res.render("study.html");
  } else {
    res.render("debrief.html");
  }
});

router.get("/debrief", function(req, res) {
  res.render("debrief.html");
});

module.exports = router;
