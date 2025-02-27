const express = require('express')
const router = express.Router()
const port = 3000

const path = require("path")

const basePath = path.join(__dirname, '../templates')

router.use(
    express.urlencoded({
        extended: true,
    }),
)
router.use(express.json())

router.get("/", (req, res) => {
    res.sendFile(`${basePath}/index.html`)
})

router.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}!`)
})

module.exports = router