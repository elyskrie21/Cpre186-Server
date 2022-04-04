let mongoose = require("mongoose");
let passport = require("passport");
let config = require("../config/database");
require("../config/passport")(passport);
let express = require("express");
let jwt = require("jsonwebtoken");
let router = express.Router();
let User = require("../models/user");
let Product = require("../models/product");

router.post("/signup", (req, res) => {
  if (!req.body.username || !req.body.password || !req.body.email) {
    res.json({ success: false, msg: "Please pass a username, password, and email" });
  } else {
    let newUser = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email, 
    });

    // *saving user to database
    newUser.save((err) => {
      console.log(err);
      if (err) {
        return res.json({ success: false, msg: "Username already exists" });
      }
      res.json({ success: true, msg: "Successful created new user" });
    });
  }
});

router.post("/signin", (req, res) => {
  User.findOne(
    {
      username: req.body.username,
    },
    (err, user) => {
      if (err) throw err;

      if (!user) {
        res.status(401).send({
          success: false,
          msg: "Authentication failed. user not found",
        });
      } else {
        // *check if password match
        user.comparePassword(req.body.password, (err, isMatch) => {
          if (isMatch && !err) {
            // *if user is found and passwrod is right create a token
            let token = jwt.sign(user.toObject(), config.secret);
            // *return the information included token as JSON
            res.json({ success: true, token: "JWT " + token });
          } else {
            res.status(401).send({
              success: false,
              msg: "Authentication failed. Wrong password.",
            });
          }
        });
      }
    }
  );
});

router.post(
  "/product",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    var newProduct = new Product({
      url: req.body.url,
      productName: req.body.productName,
      productPrice: req.body.productPrice,
      img: req.body.img,
      user: req.user._id,
    });

    // *saving to database
    newProduct.save((err) => {
      if (err) {
        return res.json({ success: false, msg: "Save product failed" });
      }
      res.json({ success: true, msg: "Successful created new product" });
    });
  }
);

router.get(
  "/product",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user._id, (err, user) => {
      if (err) {
        return res.json({ success: false, msg: "Unable to find user" });
      }

      user
        .populate("products")
        .then((user) => {
          res.json(user.products);
        })
        .catch((err) => {
          console.log(err);
          res.json({ success: false, msg: "unable to located products" });
        });
    });
  }
);

router.get("/user", passport.authenticate("jwt", {session: false}), (req,res) => {
  User.findById(req.user.id, (err, user) => {
    if (err) {
      return res.json({ success: false, msg: "Unable to find user "})
    }

    return res.json({ success: true, user: user}); 
  })
})

module.exports = router;
