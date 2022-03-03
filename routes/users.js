const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const auth = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

//update user
router.put("/:id", auth, async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

//delete user
router.delete("/:id", auth, async (req, res) => {

  var token = req.headers["x-access-token"];
  var currentUser = jwt.decode(token, process.env.TOKEN_SECRET).id;
  var currentUserId = await User.collection.findOne({ email: currentUser });
  var currentUserId = String(currentUserId._id);

  if (currentUserId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

//get a user
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { username, followers, followings, ...others } = user._doc;
    res.status(200).json({
      username,
      following: followings.length,
      followers: followers.length,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user

router.put("/:id/follow", auth, async (req, res) => {
  var token = req.headers["x-access-token"];
  var currentUser = jwt.decode(token, process.env.TOKEN_SECRET).id;
  var currentUserId = await User.collection.findOne({ email: currentUser });
  var currentUserId = String(currentUserId._id);
  
  if (currentUserId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const thecurrentUser = await User.findById(currentUserId);
      if (!user.followers.includes(currentUserId)) {
        await user.updateOne({ $push: { followers: currentUserId } });
        await thecurrentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollow a user

router.put("/:id/unfollow", auth, async (req, res) => {

  var token = req.headers["x-access-token"];
  var currentUser = jwt.decode(token, process.env.TOKEN_SECRET).id;
  var currentUserId = await User.collection.findOne({ email: currentUser });
  var currentUserId = String(currentUserId._id);

  if (currentUserId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const thecurrentUser = await User.findById(currentUserId);
      if (user.followers.includes(currentUserId)) {
        await user.updateOne({ $pull: { followers: currentUserId } });
        await thecurrentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

module.exports = router;
