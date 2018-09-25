const functions = require('firebase-functions');
const firebase = require('firebase');
const express = require('express');
const session = require('express-session');
const engine = require('pug');
const models = require('./Models/ModelFactory');

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
app.use(session({
  secret: "cookie",
  resave: false,
  saveUninitialized: false,
  cookie: {}
}))

app.get('/', (request, response) => {
  console.log("getting start")
  if (auth.currentUser !== null) {
    console.log("user not null")
    const uid = auth.currentUser.uid
    if (typeof request.session.type !== "undefined") {
      response.redirect(307, '/main_menu_'+request.session.type);
    } else {
      database.ref('/users/'+uid).once('value').then( (snapshot) => {
        const alumnee = models.createUser(snapshot)
        request.session.type = alumnee.type
        request.session.uid = alumnee.id
        console.log("Session uid: "+request.session.uid)
        return response.redirect('/main_menu_'+alumnee.type);
      }).catch(err => console.log("Error: "+err));
    }
  } else {
    console.log("User null")
    response.redirect(307, '/login') 
  }
});

app.get('/login', (request, response) => {
  response.render('login');
});

app.get('/main_menu_admin', (request, response) => {
  if (auth.currentUser !== null) {
    database.ref('/users/'+auth.currentUser.uid).once('value').then( (snapshot) => {
      const admin = models.createAdmin(snapshot)
      console.log(admin.name)
      return response.render('main_menu_admin', {
      });
    }).catch(err => console.log("error: " +err));
    
  }else {
    response.redirect(307, '/login')
  }
})

app.get('/main_menu_alumnee', (request, response) => {
  if (auth.currentUser !== null) { 
    database.ref('/users/'+auth.currentUser.uid).once('value').then( (snapshot) => {
      const alumnee = models.createUser(snapshot)
      console.log(alumnee.name)
      return response.render('main_menu_alumnee', {
        name: alumnee.name,
        courses: alumnee.courses
      });
    }).catch(err => console.log("Error: "+err)); 
  } else {
    response.redirect(307, '/login')
  }
})

app.post('/login_comprobar', (request, response) => {
  const user = request.body.user
  const pass = request.body.pass
  console.log("user: "+user+", "+"pass: "+pass)
  auth.signInWithEmailAndPassword(user, pass).then((user) => {
    console.log("LOG IN")
    return response.redirect(302, "/")
  }).catch((err) => {
    console.log("Error "+err);
    return response.render('login');
  })
});

exports.app = functions.https.onRequest(app);
