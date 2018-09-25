const Course = require('./Course.js');
const users = require('./User.js');

class ModelFactory {
    /**
     * Funcion que se encarga en crear un usario sin importar que tipo. 
     * Retorna un usuario de clase Alumno, profesor o admin. En caso que sea ninguno devuelve undefined
     * @param {Snapshot de usuario obtenido de Firebase} snapshot 
     */
    createUser(snapshot) {
        const val = snapshot.val()
        var user;
        switch (val.type) {
            case "alumnee":
            alumnee = new users.Student(snapshot.key, val.name, val.email, val.type, []);
            break;
            case "professor":
            alumnee = new users.Teacher(snapshot.key, val.name, val.email, val.type);
            break;
            case "admin":
            alumnee = new users.Admin(snapshot.key, val.name, val.email, val.type);
            break;
        }
        return user;
    }

    /**
     * 
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
}
  
module.exports = ModelFactory;