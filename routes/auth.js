const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth');

router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);
router.put('/forgot-password', authCtrl.forgotPassword)
router.get('/user/:id', authCtrl.show);
router.put('/reset-password', authCtrl.updatePassword)
router.get('/users', authCtrl.getUsers)
router.get('/friends', authCtrl.getFriendRequests)

router.use(require('../config/auth'));
router.get('/friends/:userId', authCtrl.getFriends)
router.post('/add-friend/:id1/:id2', authCtrl.addFriend)
router.put('/accept-friend/:id1/:id2', authCtrl.acceptFriend)
router.delete('/delete-friend/:id1/:id2', authCtrl.deleteFriend)

module.exports = router;