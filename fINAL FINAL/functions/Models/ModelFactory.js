const Course = require('./Course.js')
const User = require('./User.js')


module.exports = {
    createUser(snapshot) {
        const val = snapshot.val()
        var courses = []
        var alumnee;
        console.log(val.type)
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
}

module.exports = {
    createAsesoria(snapshot) {
        const val = snapshot.val()
        var courses = []
        var teacher
        var asesoria;
        console.log(val.type)
        switch (val.type) {
            asesoria= new Asesoria(snapshot.key, val.name, courses);
            break;
        }
        return asesoria;
    }
}
