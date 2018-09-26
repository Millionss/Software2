class Asesoria {
    constructor(uid, citas, dias, horario, profesorUID) {
        this.id = uid
        this.citas = citas
        this.dias = dias
        this.horario = horario
        this.profesorUID = profesorUID
    }
}

class Cita {
    constructor(uid, studentID, date) {
        this.uid = uid
        this.studentID = studentID
        this.date = date
    }
}

module.exports = {
    Asesoria: Asesoria,
    Cita: Cita
}