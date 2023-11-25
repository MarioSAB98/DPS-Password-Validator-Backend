require('dotenv').config()

const mongoose = require('mongoose');

const dbConnect = () => {
    mongoose.connect(process.env.MONGODB_URL).then(() => {
        console.log('db connected successfully');
    }).catch((err) => (console.log(err)))
}

module.exports = dbConnect;