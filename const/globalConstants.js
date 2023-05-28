require('dotenv').config() //Required in order to use environment variables

module.exports ={
    PORT: process.env.PORT,
    dbName: process.env.dbName,
    dbUserName: process.env.dbUserName,
    dbPassword: process.env.dbPassword,
}