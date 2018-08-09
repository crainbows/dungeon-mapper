'use strict';

var request = require('supertest');
var app = require('./app');

test('Root page loads', function (done) {
    request(app)
        .get('/')
        .expect(200, done)
});