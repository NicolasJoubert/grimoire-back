const request = require('supertest');
const app = require('../app');

const noteId = '677e3ff9e7e6191dc09f3348';
let blocId = '';

it('POST /blocs', async () => {
  // create bloc
  const res = await request(app).post('/blocs').send({
    position: 1,
    type: 'text',
    noteId,
  });
  blocId = res.body.bloc._id; // This value will be used for delete test

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});

it('DELETE /blocs/:blocId/:noteId', async () => {
  // delete bloc
  const res = await request(app).delete(`/blocs/${blocId}/${noteId}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});

it('PUT /blocs/increment', async () => {
  const res = await request(app)
    .put('/blocs/increment')
    .send({
      blocsIds: [
        '677e3ff9e7e6191dc09f334a',
        '677e404ee7e6191dc09f33be',
        '677e4051e7e6191dc09f33d3',
        '677e4054e7e6191dc09f33e4',
        '677e4057e7e6191dc09f33f7',
      ],
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});
