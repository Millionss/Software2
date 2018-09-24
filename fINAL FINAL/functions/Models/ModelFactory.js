const Course = require('./Course.js');
const User = require('./User.js');

class ModelFactory {
    createUser(snapshot, courses) {
        const val = snapshot.val()
        var alumnee;
        switch (val.type) {
            case "alumnee":
            alumnee = new User(snapshot.key, val.name, val.email, val.type, courses);
            break;
            case "professor":
            alumnee = new User(snapshot.key, val.name, val.email, val.type);
            break;
        }
        return alumnee;
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