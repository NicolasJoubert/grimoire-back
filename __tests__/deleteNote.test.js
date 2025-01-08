const request = require('supertest');
const app = require('../app');

const token = 'D9NhXav1YFFo2ZxD6xJ5lqNMEGLyGaio';
let noteId = '';

it('POST /', async () => {
  // create new note
  const res = await request(app).post('/notes').send({ token });
  noteId = res.body.note._id; // // This value will be used for delete test

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});

it('DELETE notes/delete/:noteId', async () => {
  // delete  note
  const res = await request(app).delete(`/notes/delete/${noteId}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});
