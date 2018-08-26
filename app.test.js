'use strict';

var request = require('supertest');
var app = require('./app');

describe('Testing player web responses', () => {
  // Testing for players
  test('/ returns status 200', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });

  test('/dm returns status 403', async () => {
    const response = await request(app).get('/dm');
    expect(response.statusCode).toBe(403);
  });

  test('/map returns type png/image', async () => {
    const response = await request(app).get('/map');
    expect(response.type).toBe('image/png');
  });

  test('/quit returns status 403', async () => {
    const response = await request(app).get('/quit');
    expect(response.statusCode).toBe(403);
  });

  test('/dm/map returns status 403', async () => {
    const response = await request(app).get('/dm/map');
    expect(response.statusCode).toBe(403);
  });

  test('/dm/listmaps returns status 403', async () => {
    const response = await request(app).get('/dm/listmaps');
    expect(response.statusCode).toBe(403);
  });

  test('/send returns 403',  async () => {
    const response = await request(app).post('/send');
    expect(response.statusCode).toBe(403);
  });

  test('/upload returns 403',  async () => {
    const response = await request(app).post('/upload');
    expect(response.statusCode).toBe(403);
  });
});
// get /
// get dm
// get map
// get quit
// get dm/map
// get dm/listmaps
// post dm/map
// post upload
// post send


describe('Testing DM web access and responses', () => {

  // Testing for DMs
  test('DM - root page returns 200',  async () => {
    const response = await request(app).get('/').set('Host', 'localhost:3000');
    expect(response.statusCode).toBe(200);
  });

  test('DM - dm page returns 200',  async () => {
    const response = await request(app).get('/dm').set('Host', 'localhost:3000');
    expect(response.statusCode).toBe(200);
  });

  test('DM - quit page returns 200',  async () => {
    const response = await request(app).get('/quit').set('Host', 'localhost:3000');
    expect(response.statusCode).toBe(200);
  });

  test('DM - send page with Base64 coded data returns 200 - success true',  async () => {
    const response = await request(app).post('/send')
      .send({
        imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
      })
      .set('Host', 'localhost:3000');
    expect(response.body.success).toEqual(true);
  });

  test('DM - send page with no data returns 200 - success false',  async () => {
    const response = await request(app).post('/send')
      .set('Host', 'localhost:3000');
    expect(response.body.success).toEqual(false);
  });

});