const db = require('../config/database');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 6;

module.exports = {
  signup,
  login,
  show,
  forgotPassword,
  updatePassword,
  addFriend,
  acceptFriend,
  deleteFriend,
  getFriends,
  getFriendRequests,
  getUsers,
};

function hashPassword(user, cb) {
  bcrypt.hash(user.password, SALT_ROUNDS, function(err, hash) {
    if (err) throw err;
    user.password = hash;
    cb(user)
  });
}

function createJWT(user) {
  return jwt.sign(
    {user},
    process.env.SECRET,
    {expiresIn: '24h'}
  );
}

function signup(req, res) {
  try {
    hashPassword(req.body, (hashedUser) => {
      db.query(`INSERT INTO users (name, email, password) VALUES ('${hashedUser.name}', '${hashedUser.email}', '${hashedUser.password}')`, (err, result) => {
        if(err) return res.status(500).json({err: 'Error: Database error'});
        const token = createJWT(hashedUser)
        return res.json({token})
      })
    })
  } catch (err) {
    return res.status(400).json(err);
  }
}

function login(req, res) {
  try {
    db.query(`SELECT * FROM users WHERE email = '${req.body.email}'`, (err, result) => {
      if (err) return res.status(401).json({err: 'Error: Bad credentials'});
      let user = result[0]
      if(!user) return res.status(401).json({err: 'Error: User does not exist'})
      bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
        if (isMatch) {
          const token = createJWT(user);
          return res.json({token})
        } else {
          return res.status(401).json({err: 'Error: Bad credentials'});
        }
      });
    })
  } catch (err) {
    return res.status(401).json(err);
  }
}

function show(req, res) {
  db.query(`SELECT id, name, email FROM users WHERE id = '${req.params.id}'`, (err, result) => {
    if (err) return res.status(401).json({err: 'Error: Bad credentials'});
    return res.json(result[0])
  })
}

function forgotPassword(req, res) {
  const email = req.body.email
  db.query(`SELECT * FROM users WHERE email = '${email}'`, (err, result) => {
    const user = result[0]
    if (err || !user) {
      return res.status(400).json({error: 'User with this email does not exist'})
    }
    
    const token = jwt.sign({id: user.id}, process.env.RESET_PASSWORD_KEY, {expiresIn: '15m'})

    let transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
              user: process.env.GOOGLE_APP_EMAIL,
              pass: process.env.GOOGLE_APP_PW
          },
    });
    
    const data = {
      to: email,
      subject: 'Reset Account Password Link',
      html: `
      <h3>Please click the link below to reset your password</h3>
      <p>${process.env.CLIENT_URL}/resetpassword/${token}</p>
      `,
    }
    
    db.query(`UPDATE users SET resetLink = '${token}' WHERE email = '${email}'`, (err, result) => {
      if (err) {
        return res.status(400).json({error: 'reset password link error'})
      } else {
        transporter.sendMail(data, function(error, body) {
          if (error) {
            return res.status(400).json({error: error.message})
          }
          return res.status(200).json({message: 'Email has been sent, please follow the instructions'})
        })
      }
    })
  })
}

function updatePassword(req, res) {
  const {token} = req.body
  if (token) {
    jwt.verify(token, process.env.RESET_PASSWORD_KEY, function(error, decodedData) {
      if (error) {
        return res.status(400).json({error: 'Incorrect token or it is expired'})
      }
      db.query(`SELECT * FROM users WHERE resetLink = '${token}'`, (err, result) => {
        const user = result[0]
        if (err || !user) {
          return res.status(400).json({error: 'User with this token does not exist'})
        }
        try {
          hashPassword(req.body, (hashedUser) => {
            db.query(`UPDATE users SET password = '${hashedUser.password}' WHERE resetLink = '${hashedUser.token}'`, (err, result) => {
              if (err) {
                return res.status(400).json({error: 'Reset Password Error'})
              } else {
                return res.status(200).json({message:'Your password has been changed'})
              }
            })
          })
        } catch (err) {
          return res.status(401).json(err);
        }
      })
    })
  } else {
    return res.status(401).json({error: "Authentication Error"})
  }
}

function addFriend(req, res) {
  db.query(`INSERT INTO friends (senderId, receiverId) VALUES ('${req.params.id1}', '${req.params.id2}')`, (err, result) => {
    if (err) {
      return res.status(400).json({error: 'User does not exist'})
    }
    db.query(`SELECT * FROM friends WHERE senderId = '${req.params.id1}' AND receiverId = '${req.params.id2}'`, (err, resu) => {
      return res.json(resu[0])
    })
  })
}

function acceptFriend(req, res) {
  db.query(`UPDATE friends SET status = '1' WHERE (senderId = '${req.params.id1}' OR receiverId = '${req.params.id1}') AND (senderId = '${req.params.id2}' OR receiverId = '${req.params.id2}')`, (err, result) => {
    if (err) {
      return res.status(400).json({error: 'Friend request does not exist'})
    }
    db.query(`SELECT id, name, email FROM users WHERE id = '${req.params.id2}'`, (err, result) => {
      return res.json(result[0])
    })
  })
}

function deleteFriend(req, res) {
  db.query(`DELETE FROM friends WHERE (senderId = '${req.params.id1}' OR receiverId = '${req.params.id1}') AND (senderId = '${req.params.id2}' OR receiverId = '${req.params.id2}')`, (err, result) => {
    if (err) {
      return res.status(400).json({error: 'Friend request does not exist'})
    }
    return res.json(result)
  })
}

function getFriends(req, res) {
  const response = {friends: [], incRequests: [], outRequests: []}
  db.query(`SELECT * FROM friends WHERE senderId = '${req.params.userId}' OR receiverId = '${req.params.userId}'`, async (err, result) => {
    if (err) {
      return res.status(400).json({error: 'No id was given'})
    }
    
    const promises = result.map((resu) => {
      if (resu.status == 0) {
        if (resu.senderId == req.params.userId) {
          return new Promise((resolve, reject) => {db.query(`SELECT id, name, email FROM users WHERE id = '${resu.receiverId}'`, (err, r) => {
            response.outRequests.push(r[0])
            resolve()
          })})
        } else {
          return new Promise((resolve, reject) => {db.query(`SELECT id, name, email FROM users WHERE id = '${resu.senderId}'`, (err, r) => {
            response.incRequests.push(r[0])
            resolve()
          })})
        }
      } else {
        if (resu.senderId == req.params.userId) {
          return new Promise((resolve, reject) => {db.query(`SELECT id, name, email FROM users WHERE id = '${resu.receiverId}'`, (err, r) => {
            response.friends.push(r[0])
            resolve()
          })})
        } else {
          return new Promise((resolve, reject) => {db.query(`SELECT id, name, email FROM users WHERE id = '${resu.senderId}'`, (err, r) => {
            response.friends.push(r[0])
            resolve()
          })})
        }
      }
    })
    await Promise.all(promises)
    return res.json(response)
  })
}

function getFriendRequests(req, res) {
  db.query(`SELECT senderId, receiverId, status FROM friends`, (err, result) => {
    if (err) {
      return res.status(400).json({error: 'No id was given'})
    }
    return res.json(result)
  })
}

function getUsers(req, res) {
  db.query(`SELECT id, name, email FROM users`, (err, result) => {
    if (err) {
      return res.status(400).json({error: 'No id was given'})
    }
    return res.json(result)
  })
}