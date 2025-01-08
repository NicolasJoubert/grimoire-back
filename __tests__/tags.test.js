const request = require('supertest');
const app = require('../app');

it('POST /tags/', async () => {
  const res = await request(app).post('/tags/').send({
    value: 'React',
    token: 'fnDOkSme-yqhS9ukEm7lYCbiETpdt9dD',
    noteId: '675ab58a5f858aba4b406a99',
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});
