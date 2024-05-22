import { Router } from "express";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { AuthAdminController } from "../controllers/AuthAdminController";
import { authenticateAdmin } from "../middlewares/auth";

const router = Router()

router.post('/create-account',
    body('name')
        .notEmpty().withMessage('Name required'),
    body('position')
        .notEmpty().withMessage('Position required'),
    body('email')
        .notEmpty().withMessage('Email no valid'),
    body('password')
        .isLength({ min: 8 }).withMessage('The password is very short, minimum 8 characters'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords are not the same')
        }
        return true
    }),
    handleInputErrors,
    AuthAdminController.createAccount
)

router.post('/confirm-account',
    body('token')
        .notEmpty().withMessage('Token required'),
    handleInputErrors,
    AuthAdminController.confirmAccount
)

router.post('/login',
    body('email')
        .notEmpty().withMessage('Email no valid'),
    body('password')
        .notEmpty().withMessage('The password cannot be empty'),
    handleInputErrors,
    AuthAdminController.login
)

router.post('/request-code',
    body('email')
        .notEmpty().withMessage('Email required'),
    handleInputErrors,
    AuthAdminController.requestConfirmationCode
)

router.post('/forgot-password',
    body('email')
        .notEmpty().withMessage('Email required'),
    handleInputErrors,
    AuthAdminController.forgotPassword
)

router.post('/validate-token',
    body('token')
        .notEmpty().withMessage('Token required'),
    handleInputErrors,
    AuthAdminController.validateToken
)

router.post('/update-password/:token',
    param('token')
        .isNumeric().withMessage('Token no valid'),
    body('password')
        .isLength({ min: 8 }).withMessage('The password is very short, minimum 8 characters'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords are not the same')
        }
        return true
    }),
    handleInputErrors,
    AuthAdminController.updatePasswordWithToken
)

router.get('/admin',
    authenticateAdmin,
    AuthAdminController.admin
)

export default router