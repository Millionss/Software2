class User {
    constructor(id, name, email, type, courses) {
        this.id = id
        this.name = name
        this.email = email
        this.type = type
        this.courses = courses
    }
}
class Admin extends User {
    constructor(id, name, email, type){
        this.id = id
        this.name = name
        this.email = email
        this.type = type
    }
}
module.exports = User
module.exports = Admin