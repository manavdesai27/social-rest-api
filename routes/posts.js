const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

//create a post

router.post("/", auth, async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json({
      Id: savedPost._id,
      Title: savedPost.title,
      Desc: savedPost.desc,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});
//update a post

// router.put("/:id", auth, async (req, res) => {
//   var token = req.headers["x-access-token"];
//   var currentUser = jwt.decode(token, process.env.TOKEN_SECRET).id;
//   var currentUserId = await User.collection.findOne({ email: currentUser });
//   var currentUserId = String(currentUserId._id);

//   try {
//     const post = await Post.findById(req.params.id);
//     console.log("post", typeof post.userId);
//     console.log("currentUserId", typeof currentUserId);
//     if (post.userId == currentUserId) {
//       await post.updateOne({ $set: req.body });
//       res.status(200).json("the post has been updated");
//     } else {
//       res.status(403).json("you can update only your post");
//     }
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });
//delete a post

router.delete("/:id", auth, async (req, res) => {
  var token = req.headers["x-access-token"];
  var currentUser = jwt.decode(token, process.env.TOKEN_SECRET).id;
  var currentUserId = await User.collection.findOne({ email: currentUser });
  var currentUserId = String(currentUserId._id);

  try {
    const post = await Post.findById(req.params.id);
    if (post.userId == currentUserId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//like / dislike a post

router.put("/:id/like", auth, async (req, res) => {
  var token = req.headers["x-access-token"];
  var currentUser = jwt.decode(token, process.env.TOKEN_SECRET).id;
  var currentUserId = await User.collection.findOne({ email: currentUser });
  var currentUserId = String(currentUserId._id);

  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(currentUserId)) {
      await post.updateOne({ $push: { likes: currentUserId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: currentUserId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//Comment a post

router.put("/:id/comment", auth, async (req, res) => {
  const comment = req.body.comment;
  var token = req.headers["x-access-token"];
  var currentUser = jwt.decode(token, process.env.TOKEN_SECRET).id;
  var currentUserId = await User.collection.findOne({ email: currentUser });
  var currentUserId = String(currentUserId._id);

  try {
    const post = await Post.findById(req.params.id);
    await post.updateOne({
      $push: {
        comments: {
          comment: comment,
          userId: currentUserId,
        },
      },
    });
    res.status(200).json("The post has been commented");
  } catch (err) {
    res.status(500).json(err);
  }
});
//get a post

router.get("/:id", auth, async (req, res) => {
  var token = req.headers["x-access-token"];
  var currentUser = jwt.decode(token, process.env.TOKEN_SECRET).id;
  var currentUserId = await User.collection.findOne({ email: currentUser });
  var currentUserId = String(currentUserId._id);
  console.log("currentUserId", currentUserId);

  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json({
      Likes: post.likes.length,
      Comments: post.comments.length,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts

router.get("/timeline/all", auth, async (req, res) => {
  try {
    var token = req.headers["Authorization"];
    var currentUserJWT = jwt.decode(token, process.env.TOKEN_SECRET).id;
    var currentUserId = await User.collection.findOne({
      email: currentUserJWT,
    });
    console.log("timeline token", token);
    const currentUser = currentUserId;

    const userPosts = await Post.find({ userId: currentUser._id }).sort({
      createdAt: -1,
    });
    // const friendPosts = await Promise.all(
    //   currentUser.followings.map((friendId) => {
    //     return Post.find({ userId: friendId });
    //   })
    // );
    // res.json(userPosts.concat(...friendPosts));
    res.json(userPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
