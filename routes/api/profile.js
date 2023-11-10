const express = require('express');
const router = express.Router();

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
router.get('/', (req, res) => res.send('Profile Route'));

module.exports = router;
