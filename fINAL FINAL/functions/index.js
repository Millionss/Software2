const functions = require('firebase-functions');
const firebase = require('firebase');
const express = require('express');
const session = require('express-session');
const engine = require('pug');
const modelsClass = require('./Models/ModelFactory');

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyC-o77UiDDryjw7blt2rmyk9y1X6JmzVMg",
  authDomain: "software-2-b874c.firebaseapp.com",
  databaseURL: "https://software-2-b874c.firebaseio.com",
  projectId: "software-2-b874c",
  storageBucket: "software-2-b874c.appspot.com",
  messagingSenderId: "654921925436"
});
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
      response.redirect(307, '/main_menu_' + request.session.type);
    } else {
      database.ref('/users/' + uid + '/type').once('value').then((snapshot) => {
        request.session.type = snapshot.val()
        return response.redirect('/main_menu_' + snapshot.val());
      }).catch(err => console.log("Error: " + err));
    }
  } else {
    response.redirect(307, '/login')
  }
});

app.get('/login', (request, response) => {
  response.render('login');
});

app.get('/main_menu_admin', (request, response) => {
  response.render('main_menu_admin');
})

app.get('/main_menu_alumnee', (request, response) => {
  if (auth.currentUser !== null) {
    database.ref('/users/' + auth.currentUser.uid).once('value').then(snapshotUser => {
      var coursesSnapshot = snapshotUser.child('courses')
      var student = models.createUser(snapshotUser)
      var counter = 0
      coursesSnapshot.forEach(course => {
        counter++
        database.ref('/courses/' + course.val()).once('value').then(snapshotCourse => {
          var teacherID = snapshotCourse.val().teacher;
          database.ref('/users/' + teacherID).once('value').then(snapshotTeacher => {
            const course = models.createCourse(snapshotCourse, snapshotTeacher);
            student.courses.push(course)

            if (student.courses.length == counter) {
              const teachers = student.filterCoursesByTeacher()
              return response.render('main_menu_alumnee', {
                name: student.name,
                teachers: teachers
              });
            }
          }).catch(err => console.log("Error: " + err))
        }).catch(err => console.log("Error: " + err))
      })
    }).catch(err => console.log("Error: " + err));
  } else {
    response.redirect(307, '/login')
  }
})

app.get('/main_menu_professor', (request, response) => {
  if (auth.currentUser !== null) {
    var teacher;
    database.ref('/users/' + auth.currentUser.uid).once('value').then(snapshotUser => {
      teacher = models.createUser(snapshotUser)
      return database.ref('/consulting sessions').orderByChild('teacher').equalTo(teacher.id).once('value')
    }).then(snapshotAsesorias => {
      var asesorias = []
      snapshotAsesorias.forEach(snap => {
        var asesoria = models.createAsesoria(snap)
        asesorias.push(asesoria)
      })
      return response.render('main_menu_professor', {
        name: teacher.name,
        asesorias: asesorias
      })
    })
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
    console.log("Error " + err);
    return response.render('login');
  })
});

app.get('/logout', (request, response) => {
  auth.signOut().then(() => {
    response.redirect('/login')
  })
})

exports.app = functions.https.onRequest(app);