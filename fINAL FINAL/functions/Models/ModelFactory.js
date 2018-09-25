const Course = require('./Course.js');
const User = require('./User.js');

class ModelFactory {
    createUser(snapshot, courses) {
        const val = snapshot.val()
        var user;
        switch (val.type) {
            case "alumnee":
            user = new User(snapshot.key, val.name, val.email, val.type, courses);
            break;
            case "professor":
            user = new User(snapshot.key, val.name, val.email, val.type);
            break;
        }
        return user;
    }

    createAdmin(snapshot) {
        const val = snapshot.val()
        var admin;
        admin = new Admin(snapshot.key, val.name)
        
        return admin;
    }

    createCourse(snapshotCourse, snapshotTeacher) {
        const val = snapshotCourse.val();
        var course;
        var teacher = this.createUser(snapshotTeacher)
        course = new Course(snapshotCourse.key, val.name, val.section, teacher)
        return course;
    }
}
  
module.exports = ModelFactory;