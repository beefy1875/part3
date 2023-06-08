const mongoose = require('mongoose')

const password = process.argv[2]
const url = `mongodb+srv://beefy1875:${password}@cluster0.h93wm0x.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)


if (process.argv.length === 3) {
    console.log('phonebook:');
    Person
    .find({}) 
    .then(persons => {
        persons.forEach(p => console.log(p.name, p.number))
        mongoose.connection.close()
    })
} else if (process.argv.length === 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })
    
    person.save().then(result => {
        console.log('saved')
        mongoose.connection.close()
    })
}
