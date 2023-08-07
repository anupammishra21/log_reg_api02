const router = require('express').Router()
const logRegController = require('../controller/logReg.controller')

router.get('/welcome',logRegController.welcomeStatus)
router.post('/register',logRegController.register)
router.post('/otp',logRegController.varifyOtp)
router.post('/login',logRegController.login)
router.get('/dashboard',logRegController.userAuth,logRegController.dashboard)
router.get('/logout',logRegController.userAuth,logRegController.logout)

module.exports = router




