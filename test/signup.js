var path = require('path');
var assert = require('assert');
var request = require('supertest');
var app = require('../index');
var User = require('../lib/mongo').User;