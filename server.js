const express = require('express')
const PORT = 3000
const app = express()

const ProductRoutes = require('./routes')
const mongoose = require('mongoose')


mongoose.connect('mongodb+srv://test:sparta@cluster0.hlswz.mongodb.net/?retryWrites=true&w=majority',
    {
        useNewUrlParser: true
    }).then(()=> console.log('몽고디비 커넥트'))
    .catch(err => console.log(err))

//미들웨어 함수
app.use(express.json())

app.use('/api/products', ProductRoutes)

app.get('/', (req, res)=> {
    res.send('Hello World')
})

app.use((error, req, res, next)=> {
    res.status(500).json({ message: error.message})
})
app.listen(PORT)
console.log(`${PORT}로 연결되었습니다.`)


module.exports = app