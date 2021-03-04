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
    db.query("CREATE TABLE users(id INT AUTO_INCREMENT, name VARCHAR(45), email VARCHAR(320) UNIQUE, password VARCHAR(200), resetLink VARCHAR(200) DEFAULT '', PRIMARY KEY (id));", (err, res) => {
        if (err) throw err;
        console.log('User table created.')
    })
}


initialConnection.query('SHOW DATABASES;', (err, databases) => {
    if(err) throw err;
    if(databases.some(db => db.Database === `${databaseName}`)) {
        connectionInfo.database = `${databaseName}`
        db = mysql.createConnection(connectionInfo)
        console.log(`MySQL connected to ${db.config.database} database.`)
        db.query(`SELECT * FROM information_schema.tables WHERE table_schema = '${databaseName}' AND table_name = 'users';`, (err, res) => {
            if(err) throw err;
            if(!res.length) {
                createUserTable()
            }
        })
    } else {
        initialConnection.query(`CREATE DATABASE ${databaseName};`, (err, res) => {
            if (err) throw err;
            console.log(`${databaseName} database created.`)
            connectionInfo.database = `${databaseName}`
            db = mysql.createConnection(connectionInfo)
            console.log(`MySQL connected to ${db.config.database} database.`)
            createUserTable()
        })
    }
})

module.exports = db;