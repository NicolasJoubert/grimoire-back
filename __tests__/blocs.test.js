const request = require('supertest');
const app = require('../app');

it('PUT /blocs/increment', async () => {
  const res = await request(app)
    .put('/blocs/increment')
    .send({
      blocsIds: [
        '675ea4ea5e4b1b60d61addb8',
        '675ea4f15e4b1b60d61addfe',
        '675ea4f45e4b1b60d61ade0e',
        '675ea50e5e4b1b60d61ade42',
      ],
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});
