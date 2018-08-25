'use strict';

var request = require('supertest');
var app = require('./app');


describe('Testing player web access and responses', () => {
  // Testing for players
  test('Player - root page returns 200', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });

  test('Player - dm page returns 403', async () => {
    const response = await request(app).get('/dm');
    expect(response.statusCode).toBe(403);
  });

  test('Player - quit page returns 403', async () => {
    const response = await request(app).get('/quit');
    expect(response.statusCode).toBe(403);
  });

  test('Player - dm/map page returns 403', async () => {
    const response = await request(app).get('/dm/map');
    expect(response.statusCode).toBe(403);
  });

  test('Player - send page with Base64 coded data returns 403', async () => {
    const response = await request(app).post('/send')
      .send({
        imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
      });
    expect(response.statusCode).toBe(403);
  });

  test('Player - send page with no data returns 403',  async () => {
    const response = await request(app).post('/send');
    expect(response.statusCode).toBe(403);
  });

});


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