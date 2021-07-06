const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth');

router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);
router.put('/forgot-password', authCtrl.forgotPassword)
router.put('/reset-password', authCtrl.updatePassword)
router.get('/users', authCtrl.getUsers)
router.get('/user/:id', authCtrl.show);
router.get('/friends', authCtrl.getFriendRequests)
router.get('/friends/:userId', authCtrl.getFriends)

router.use(require('../config/auth'));
router.post('/add-friend/:userId', checkAuth, authCtrl.addFriend)
router.put('/accept-friend/:id1/:id2', checkAuth, authCtrl.acceptFriend)
router.delete('/delete-friend/:id1/:id2', checkAuth, authCtrl.deleteFriend)

function checkAuth(req, res, next) {
    if (req.user) return next();
    return res.status(401).json({msg: 'Not Authorized'});
}

module.exports = router;