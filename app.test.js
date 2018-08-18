'use strict';

var request = require('supertest');
var app = require('./app');

request = request(app);
describe('Testing player web access and responses', () => {
  // Testing for players
  test('Player - root page returns 200', function (done) {
    request
      .get('/')
      .expect(200, done)
  });

  test('Player - dm page returns 403', function (done) {
    request
      .get('/dm')
      .expect(403, done)
  });

  test('Player - quit page returns 403', function (done) {
    request
      .get('/quit')
      .expect(403, done)
  });

  test('Player - dm/map page returns 403', function (done) {
    request
      .get('/dm/map')
      .expect(403, done)
  });

  test('Player - send page with Base64 coded data returns 403', function (done) {
    request
      .post('/send')
      .send({imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='})
      .expect(403, done);
  });

  test('Player - send page with no data returns 403', function (done) {
    request
      .post('/send')
      .expect(403, done);
  });
    
});


describe('Testing DM web access and responses', () => {

  // Testing for DMs
  test('DM - root page returns 200', function (done) {
    request
      .get('/')
      .set('Host','localhost:3000')
      .expect(200, done);
  });

  test('DM - dm page returns 200', function (done) {
    request
      .get('/dm')
      .set('Host','localhost:3000')
      .expect(200, done);
  });

  test('DM - quit page returns 200', function (done) {
    request
      .get('/quit')
      .set('Host','localhost:3000')
      .expect(200, done);
  });

  test('DM - send page with Base64 coded data returns 200 - success true', function (done) {
    request
      .post('/send')
      .send({imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='})
      .set('Host','localhost:3000')
      .expect(200, {
        'success': true,
        'responseText': 'Image successfully uploaded'
      }, done);
  });

  test('DM - send page with no data returns 200 - success false', function (done) {
    request
      .post('/send')
      .set('Host','localhost:3000')
      .expect(200, {
        'success': false,
        'responseText': 'Image not uploaded successfully'
      }, done);
  });

});

