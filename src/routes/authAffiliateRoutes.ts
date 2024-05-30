import { Router } from "express";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { AuthAffiliateController } from "../controllers/AuthAffiliateController";
import { authenticateAffiliate } from "../middlewares/auth";

const router = Router()

// router.post('/login',
//     body('dni')
//         .notEmpty().withMessage('DNI is required'),
//     handleInputErrors,
//     AuthAffiliateController.login
// )

router.post('/create-account',
    body('dni')
        .notEmpty().withMessage('DNI required'),
    body('firstName')
        .notEmpty().withMessage('First name required'),
    body('lastName')
        .notEmpty().withMessage('Last name required'),
    body('birthdate')
        .notEmpty().withMessage('Birthdate required'),
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
    AuthAffiliateController.createAccount
)

router.post('/confirm-account',
    body('token')
        .notEmpty().withMessage('Token required'),
    handleInputErrors,
    AuthAffiliateController.confirmAccount
)

router.post('/login',
    body('email')
        .notEmpty().withMessage('Email no valid'),
    body('password')
        .notEmpty().withMessage('The password cannot be empty'),
    handleInputErrors,
    AuthAffiliateController.login
)

router.post('/request-code',
    body('email')
        .notEmpty().withMessage('Email required'),
    handleInputErrors,
    AuthAffiliateController.requestConfirmationCode
)

router.post('/forgot-password',
    body('email')
        .notEmpty().withMessage('Email required'),
    handleInputErrors,
    AuthAffiliateController.forgotPassword
)

router.post('/validate-token',
    body('token')
        .notEmpty().withMessage('Token required'),
    handleInputErrors,
    AuthAffiliateController.validateToken
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
    AuthAffiliateController.updatePasswordWithToken
)

router.get('/patient',
    authenticateAffiliate,
    AuthAffiliateController.patient
)

export default router