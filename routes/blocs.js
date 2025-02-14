var express = require('express');
var router = express.Router();
// const moment = require('moment');

const { checkBody } = require('../modules/checkBody');
const Bloc = require('../models/blocs');
const Note = require('../models/notes');

/** Create a new bloc in a note */
router.post('/', async (req, res) => {
  const isBodyValid = checkBody(req.body, ['position', 'type', 'noteId']); // check only type and position (language can be null)
  if (!isBodyValid) throw new Error('Missing or empty body parameter');

  try {
    const { position, noteId, type, language } = req.body;

    let newBloc; // Bloc initial values are based on type
    if (type === 'text') {
      newBloc = await Bloc.create({
        position,
        type,
        language,
        height: 38,
        lineCount: null,
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else if (type === 'code') {
      newBloc = await Bloc.create({
        position,
        type,
        language,
        height: null,
        lineCount: 1,
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }else if (type === 'internal link') {
      newBloc = await Bloc.create({
        position,
        type,
        language,
        height: null,
        lineCount: 1,
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (!newBloc) throw new Error('Could not create bloc');

    const updatedNote = await Note.updateOne(
      { _id: noteId }, // find related note
      { $push: { blocs: newBloc._id } } // Add the newBloc's ID to the blocs array of the Note document
    );

    if (updatedNote.modifiedCount === 0) {
      res.json({ result: false, error: 'Bloc was not linked to note' });
      return;
    }
    res.json({ result: true, bloc: newBloc }); // if updated, respond result = true
  } catch (err) {
    res.json({ result: false, error: err.message });
  }
});

/* Get all blocs placed after a given position for a given note */
router.get('/:noteId/:index', async (req, res) => {
  try {
    const { index, noteId } = req.params;

    // Get the note containing the blocs
    const note = await Note.findById(noteId).populate('blocs');
    if (!note) throw new Error('Could not find note');

    // Return all blocs greater than the param index
    res.json({
      result: true,
      blocs: note.blocs.filter((bloc) => bloc.position > index),
    });
  } catch (err) {
    res.json({ result: false, error: err.message });
  }
});

/* Increase all blocs' position by one */
router.put('/increment', async (req, res) => {
  try {
    const { blocsIds } = req.body;

    const updated = await Bloc.updateMany(
      { _id: { $in: blocsIds } }, // Filter documents where _id is in the blocsIds array
      { $inc: { position: 1 } } // Increment the position field by 1
    );

    if (updated.modifiedCount !== blocsIds.length) {
      res.json({ result: false, error: 'Not all blocs position were updated' });
      return;
    }
    res.json({ result: true });
  } catch (err) {
    res.json({ result: false, error: err.message });
  }
});

/** Save bloc when modified */
router.put('/save', async (req, res) => {
  const isBodyValid = checkBody(req.body, ['blocId', 'type']); // check only type and bloc id (language can be null, and content can be "")
  if (!isBodyValid) throw new Error('Missing or empty body parameter');

  try {
    const { blocId, type, language, content } = req.body;

    const updatedBloc = await Bloc.updateOne(
      { _id: blocId },
      {
        type,
        language,
        content,
        updatedAt: Date.now(),
      }
    );

    if (updatedBloc.modifiedCount === 0) {
      res.json({ result: false, error: 'could not update Bloc' });
      return;
    }
    res.json({ result: true }); // if updated, respond result = true
  } catch (err) {
    res.json({ result: false, error: err.message });
  }
});

router.delete('/:blocId/:noteId', async (req, res) => {
  const { blocId, noteId } = req.params;
  if (!blocId || !noteId) throw new Error('Missing bloc or note id');

  try {
    const deletedBloc = await Bloc.deleteOne({ _id: blocId });

    if (!deletedBloc.acknowledged) {
      res.json({ result: false, error: 'something unexpected happended' });
      return;
    }

    if (deletedBloc.deletedCount === 0 && deletedBloc.acknowledged) {
      res.json({ result: false, error: 'Bloc already deleted' }); // (Happens when bloc is not found)
      return;
    }
    if (deletedBloc.deletedCount > 0) {
      // => EXPECTED CASE (success)
      // if bloc is deleted, we need to remove it from the note document
      const updatedNote = await Note.updateOne(
        { _id: noteId }, // find related note
        { $pull: { blocs: blocId } } // Remove the blocId from the blocs array of the Note document
      );
      if (updatedNote.modifiedCount === 0) {
        res.json({ result: false, error: 'Could not remove bloc from note' });
        return;
      }
      res.json({ result: true });
      return;
    }
  } catch (err) {
    res.json({ result: false, error: err.message });
  }
});

module.exports = router;