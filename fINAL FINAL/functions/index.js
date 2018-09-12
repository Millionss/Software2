const functions = require('firebase-functions');
const firebase = require('firebase');
const express = require('express');
const engine = require('pug')

const firebaseApp = firebase.initializeApp(
  {
    apiKey: "AIzaSyC-o77UiDDryjw7blt2rmyk9y1X6JmzVMg",
    authDomain: "software-2-b874c.firebaseapp.com",
    databaseURL: "https://software-2-b874c.firebaseio.com",
    projectId: "software-2-b874c",
    storageBucket: "software-2-b874c.appspot.com",
    messagingSenderId: "654921925436"
  }
);
const auth = firebaseApp.auth();
const database = firebaseApp.database();

const app = express();
app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', (request, response) => {
  console.log("getting start")
  if (auth.currentUser !== null) {
    console.log("user not null")
    const uid = auth.currentUser.uid
    console.log(uid)
    database.ref('/users/'+uid).once('value').then( (snapshot) => {
      const type = snapshot.val().type;
      return response.render('main_menu_'+type);
    }).catch(err => console.log(err.code));
  } else {
    console.log("User null")
    response.render('login')
  }
});

app.get('/login', (request, response) => {
  response.render('login');
});

app.post('/login_comprobar', (request, response) => {
  const user = request.body.user
  const pass = request.body.pass

  auth.signInWithEmailAndPassword(user, pass).then((user) => {
    return response.send("Login succesfull");
  }).catch((err) => {
    console.log(err.code);
    return response.render('login');
  })
});

exports.app = functions.https.onRequest(app);
