const functions = require('firebase-functions');
const firebase = require('firebase');
const express = require('express');
const session = require('express-session');
const engine = require('pug');
const modelsClass = require('./Models/ModelFactory');
const uuid = require('uuid/v4');

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

/**
 * Funcion que sirve para borrar asesorias por un administrador.
 */
app.get('/admin_borrar_asesoria', (request, response) => {
  const uid = request.query.uid
  console.log("Asesoria: "+uid)
  database.ref('/consulting sessions/'+uid).remove().then(() => {
    response.redirect('/')
  }).catch(err => {
    console.log("Error: "+err);
    response.redirect('/')
  })
})

/**
 * Funcion que maneja la creacion de asesorias. Recibe los siguientes parametros:
 *    days: array de Strings
 *    time: String
 *    teacher: uid del profesor que es un String
 * 
 * Al final redirecciona al usuario a su pagina principal. Se podria mejorar con AJAX y JS frontend
 */
app.post('/admin_crear_asesoria', (request, response) => {
  const days = request.body.days
  const time = request.body.time
  const teacher = request.body.teacher

  const uid = uuid()
  console.log(uid)

  database.ref(`/consulting sessions/${uid}`).set({
    teacher: teacher,
    schedule: {
      time: time,
      days: days
    }
  }).then( _ => {
    response.redirect('/')
  })
})

/**
 * Funcion que maneja la actualizacion de asesorias. Recibe los siguientes parametros:
 *    days: array de Strings
 *    time: String
 *    teacher: uid del profesor que es un String
 *    uid: uid de la asesoria para actualizar. Es un String
 * 
 * Al final redirecciona al usuario a su pagina principal. Se podria mejorar con AJAX y JS frontend
 */
app.post('/admin_actualizar_asesoria', (request, response) => {
  const days = request.body.days
  const time = request.body.time
  const teacher = request.body.teacher
  const uid = request.body.uid

  database.ref(`/consulting sessions/${uid}`).update({
    teacher: teacher,
    schedule: {
      time: time,
      days: days
    }
  }).then(_ => {
    response.redirect('/')
  })
})

app.get('/login', (request, response) => {
  response.render('login');
});

/**
 * Funcion que muestra el menu principal de administrador.
 * Primero se llaman todas las asesorias y se almacenan en un array de objetos de tipo Asesoria
 * Seguido de esto, se llama cada profesor de las asesorias desde firebase y se reemplaza su uid en
 * el objeto Asesoria por su nombre real.
 * Para terminar, se renderiza el pug de main_menu_admin con parametros de nombre del administrador y 
 * el array de asesorias.
 */
app.get('/main_menu_admin', (request, response) => {
  if (auth.currentUser !== null) {
    var admin;
    var asesorias = []
    database.ref('/users/' + auth.currentUser.uid).once('value').then((snapshotUser) => {
      admin = models.createUser(snapshotUser)
      return database.ref('/consulting sessions').orderByChild('teacher').once('value')
    }).then(snapshotAsesorias => {
      snapshotAsesorias.forEach(snap => {
        const asesoria = models.createAsesoria(snap)
        asesorias.push(asesoria)
      }) 
      return database.ref('/users').orderByChild("type").equalTo("professor").once('value')
    }).then(teacherSnapshots => {
      var teachers = []

      teacherSnapshots.forEach(teacherSnap => {
        var teacher = models.createUser(teacherSnap)
        teachers.push(teacher)
      })

      asesorias.forEach(asesoria => {
        var exactTeacher = teachers.find(element => {
          return element.id == asesoria.profesorUID
        })
        asesoria.profesorUID = exactTeacher.name
      })
      console.log("Profesores")
      console.log(teachers)
      console.log(asesorias)
      return response.render('main_menu_admin', {
        name: admin.name,
        asesorias: asesorias,
        teachers: teachers
      })
    }) 
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
          //console.log(teacherID)
          console.log('===========')
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
        //console.log(teachers)
        return response.render('main_menu_alumnee', {
          name: student,
          teachers: teachers
        })
      })
  }else {
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

app.get('/pantalla_seleccion', (request, response) => {
  if (auth.currentUser !== null) {
    var cs = []
    var coursesSnapshots = []
    var teachers = []
    var user

    const promiseCS = database.ref('/users/' + auth.currentUser.uid).once('value').then(snapshotUser => {
      user = models.createUser(snapshotUser)
      const consultingSessions = user.consultingSessionsAttended.map(consultingSessionsAttended =>
         database.ref(`consulting sessions/${consultingSessionsAttended}`).once('value'))

      return Promise.all(consultingSessions) 
    }).then(csSnapshots => {
       csSnapshots.forEach(snapshot => {
        var session = models.createAsesoria(snapshot)
        const citas = session.citas.filter(cita => cita.studentID == user.id)
        session.citas = citas
        cs.push(session)
      })
      const teacherPromises = cs.map(session => {
        return database.ref(`users/${session.teacherID}`).once('value') 
      })

      return Promise.all(teacherPromises)
    }).then(teacherSnapshots => {
      const teachers = []
      teacherSnapshots.forEach(snap => {
        teachers.push(models.createUser(snap))
      })
      cs.forEach(session => {
        const exactTeacher = teachers.find(element => {
          return element.id == session.teacherID
        })
        session.teacherID = exactTeacher.name
      })
    })

    const promiseUser = database.ref('/users/' + auth.currentUser.uid).once('value').then(snapshotUser => {
      student = models.createUser(snapshotUser)
      const promises = []
      snapshotUser.child('courses').forEach(course => {
        coursesSnapshots.push(course)
        var teacherID = course.val().teacher
        promises.push(promise = database.ref('/users/' + teacherID).once('value'))
      })
      return Promise.all(promises)
    }).then(teacherSnapshots => {
      student.courses = []
      teacherSnapshots.forEach((teacherSnapshot, index) => {
        const course = models.createCourse(coursesSnapshots[index], teacherSnapshot)
        student.courses.push(course)
      })
      teachers = student.filterCoursesByTeacher()
    })

    Promise.all([promiseCS, promiseUser]).then(_ => {
      response.render('pantalla_seleccion', {
        cs: cs,
        teachers: teachers
      })
    })
    console.log(session)
    console.log('===========hola=====')
    console.log(cs)
  } else {
    response.redirect(307, '/')
  }
})


exports.app = functions.https.onRequest(app);