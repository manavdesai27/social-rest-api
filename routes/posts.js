const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

//create a post

router.post("/", auth, async (req, res) => {
  const { title, desc } = req.body;
  const newPost = new Post({ userId: req.currentUser.id, title, desc });
  console.log(newPost);
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

//delete a post

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId == req.currentUser.id) {
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
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.currentUser.id)) {
      await post.updateOne({ $push: { likes: req.currentUser.id } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.currentUser.id } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//Comment a post

router.put("/:id/comment", auth, async (req, res) => {
  try {
    // const authHeader = req.headers["authorization"];
    // const token = authHeader && authHeader.split(" ")[1];
    // var currentUser = jwt.decode(token, process.env.TOKEN_SECRET).id;
    const post = await Post.findById(req.params.id);
    await post.updateOne({
      $push: {
        comments: {
          comment: comment,
          userId: req.currentUser.id,
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
    
    const userPosts = await Post.find({ userId: req.currentUser.id }).sort({
      createdAt: -1,
    });

    res.json(userPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
