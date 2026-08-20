const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

const authRoutes = require('./routers/authRoutes')
const playerRoutes = require('./routers/playerRoutes')
const PerformanceRoutes = require('./routers/performanceRoutes')
const transferOfferRoutes = require('./routers/transferOfferRoutes')
const aiRoutes = require('./routers/aiRoutes')
const messageRoutes = require('./routers/messageRoutes')
const clubRoutes = require('./routers/clubRoutes')

app.use(cors())
app.use(express.json())


app.use('/api/auth', authRoutes)
app.use('/api/players', playerRoutes)
app.use('/api/performance', PerformanceRoutes)
app.use('/api/transfer-offers', transferOfferRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/clubs', clubRoutes)

app.get('/', (req, res) => {
  res.send('Scoutify API Running...')
})

const PORT = process.env.PORT || 3000

main()
.then(() => console.log("DB CONNECTED..."))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}

app.listen(PORT, "0.0.0.0",()=>{
    console.log(`http://localhost:${PORT}`)
})



