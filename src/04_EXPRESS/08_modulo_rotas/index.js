const express = require('express')
const app = express()
const port = 3000

const path = require("path")

const basePath = path.join(__dirname, 'templates')

const users = require('./users')

app.use(
    express.urlencoded({
        extended: true,
    }),
)
app.use(express.json())

app.use('/users', users)

app.get("/add", (req, res) => {
    res.sendFile(`${basePath}/userForm.html`)
})

app.post('/save', (req, res) => {
    console.log(req.body)
})

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}!`)
})