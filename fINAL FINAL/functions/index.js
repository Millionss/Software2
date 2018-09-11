const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const engine = require('pug')

const firebaseApp = firebase.initializeApp(
  functions.config().firebase
);

const app = express();
app.set('views', './views');
app.set('view engine', 'pug');
app.get('/login', (request, response) => {
  response.render('login');
});

exports.app = functions.https.onRequest(app);
