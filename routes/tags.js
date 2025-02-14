var express = require('express');
var router = express.Router();

const { ObjectId } = require('mongoose').Types;
const { checkBody } = require('../modules/checkBody');
const Tag = require('../models/tags');
const User = require('../models/users');

router.post('/', async (req, res) => {
  // check if body is correct
  try {
    if (!checkBody(req.body, ['value', 'token', 'noteId'])) {
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
    }

    const { token, noteId } = req.body;

    let value = req.body.value.trim();
    // remplace les '#'
    if (value.length && value.includes('#')) {
      value = value.replaceAll('#', '').trim();
    }

    // verifier si le user existe
    const user = await User.findOne({ token });
    if (!user) {
      res.json({ result: false, error: 'User not found ' });
      return;
    }

    const tag = await Tag.findOne({ value: value, user: user._id });
    // SI LE TAG N'EXISTE PAS, ON LE CREE EN LUI AJOUTANT LA NOTE AUQUEL IL EST LIE
    if (!tag) {
      const newTag = new Tag({
        value: value,
        user: user._id,
        notes: [noteId],
      });

      // sauvegarder le nouveau tag créé dans la BDD
      const savedTag = await newTag.save();
      if (!savedTag) throw new Error('Could not save tag');

      res.json({ result: true, tag: savedTag });
      return;
    }

    // si le tag existe, mettre à jour le document Tag en lui rajoutant une noteId dans le tableau des notes
    if (tag.notes.includes(noteId)) {
      res.json({
        result: false,
        error: `Tag already linked with note ${noteId}`,
      });
      return;
    }

    const updatedTag = await Tag.updateOne(
      { _id: tag._id },
      { $push: { notes: noteId } }
    );

    if (updatedTag.modifiedCount === 0) {
      res.json({
        result: false,
        message: 'Could not link existing tag to note',
      });
      return;
    }

    res.json({ result: true, message: 'Tag updated with new note' });
    return;
  } catch (error) {
    return res.json({ result: false, error: error.message });
  }
});

router.get('/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    // aggrégation afin de trouver toutes les tag lié à une note
    const foundTags = await Tag.aggregate([
      {
        $match: {
          notes: new ObjectId(noteId),
        },
      },
      {
        $project: {
          value: 1,
        },
      },
    ]);

    res.json({ result: true, tags: foundTags });
  } catch (error) {
    return res.json({ result: false, error: error.message });
  }
});

/** get all notes ids linked to a tag */
router.get('/notes/:tagValue/:token', async (req, res) => {
  try {
    const { tagValue, token } = req.params;

    const user = await User.findOne({ token });
    if (!user) throw new Error('User not found ');

    const tag = await Tag.findOne({ value: tagValue, user: user._id }).populate(
      'notes'
    );
    if (!tag) throw new Error('Tag not found ');
    res.json({
      result: true,
      notes: tag.notes.map((note) => ({ _id: note._id, title: note.title })),
    });
  } catch (error) {
    return res.json({ result: false, error: error.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { value, token, noteId } = req.body;

    const tag = await Tag.findOne({ value });
    const user = await User.findOne({ token });

    if (!user) {
      // si aucun user, early return
      res.json({ result: false, error: 'User not found ' });
      return;
    }
    if (!tag) {
      // si aucun tag, early return
      res.json({ result: false, error: 'tag not found ' });
      return;
    }
    if (tag.notes.length === 1) {
      // si le tableau notes contient 1 seule note delete le tag
      await Tag.findByIdAndDelete(tag._id);
      return res.json({ result: true });
    } else {
      await Tag.findByIdAndUpdate(
        // si le tableau notes contient plusieurs notes on retirne la noteId du tableau
        tag._id,
        { $pull: { notes: noteId } }
      );

      return res.json({ result: true });
    }
  } catch (error) {
    return res.json({ result: false, error: error.message });
  }
});
module.exports = router;
