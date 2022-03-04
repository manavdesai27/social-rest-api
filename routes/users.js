const User = require("../models/User");
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

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
  if (req.currentUser.id !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const thecurrentUser = await User.findById(req.currentUser.id);
      if (!user.followers.includes(req.currentUser.id)) {
        await user.updateOne({ $push: { followers: req.currentUser.id } });
        await thecurrentUser.updateOne({
          $push: { followings: req.params.id },
        });
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
  if (req.currentUser.id !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const thecurrentUser = await User.findById(req.currentUser.id);
      if (user.followers.includes(req.currentUser.id)) {
        await user.updateOne({ $pull: { followers: req.currentUser.id } });
        await thecurrentUser.updateOne({
          $pull: { followings: req.params.id },
        });
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
