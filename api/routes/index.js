const express = require("express");
const router = express.Router();
const randomstring = require("randomstring");
const mongoose = require("mongoose");
const csv = require("csv-parser");
const fs = require("fs");
const math = require("mathjs");

const url =
  "mongodb://viscenter:anchoring2019@ds051831.mlab.com:51831/anchoring";

mongoose.connect(url);
mongoose.promise = global.Promise;

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
const responseSchema = new Schema({
  usertoken: {
    type: String,
    required: true,
    unique: true
  },
  group: Number,
  startTime: Number,
  endTime: Number,
  responses: Schema.Types.Mixed,
  postquestions: Schema.Types.Mixed
});

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const Response = mongoose.model("newWrapBarChart", responseSchema);

router.get("/api/userinfo", function(req, res) {
  console.log(req.session.userid);
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
  // 0 is for normal first then wrapped, 1 is vice versa

  if (!req.session.userid) {
    let token = randomstring.generate(8);
    // let group = getRandomInt(2);
    let group = 0;
    console.log(group);
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

router.post("/api/post", function(req, res) {
    let token = req.session.userid;
    let data = req.body;
    // console.log(data);
    Response.findOneAndUpdate(
        { usertoken: token, postquestions: { $exists: false } },
        {
            postquestions: data
        },
        function(err, doc) {
            if (err) return res.send(500, { error: err });
            console.log("yeaah");
            return res.send("successfully saved!");
        }
    );
});


router.post("/api/study", function(req, res) {
  let token = req.session.userid;
  let data = req.body.data;
  console.log(data);
  Response.findOneAndUpdate({ usertoken: token },{"responses": data}, function(err, doc) {
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
  if (!req.session.userid) {
    res.render("consent.html");
  } else {
    res.render("instructions.html");
  }
});

router.get("/study", function(req, res) {
  if (!req.session.userid) {
    res.render("consent.html");
  } else {
    res.render("study.html");
  }
});

router.get("/post",function(req,res){
res.render("postquestion.html");
});

router.get("/debrief", function(req, res) {
  res.render("debrief.html");
});

module.exports = router;
