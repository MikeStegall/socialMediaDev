const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI')

const connectdb = async () => {
  try {
    await mongoose.connect(db, {
      // useNewURLParser: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
    })
    console.log('mongodb connected')
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}

module.exports = connectdb
