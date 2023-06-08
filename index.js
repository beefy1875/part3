require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

const Person = require('./models/person')

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if(error.name === 'CastError') {
        return response.status(400).send({error: 'malformed id'})
    } else if(error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }
    next(error)
}

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

morgan.token('type', (req, res) => {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))

app.get('/', (request, response) => {
    response.send('<h1>Hello world</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({})
    .then(persons => response.json(persons))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
    .then(person => {
        response.json(person)
    })
    .catch(error => next(error))
})

app.get('/api/info', (request, response) => {
    Person.countDocuments({})
    .then(result => {
        response.send(`Phonebook has info for ${result} people</br>${new Date()}`)
    })
})

app.post('/api/persons/', (request, response, next) => {
    const newId = Math.floor(Math.random() * 10000)

    if (request.body.name === "") {
        return response.status(400).json({
            error: 'name missing'
        })
    }
    if (request.body.number === "") {
        return response.status(400).json({
            error: 'number missing'
        })        
    }
    // if (persons.find(p => p.name === request.body.name)) {
    //     console.log('repeat')
    //     return response.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }
    const person = new Person ({
        "id": newId,
        "name": request.body.name, 
        "number": request.body.number
    })

    console.log('about to save')
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
    
})

app.put('/api/persons/:id', (request, response, next) => {
    const person = {
        name: request.body.name,
        number: request.body.number,
    }
    Person.findByIdAndUpdate(
        request.params.id, 
        person, 
        {new: true, runValidators:true, context: 'query'})
    .then(updatedPerson => {
        response.json(updatedPerson)
    })
    .catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)