import express from 'express';
const router = express.Router();
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';

// ROute Level Middleware - To Protect Route
router.use('/changepassword', checkUserAuth)
router.use('/loggeduser', checkUserAuth)
router.use('/vendors', checkUserAuth)

// Public Routes
router.post('/register', UserController.userRegistration)
router.post('/login', UserController.userLogin)
router.post('/send-reset-password-email', UserController.sendUserPasswordResetEmail)
router.post('/reset-password/:id/:token', UserController.userPasswordReset)

// Protected Routes
router.post('/changepassword', UserController.changeUserPassword)
router.get('/loggeduser', UserController.loggedUser)
// router.put('/updateProfile', UserController.upDateProfile)


//user/client routes
router.get('/vendors', UserController.allVendors)
router.post('/user-add-job', UserController.userAddJob)
router.get('/view-vendor-jobs', UserController.viewVendorsJobs)


//user/provider routes
router.get('/view-user-jobs', UserController.viewUserJobs)
router.post('/vendor-add-job', UserController.vendorAddJob)


export default router