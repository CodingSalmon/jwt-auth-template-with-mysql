const mysql = require('mysql');

let db

let databaseName = 'JWTTemplate'

let connectionInfo = {
    host:'localhost',
    user:'root',
    password:process.env.MYSQL_PW,
}

const initialConnection = mysql.createConnection(connectionInfo)

function createUserTable() {
    db.query("CREATE TABLE users(id INT AUTO_INCREMENT NOT_NULL, name VARCHAR(45) NOT_NULL, email VARCHAR(320) NOT_NULL UNIQUE, password VARCHAR(200) NOT_NULL, resetLink VARCHAR(200) NOT_NULL DEFAULT '', PRIMARY KEY id);", () => {

    })
}

initialConnection.query('SHOW DATABASES;', (err, databases) => {
    if(err) throw err;
    if(databases.some(db => db.Database === `${databaseName}`)) {
        connectionInfo.database = `${databaseName}`
        db = mysql.createConnection(connectionInfo)
        console.log(`MySQL connected to ${db.config.database} database.`)
    } else {
        initialConnection.query(`CREATE DATABASE ${databaseName};`, (err, res) => {
            if (err) throw err;
            console.log(`${databaseName} database created`)
            connectionInfo.database = `${databaseName}`
            db = mysql.createConnection(connectionInfo)
            console.log(`MySQL connected to ${db.config.database} database.`)
        })
    }
})

module.exports = db;