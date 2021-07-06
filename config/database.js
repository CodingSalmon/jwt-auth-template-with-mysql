const mysql = require('mysql');

const mysqlHost = process.env.MYSQL_HOST
const mysqlUser = process.env.MYSQL_USER
const mysqlPw = process.env.MYSQL_PW
const mysqlDb = process.env.MYSQL_DB

const initialConnection = mysql.createPool({
    host:mysqlHost,
    user:mysqlUser,
    password:mysqlPw,
})

const mysqlPool = mysql.createPool({
    host:mysqlHost,
    user:mysqlUser,
    password:mysqlPw,
    database:mysqlDb
})

function createTables() {
    mysqlPool.query("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(45) NOT NULL, email VARCHAR(100) UNIQUE, password VARCHAR(60) NOT NULL, resetLink VARCHAR(150) DEFAULT '', PRIMARY KEY (id));", (error, res) => {
        if (error) throw error;
        console.log('User table exists or was created.')
        mysqlPool.query("CREATE TABLE IF NOT EXISTS friends (senderId INT, receiverId INT, status ENUM('0', '1') DEFAULT '0', FOREIGN KEY(senderId) REFERENCES users(id), FOREIGN KEY(receiverId) REFERENCES users(id));", (err, res) => {
            if (err) throw err;
            console.log('Friend table exists or was created.')
        })
    })
}

initialConnection.query(`CREATE DATABASE IF NOT EXISTS ${mysqlDb};`, (err, databases) => {
    if(err) throw err;
    console.log(`${mysqlDb} database exists or was created.`)
    createTables()
})

module.exports = mysqlPool