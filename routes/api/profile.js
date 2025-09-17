const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/Users')
const { check, validationResult } = require('express-validator')

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    )

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' })
    }
    res.json(profile)
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Server Error')
  }
})

// @route    Post api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
  '/',
  auth,
  check('status', 'Status is required').notEmpty(),
  check('skills', 'Skills is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // destructure the request
    const {
      website,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      // spread the rest of the fields we don't need to check
      ...rest
    } = req.body

    // build a profile
    const profileFields = {
      user: req.user.id,
      website:
        website && website !== ''
          ? normalize(website, { forceHttps: true })
          : '',
      skills: Array.isArray(skills)
        ? skills
        : skills.split(',').map((skill) => ' ' + skill.trim()),
      ...rest,
    }

    // Build socialFields object
    const socialFields = { youtube, twitter, instagram, linkedin, facebook }

    // normalize social fields to ensure valid url
    for (const [key, value] of Object.entries(socialFields)) {
      if (value && value.length > 0)
        socialFields[key] = normalize(value, { forceHttps: true })
    }
    // add to profileFields
    profileFields.social = socialFields

    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )
      return res.json(profile)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server Error')
    }
  }
)

// @route    GET api/profile
// @desc     Get all profiles profile
// @access   public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])
    res.json(profiles)
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Server Error')
  }
})

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user id
// @access   public
router.get('/user/:user_id', async ({ params: { user_id } }, res) => {
  try {
    const profiles = await Profile.findOne({
      user: user_id,
    }).populate('user', ['name', 'avatar'])
    if (!profiles) {
      return res.status(400).json({ msg: 'there is no user for this profile' })
    }
    res.json(profiles)
  } catch (err) {
    console.log(err.message)
    if (err.kind == 'ObjectId')
      return res.status(400).json({ msg: 'there is no user for this profile' })
    res.status(500).send('Server Error')
  }
})

// @route    delete api/profile
// @desc     delete profile, user, post
// @access   private
router.delete('/', auth, async (req, res) => {
  try {
    //remove profile
    await Profile.findOneAndDelete({ user: req.user.id })
    // remove user
    await User.findOneAndDelete({ _id: req.user.id })
    res.json({ msg: 'User has been removed' })
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Server Error')
  }
})

// @route    PUT api/profile/experience
// @desc     add profile experience
// @access   private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is Required').not().isEmpty(),
      check('company', 'Company is Required').not().isEmpty(),
      check('from', 'From date is Required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { title, company, location, from, to, current, description } =
      req.body
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    }
    try {
      const profile = await Profile.findOne({ user: req.user.id })

      profile.experience.unshift(newExp)
      await profile.save()
      res.json(profile)
    } catch (err) {
      console.log(err.message)
      res.status(500).send('Server Error')
    }
  }
)

// @route    DELETE api/profile/experience/:exp_id
// @desc     delete profile experience
// @access   private

router.delete('/experience/:exp_id', auth, async (req, res) =>{
  console.log("test")
  try {
    const profile = await Profile.findOne({ user: req.user.id }) 
    //get the remove index
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

    console.log(removeIndex)

    profile.experience.splice(removeIndex,1)

    await profile.save()
    res.json(profile)
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Server Error')
  }
} )

// @route    PUT api/profile/education
// @desc     add profile education
// @access   private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'school is Required').not().isEmpty(),
      check('degree', 'degree is Required').not().isEmpty(),
      check('from', 'From date is Required').not().isEmpty(),
      check('fieldOfStudy', 'Field of Study is Required').not().isEmpty(),

    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { school, degree, fieldOfStudy, from, to, current, description } =
      req.body
    const newEdu = {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description,
    }
    try {
      const profile = await Profile.findOne({ user: req.user.id })

      profile.education.unshift(newEdu)
      await profile.save()
      res.json(profile)
    } catch (err) {
      console.log(err.message)
      res.status(500).send('Server Error')
    }
  }
)

// @route    DELETE api/profile/education/:edu_id
// @desc     delete profile education
// @access   private

router.delete('/education/:edu_id', auth, async (req, res) =>{
  console.log("test")
  try {
    const profile = await Profile.findOne({ user: req.user.id }) 
    //get the remove index
    const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)

    console.log(removeIndex)

    profile.education.splice(removeIndex,1)

    await profile.save()
    res.json(profile)
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Server Error')
  }
} )

module.exports = router
