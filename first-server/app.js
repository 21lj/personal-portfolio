// console.log("HelloWorld!!!!!!!!!!!!")
// console.log("JAJAJA")
// console.log(__dirname)
// console.log(__filename)

// const os = require('os')
// console.log(`Current Working Directory is : ${os.homedir()}`)
// console.log(`The platform is: ${os.platform()}`)
// console.log(os.machine())

// const fs = require('fs')
// const files = fs.readdirSync('./')
// console.log(files)

// const greeter = require('./greeting')
// greeter("jajaja")

// // Task
// const funs = require('./task')
// const {add, mul, mod} = funs
// console.log(add(5, 10))
// console.log(mod(88, 10))
// console.log(mul(5, 10))
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const port = 3000
const productRouter = require('./routers/productRouter')
const categoryRouter = require('./routers/categoryRouter')
app.use(express.json())


app.use('/products', productRouter)
app.use('/category', categoryRouter)
app.get('/', (req, res) => {
    res.send("Hello World")
})

app.get('/test', (req, res) => {
    res.send("test page")
})


// main()
// .then(() => console.log("DB CONNECTED...."))
// .catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('mongodb+srv://JAJAJA_db_user:password123@cluster0.sauapp9.mongodb.net/RITDB2026');

//   // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
// }

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})