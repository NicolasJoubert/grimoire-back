const app = require('../app');
const request = require('supertest');
const uid2 = require('uid2');

const token = 'D9NhXav1YFFo2ZxD6xJ5lqNMEGLyGaio';
const noteId = '677e3ff9e7e6191dc09f3348';
let value = '';

it('POST /tags', async () => {
  value = uid2(10); // This will update value on each call and will be used for DELETE test
  const res = await request(app).post('/tags').send({
    value, // Generate random string for created token to work on each test
    token,
    noteId,
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});

it('POST /tags (already added for same note)', async () => {
  await request(app).post('/tags/').send({
    // first creation
    value: 'React',
    token,
    noteId,
  });

  const res = await request(app).post('/tags/').send({
    // second creation
    value: 'React',
    token,
    noteId,
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(false);
});

it('DELETE /tags', async () => {
  const res = await request(app).delete('/tags').send({
    value,
    token,
    noteId,
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});
