const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth');

router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);
router.put('/forgot-password', authCtrl.forgotPassword)
router.get('/user/:id', authCtrl.show);
router.put('/reset-password', authCtrl.updatePassword)

router.use(require('../config/auth'));
router.get('/friends/:userId', authCtrl.getFriends)
router.get('/add-friend/:senderId/:receiverId', authCtrl.addFriend)
router.get('/accept-friend/:senderId/:receiverId', authCtrl.confirmFriend)

module.exports = router;