const express = require('express');
const router = express.Router();
const config = require('config');
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route   POST api/posts
// @access private
router.post('/',
    [
        auth, [
            check('text', 'Text is required')
                .not()
                .isEmpty()
        ]
    ],
   async (req, res) => {
       const errors = validationResult(req);
       if(!errors.isEmpty()) {
           return res.status(400).json({ errors: errors.array() });
       }
       
       try {
           const user = await User.findById(req.user.id).select('-password');
           const newPost = new Post({
               text: req.body.text,
               name: user.name,
               avatar: user.avatar,
               user: req.user.id
           });

           const post = await newPost.save();
           res.json(post);

       } catch (err) {
           console.error(err.message);
           res.status(500).send('Sever Error');
       }
   });

// @route   POST api/posts
// @access private

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts/:id
// @access private

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(400).json({msg: 'Post not found'});
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'objectId') {
            res.status(400).json({msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/posts/:id
// @access private

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(400).json({msg: 'Post not found'});
        }

        if(post.user.toString() !== req.user.id) {
            res.status(401).json({msg: 'Not authorized'});
        }

        await post.remove();
        res.json({ msg: 'Post removed'});
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'objectId') {
            res.status(400).json({msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

/// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked
        if (
            post.likes.filter(like => like.user.toString() === req.user.id).length > 0
        ) {
            return res.status(400).json({ msg: 'Post already liked' });
        }

        post.likes.unshift({ user: req.user.id });

        await post.save();

        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    PUT api/posts/unlike/:id
// @desc     Like a post
// @access   Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked
        if (
            post.likes.filter(like => like.user.toString() === req.user.id).length ===
            0
        ) {
            return res.status(400).json({ msg: 'Post has not yet been liked' });
        }

        // Get remove index
        const removeIndex = post.likes
            .map(like => like.user.toString())
            .indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();

        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// @route   POST api/posts/comment/:id
// @access private
router.post('/comment/:id',
    [
        auth, [
        check('text', 'Text is required')
            .not()
            .isEmpty()
    ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);
            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };

            post.comments.unshift(newComment);

            await post.save();
            res.json(post.comments);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Sever Error');
        }
    });

// @route   DELETE api/posts/comment/:id/:comment_id
// @access private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        if (!comment) {
            return res.status(404).json({msg: "Comment does not exist"});
        }

        if(comment.user.toString() !== req.user.id) {
            return res.status(401).json({msg: "User not authorized"});
        }

        const removeIndex = post.comments.map(comment => comment.user.toString().indexOf(req.user.id));
        post.comments.splice(removeIndex, 1);
        await post.save();

        res.json(post.comments);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Sever Error');
    }
});


module.exports = router;