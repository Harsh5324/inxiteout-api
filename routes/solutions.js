const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Solutions");
const auth = require("../middleware/auth");
const { validate } = require("../middleware/validations");
const validation = require("../middleware/ValidationList");
//CREATE SOLUTIONS
router.post(
    "/",
    [auth, validate(validation.solutionSchema)],
    async (req, res) => {
        const newPost = new Post(req.body);
        try {
            const savedPost = await newPost.save();
            res.status(200).json(savedPost);
        } catch (err) {
            res.status(500).json(err);
        }
    }
);

//UPDATE SOLUTIONS
router.put(
    "/:id",
    [auth, validate(validation.solutionSchema)],
    async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
            if (post.username === req.body.username) {
                try {
                    const updatedPost = await Post.findByIdAndUpdate(
                        req.params.id,
                        {
                            $set: req.body,
                        },
                        { new: true }
                    );
                    return res.status(200).json(updatedPost);
                } catch (err) {
                    return res.status(500).json(err);
                }
            } else {
                return res.status(401).json("You can update only your post!");
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    }
);

//DELETE SOLUTIONS
router.delete("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.username === req.body.username) {
            try {
                await post.delete();
                return res.status(200).json("Post has been deleted...");
            } catch (err) {
                return res.status(500).json(err);
            }
        } else {
            return res.status(401).json("You can delete only your post!");
        }
    } catch (err) {
        return res.status(500).json(err);
    }
});

//GET SOLUTIONS
router.get("/:id", async (req, res) => {
    let title = req.params.id.replace(/-/g, " ");
    try {
        // const post = await Post.findById(req.params.id);
        let post = await Post.find({
            title,
        });
        post = post.length === 0 ? await Post.findById(req.params.id) : post[0];
        return res.status(200).json(post);
    } catch (err) {
        return res.status(500).json(err);
    }
});

//GET ALL SOLUTIONS
router.get("/", async (req, res) => {
    const username = req.query.user;
    const catName = req.query.cat;
    const searchText = req.query.search;
    try {
        let posts;
        if (username) {
            posts = await Post.find({ username });
        } else if (catName) {
            posts = await Post.find({
                categories: {
                    $in: [catName],
                },
            });
        } else if (searchText) {
            const query = { $text: { $search: searchText } };
            posts = await Post.find(query);
        } else {
            posts = await Post.find();
        }
        return res.status(200).json(posts);
    } catch (err) {
        return res.status(500).json(err);
    }
});

module.exports = router;
