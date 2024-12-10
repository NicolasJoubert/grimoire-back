require('../models/connection');
var express = require('express');
var router = express.Router();
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');

/** Create user in DB */
router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }


  User.findOne({ username: req.body.username }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: hash,
    token: uid2(32),
    profilePic: req.body.profilePic | null,
    isDark: false,
    //devLang: 'dev_1',
    
  });

  newUser.save().then(data => {
    res.json({ result: true, username: data.username, token: data.token });
  });
} else {
  // User already exists in database
  res.json({ result: false, error: 'User already exists' });
}
  });
});

/** Connect already existing user */
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});

module.exports = router;