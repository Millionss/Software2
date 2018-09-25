class User {
    constructor(id, name, email) {
        this.id = id
        this.name = name
        this.email = email
    }
}

class Student extends User {
    constructor(id, name, email, courses) {
        super(id, name, email)
        self.courses = courses
    }

    filterCoursesByTeacher() {
        var teachers = []
        this.courses.forEach(course => {
            var name = course.teacher
            
        })
    }
}

class Teacher extends User {
    constructor(id, name, email, courses) {
        super(id, name, email)
        self.courses = courses
    }
}

class Admin extends User {

}

module.exports = {
    User: User,
    Studente: Student,
    Teacher: Teacher,
    Admin: Admin
}