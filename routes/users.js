require('../models/connection');
var express = require('express');
var router = express.Router();
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const DevLang = require('../models/dev_languages');
const EditorTheme = require('../models/editor_themes');

const { checkBody } = require('../modules/checkBody');

/** Create user in DB */
router.post('/signup', (req, res) => {
  // Creation user avec google recuperation des infos envoyées par le front
  const { googleToken } = req.body;
  if (googleToken) {
    if (!checkBody(req.body, ['googleToken'])) {
      return res.json({ result: false, error: 'Missing Google token' });
    }
    // Décodage du token Google pour extraire les informations utilisateur
    const decoded = jwt.decode(googleToken);

    if (!decoded) {
      return res.json({ result: false, error: 'Invalid Google token' });
    }

    const { email, name, picture } = decoded;

    User.findOne({ email }).then((data) => {
      if (data === null) {
        const newUser = new User({
          username: name,
          email: email,
          profilePic: picture || '/images/HatSorcerer.png',
          token: uid2(32),
          defaultDevLang: null,
          defaultEditorTheme: null,
          isDark: false,
        });

        newUser.save().then((data) => {
          res.json({
            result: true,
            username: data.username,
            token: data.token,
            profilePic: data.profilePic,
          });
        });
      } else {
        res.json({ result: false, error: `L'utilisateur existe déjà` });
      }
    });
  } else {
    if (!checkBody(req.body, ['email', 'username', 'password'])) {
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
    }
    User.findOne({ username: req.body.username }).then((data) => {
      if (data === null) {
        const hash = bcrypt.hashSync(req.body.password, 10);

        const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          password: hash,
          token: uid2(32),
          profilePic: req.body.profilePic || '/images/HatSorcerer.png',
          defaultDevLang: null,
          defaultEditorTheme: null,
          isDark: false,
          //devLang: 'dev_1',
        });

        newUser.save().then((data) => {
          res.json({
            result: true,
            username: data.username,
            token: data.token,
            profilePic: data.profilePic,
          });
        });
      } else {
        // User already exists in database
        res.json({ result: false, error: 'User already exists' });
      }
    });
  }
});

/** Connect already existing user */
router.post('/signin', (req, res) => {
  const { googleToken } = req.body;

  if (googleToken) {
    // Décodage du token Google pour extraire les informations utilisateur
    const decoded = jwt.decode(googleToken);
    const { email } = decoded;

    User.findOne({ email }).then((data) => {
      if (data) {
        res.json({
          result: true,
          username: data.username,
          token: data.token,
          profilePic: data.profilePic,
        });
      } else {
        res.json({
          result: false,
          error: `Pas d'utilisateur google enregistré`,
        });
      }
    });
  } else if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  } else {
    User.findOne({ username: req.body.username }).then((data) => {
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        res.json({
          result: true,
          username: data.username,
          token: data.token,
          profilePic: data.profilePic,
        });
      } else {
        res.json({ result: false, error: 'User not found or wrong password' });
      }
    });
  }
});

/** Change user username in DB */
router.put('/update/username', async (req, res) => {
  try {
    const { token, username } = req.body;

    const userToUpdate = await User.findOne({ token });
    if (!userToUpdate) throw new Error('Could not find user');

    await User.updateOne({ token }, { username });

    // if (update.modifiedCount != 1) throw new Error("Could not update user username")
    res.json({ result: true, username });
  } catch (err) {
    res.json({ result: false, error: err.message });
  }
});

/** Change user default language in DB */
router.put('/update/devlang', async (req, res) => {
  try {
    const { token, username, profilPic, defaultDevLang, defaultEditorTheme } =
      req.body;

    const devLang = await DevLang.findOne({ displayValue: defaultDevLang });
    if (!devLang) throw new Error('Could not retrieve dev language');

    const userToUpdate = await User.findOne({ token });
    if (!userToUpdate) throw new Error('Could not find user');

    const update = await User.updateOne(
      { token },
      { defaultDevLang: devLang._id }
    );

    if (update.modifiedCount !== 1)
      throw new Error('Could not update user devLang');
    res.json({ result: true });
  } catch (err) {
    res.json({ result: false, error: err.message });
  }
});

/** Change user default language in DB */
router.put('/update/editorTheme', async (req, res) => {
  try {
    const { token, defaultEditorTheme } = req.body;

    const editorTheme = await EditorTheme.findOne({
      displayValue: defaultEditorTheme,
    });
    if (!editorTheme) throw new Error('Could not retrieve editorTheme');

    const userToUpdate = await User.findOne({ token });
    if (!userToUpdate) throw new Error('Could not find user');

    const update = await User.updateOne(
      { token },
      { defaultEditorTheme: editorTheme._id }
    );

    if (update.modifiedCount !== 1)
      throw new Error('Could not update user editorTheme');
    res.json({ result: true });
  } catch (err) {
    res.json({ result: false, error: err.message });
  }
});

/** Change profile pic */
router.put('/update/profilePicture', async (req, res) => {
  try {
    const { token, newProfilePic } = req.body;

    const userToUpdate = await User.findOne({ token });
    if (!userToUpdate) throw new Error('Could not find user');

    const update = await User.updateOne(
      { token },
      { profilePic: newProfilePic }
    );
    console.log('Update result:', update);

    if (update.matchedCount !== 1) {
      throw new Error('No matching user found');
    }

    res.json({ result: true });
  } catch (err) {
    console.error('Error updating profile picture:', err.message);
    res.json({ result: false, error: err.message });
  }
});

module.exports = router;
