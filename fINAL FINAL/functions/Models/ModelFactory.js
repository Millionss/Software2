const Course = require('./Course.js');
const users = require('./User.js');
const asesoria = require('./Asesoria.js')

class ModelFactory {
    /**
     * Funcion que se encarga en crear un usario sin importar que tipo. 
     * Retorna un usuario de clase Alumno, profesor o admin. En caso que sea ninguno devuelve undefined
     * @param {Snapshot de usuario obtenido de Firebase} snapshot 
     */
    createUser(snapshot) {
        const val = snapshot.val()
        var alumnee;
        switch (val.type) {
            case "alumnee":
                alumnee = new users.Student(snapshot.key, val.name, val.email, []);
                break;
            case "professor":
                alumnee = new users.Teacher(snapshot.key, val.name, val.email, []);
                break;
            case "admin":
                //TODO
                break;
        }
        return alumnee;
    }

    /**
     * Funcion que se encarga de crear un curso
     * Retorna un objeto de la clase Course con un objeto de clase Teacher como parametro dentro de este.
     * @param {Snapshot de un curso obtenido de firebase} snapshotCourse 
     * @param {Snapshot de un profesor obtenido de firebase} snapshotTeacher 
     */
    createCourse(snapshotCourse, snapshotTeacher) {
        const val = snapshotCourse.val();
        var course;
        var teacher = this.createUser(snapshotTeacher)
        course = new Course(snapshotCourse.key, val.name, teacher)
        return course;
    }

    /**
     * Funcion que se encarga de crear una asesoria
     * Retorna un objeto de la clase Asesoria.
     * @param {Snapshot de una asesoria obtenida de firebase} snapshot 
     */
    createAsesoria(snapshot) {
        const val = snapshot.val();
        var days = "";
        //Guardamos los dias como un string
        snapshot.child('schedule/days').forEach(day => {
            console.log(days)
            if (days) {
                days = days + ", " + day.val();
            } else {
                days = day.val();
            }
        })
        var time = val.schedule.time;
        var teacherUID = val.teacher;
        var citas = []
        snapshot.child('appointments').forEach(appointment => {
            var cita = new asesoria.Cita(appointment.key, appointment.val().student, appointment.val().date)
            citas.push(cita)
        })
        
        return new asesoria.Asesoria(snapshot.key, citas, days, time, teacherUID);
    }
}

module.exports = ModelFactory;