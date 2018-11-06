class Asesoria {
    constructor(uid, citas, dias, horario, teacherID) {
        this.id = uid
        this.citas = citas
        this.dias = dias
        this.horario = horario
        this.teacherID = teacherID
    }
}

class Cita {
    constructor(uid, studentID, date, completed) {
        this.uid = uid
        this.studentID = studentID
        this.date = date
        this.completed = completed
    }
}

module.exports = {
    Asesoria: Asesoria,
    Cita: Cita
}