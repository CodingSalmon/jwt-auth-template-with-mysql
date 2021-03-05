const db = require('../config/database');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 6;
let User

module.exports = {
  signup,
  login,
  show,
  forgotPassword,
  updatePassword,
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
    hashPassword(req.body, (user) => {
      db.query(`INSERT INTO users (name, email, password) VALUES ('${user.name}', '${user.email}', '${user.password}')`, (err, result) => {
        if(err) res.status(500).json({err: 'Error: Database error'});
        const token = createJWT(user)
        res.json({token})
      })
    })
  } catch (err) {
    res.status(400).json(err);
  }
}

async function login(req, res) {
  try {
    db.query(`SELECT * FROM users WHERE email = '${req.body.email}' LIMIT 1`, (err, result) => {
      if (err) return res.status(401).json({err: 'Error: Bad credentials'});
      let user = result[0]
      bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
        if (isMatch) {
          const token = createJWT(user);
          res.json({token});
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
  User.findById(req.params.id)
  .then(res => res.json());
}

function forgotPassword(req, res) {
  const email = req.body.email
  User.findOne({email}, (err, user) => {
    if (err || !user) {
      return res.status(400).json({error: 'User with this email already exists'})
    }
    
    const token = jwt.sign({_id: user._id}, process.env.RESET_PASSWORD_KEY, {expiresIn: '15m'})

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
    
    return user.updateOne({resetLink: token}, (err, user) => {
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

async function updatePassword(req, res) {
  const {token, password} = req.body
  if (token) {
    jwt.verify(token, process.env.RESET_PASSWORD_KEY, function(error, decodedData) {
      if (error) {
        return res.status(400).json({error: 'Incorrect token or it is expired'})
      }
      User.findOne({resetLink: token}, (err, user) => {
        if (err || !user) {
          return res.status(400).json({error: 'User with this token does not exist'})
        }
      
        user.password = password
        user.save((err, result) => {
          if (err) {
            return res.status(400).json({error: 'Reset Password Error'})
          } else {
            return res.status(200).json({message:'Your password has been changed'})
          }
        })
      })
    })
  } else {
    return res.status(401).json({error: "Authentication Error"})
  }
}