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

/**
 * Maneja la pagina principal. Este get redirecciona al usuario a su menu principal segun su 
 * tipo de usuario. Si no se encuentra autentificado, se lo redirecciona al login.
 * En sesion se busca almacenar el tipo del usuario para no volver a hacer un request a firebase
 * en vano. 
 * 
 * No estoy seguro que el session funcione como esperaba.
 */
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
  if (auth.currentUser !== null) {
    database.ref('/users/' + auth.currentUser.uid).once('value').then((snapshotUser) => {
      var admin = models.createUser(snapshotUser)
      console.log(admin)
      return response.render('main_menu_admin', {});
    }).catch(err => console.log("error: " + err));
  } else {
    response.redirect(307, '/login')
  }
})

/**
 * Esta funcion muestra el menu principal del alumno.
 * Primero se obtiene el snapshot del alumno desde Firebase y se crea un objeto de clase Student.
 * Despues, se obtiene el hijo 'Courses' y se iteran sus IDs respectivos. Al obtenerlos se realizan
 * requests paralelos para obtener el curso. Una vez obtenido esto, se realiza otro request para obtener 
 * al profesor por su ID. Todo esto se almacena en un objeto de tipo Curso que contiene un objeto de tipo
 * Teacher dentro de este y se lo agrega a un array de cursos cotenido en alumno. 
 * 
 * Finalmente, se pinta el pug de main_menu_alumno con parametros para su nombre y el array de cursos.
 */
app.get('/main_menu_alumnee', (request, response) => {
    if (auth.currentUser !== null) {
      var student;
      var coursesSnapshots = []
      database.ref('/users/' + auth.currentUser.uid).once('value').then(snapshotUser => {
        student = models.createUser(snapshotUser)
        var promises = [];

        snapshotUser.child('courses').forEach(course => {
          coursesSnapshots.push(course)
          var teacherID = course.val().teacher
          console.log(teacherID)
          promise = database.ref('/users/' + teacherID).once('value')
          promises.push(promise)
        })
        return Promise.all(promises)
      }).then(teacherSnapshots => {
        teacherSnapshots.forEach((teacherSnapshot, index) => {
          const course = models.createCourse(coursesSnapshots[index], teacherSnapshot)
          student.courses.push(course)
        })
        const teachers = student.filterCoursesByTeacher()
        return response.render('main_menu_alumnee', {
          name: student.name,
          teachers: teachers
        }) 
      })
}
else {
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