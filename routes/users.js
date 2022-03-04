const User = require("../models/User");
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

//get a user
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { username, followersCount, followingsCount } = user._doc;
    res.status(200).json({
      username,
      following: followingsCount,
      followers: followersCount,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user

router.put("/follow/:id", auth, async (req, res) => {
  if (req.currentUser.id !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const thecurrentUser = await User.findById(req.currentUser.id);
      if (!user.followers.includes(req.currentUser.id)) {
        await user.updateOne({
          $push: { followers: req.currentUser.id },
          $set: { followersCount: user.followersCount + 1 },
        });
        await thecurrentUser.updateOne({
          $push: { followings: req.params.id },
          $set: { followingsCount: thecurrentUser.followingsCount + 1 },
        });
        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("You already follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't follow yourself");
  }
});

//unfollow a user

router.put("/unfollow/:id", auth, async (req, res) => {
  if (req.currentUser.id !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const thecurrentUser = await User.findById(req.currentUser.id);
      if (user.followers.includes(req.currentUser.id)) {
        await user.updateOne({
          $pull: { followers: req.currentUser.id },
          $set: { followersCount: user.followersCount - 1 },
        });
        await thecurrentUser.updateOne({
          $pull: { followings: req.params.id },
          $set: { followingsCount: thecurrentUser.followingsCount - 1 },
        });
        res.status(200).json("User has been unfollowed");
      } else {
        res.status(403).json("You don't follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't unfollow yourself");
  }
});

module.exports = router;
