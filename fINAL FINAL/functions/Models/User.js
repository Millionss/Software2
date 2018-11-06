class User {
    constructor(id, name, email) {
        this.id = id
        this.name = name
        this.email = email
    }
}

class Student extends User {
    constructor(id, name, email, courses, consultingSessionsAttended) {
        super(id, name, email)
        this.courses = courses
        this.consultingSessionsAttended = consultingSessionsAttended
    }

    /**
     * Filtra los cursos para crear y retornar un array de Profesores con los que se ha inscrito
     * el alumno y los cursos que lleva con ellos
     * No toma en cuenta uid y email. LOS CURSOS SON UN STRING, NO UN ARRAY. 
     * NO USAR PARA OTRA FUNCIONALIDAD
     * Esta funcion se utiliza para mostrar la informacion del alumno en la su pagina principal. 
     */
    filterCoursesByTeacher() {
        var teachers = []
        this.courses.forEach(course => {
            var name = course.teacher.name
            var teacher = new Teacher(undefined, name, undefined, course.name)
            
            const index = teachers.findIndex(x => x.name === name)
            if (index >= 0) {
                teachers[index].courses = teachers[index].courses + ", " + course.name
            } else {
                teachers.push(teacher)
            }
        })
        return teachers
    }
}

class Teacher extends User {
    constructor(id, name, email, courses) {
        super(id, name, email)
        this.courses = courses
    }
}

class Admin extends User {
    constructor(id, name, email){
        super(id, name, email)
    }
}

module.exports = {
    User: User,
    Student: Student,
    Teacher: Teacher,
    Admin: Admin
}