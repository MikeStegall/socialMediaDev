const express = require('express')
const connectdb = require('./config/db')

const app = express()
connectdb()

app.get('/', (req, res) => res.send('API running'))

app.use(express.json({ extended: false }))

app.use('/api/users', require('./routes/api/users'))
app.use('/api/post', require('./routes/api/post'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))

const PORT = process.env.PORT || 6000

app.listen(PORT, () => console.log(`server started on port: ${PORT}`))
