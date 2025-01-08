const request = require('supertest');
const app = require('../app');

it('DELETE /delete/:noteId', async () => {
  const noteId = '675c55d1e141037183c92d5d';

  const res = await request(app).delete(`/delete/${noteId}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});
