const express = require('express')
const router = express.Router()

// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.get('/', (req, res) => res.send('Post Route'))

module.exports = router
