const mysql = require('mysql');

const mysqlHost = process.env.MYSQL_HOST
const mysqlUser = process.env.MYSQL_USER
const mysqlPw = process.env.MYSQL_PW
const mysqlDb = process.env.MYSQL_DB

let db

let connectionInfo = {
    host:mysqlHost,
    user:mysqlUser,
    password:mysqlPw,
}

const initialConnection = mysql.createConnection(connectionInfo)

function connectToDatabase() {
    connectionInfo.database = `${mysqlDb}`
    db = mysql.createConnection(connectionInfo)
    db.connect((err) => {
        if(err) throw err;
        console.log(`MySQL connected to ${db.config.database} database.`)
    })
}

function createUserTable() {
    db.query("CREATE TABLE users(id INT AUTO_INCREMENT NOT NULL, name VARCHAR(45) NOT NULL, email VARCHAR(320) NOT NULL UNIQUE, password VARCHAR(60) NOT NULL, resetLink VARCHAR(2000) NOT NULL DEFAULT '', PRIMARY KEY (id));", (err, res) => {
        if (err) throw err;
        console.log('User table created.')
    })
}

function createFriendTable() {
    db.query("CREATE TABLE friends(senderId INT, receiverId INT, status ENUM('0', '1') DEFAULT '0', FOREIGN KEY(senderId) REFERENCES users(id), FOREIGN KEY(receiverId) REFERENCES users(id));", (err, res) => {
        if (err) throw err;
        console.log('Friend table created.')
    })
}

initialConnection.query('SHOW DATABASES;', (err, databases) => {
    if(err) throw err;
    if(databases.some(db => db.Database === `${mysqlDb}`)) {
        connectToDatabase()
        db.query(`SELECT * FROM information_schema.tables WHERE table_schema = '${mysqlDb}';`, (err, res) => {
            if(err) throw err;
            if(!res.some(table => table.TABLE_NAME === 'users')) {
                createUserTable()
            }
            if(!res.some(table => table.TABLE_NAME === 'friends')) {
                createFriendTable()
            }
        })
    } else {
        initialConnection.query(`CREATE DATABASE ${mysqlDb};`, (err, res) => {
            if (err) throw err;
            console.log(`${mysqlDb} database created.`)
            connectToDatabase()
            createUserTable()
            createFriendTable()
        })
    }
})

let mysqlCon = mysql.createConnection({
    host:`${mysqlHost}`,
    user:`${mysqlUser}`,
    password:`${mysqlPw}`,
    database:`${mysqlDb || mysqlDb}`
})

module.exports = mysqlCon