const functions = require('firebase-functions');
const firebase = require('firebase');
const express = require('express');
const session = require('express-session');
const engine = require('pug');
const modelsClass = require('./Models/ModelFactory');

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
const models = new modelsClass()

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
  if (auth.currentUser !== null) {
    const uid = auth.currentUser.uid
    if (typeof request.session.type !== "undefined") {
      response.redirect(307, '/main_menu_'+request.session.type);
    } else {
      database.ref('/users/'+uid).once('value').then( (snapshot) => {
        const alumnee = models.createUser(snapshot)
        request.session.type = alumnee.type
        return response.redirect('/main_menu_'+alumnee.type);
      }).catch(err => console.log("Error: "+err));
    }
  } else {
    response.redirect(307, '/login') 
  }
});

app.get('/login', (request, response) => {
  response.render('login');
});

app.get('/main_menu_admin', (request, response) => {
  if (auth.currentUser !== null) {
    database.ref('/users/'+auth.currentUser.uid).once('value').then( (snapshotUser) => {
      var admin = models.createUser(snapshotUser)
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
    database.ref('/users/'+auth.currentUser.uid).once('value').then( snapshotUser => {
      var coursesSnapshot = snapshotUser.child('courses')
      var alumnee = models.createUser(snapshotUser)
      var counter = 0
      coursesSnapshot.forEach( course => {
        counter++
        database.ref('/courses/'+course.val()).once('value').then( snapshotCourse => {
          var teacherID = snapshotCourse.val().teacher;
          database.ref('/users/'+teacherID).once('value').then( snapshotTeacher => {
            const course = models.createCourse(snapshotCourse, snapshotTeacher);
            alumnee.courses.push(course)
            if (alumnee.courses.length == counter) {
              return response.render('main_menu_alumnee', {
                name: alumnee.name,
                courses: alumnee.courses
              });
            }
          }).catch(err => console.log("Error: "+err))
        }).catch(err => console.log("Error: "+err))
      })
    }).catch(err => console.log("Error: "+err)); 
  } else {
    response.redirect(307, '/login')
  }
})

app.post('/login_comprobar', (request, response) => {
  const user = request.body.user
  const pass = request.body.pass
  auth.signInWithEmailAndPassword(user, pass).then((user) => {
    return response.redirect(302, "/")
  }).catch((err) => {
    console.log("Error "+err);
    return response.render('login');
  })
});

app.get('/logout', (request, response) => {
  auth.signOut().then(() => {
    response.redirect('/login')
  })
})

exports.app = functions.https.onRequest(app);
