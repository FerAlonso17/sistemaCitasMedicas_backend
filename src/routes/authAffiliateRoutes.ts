import { Router } from "express";
import { body } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { AuthAffiliateController } from "../controllers/AuthAffiliateController";
import { authenticateAffiliate } from "../middlewares/auth";

const router = Router()

router.post('/login',
    body('dni')
        .notEmpty().withMessage('DNI is required'),
    handleInputErrors,
    AuthAffiliateController.login
)

router.get('/patient',
    authenticateAffiliate,
    AuthAffiliateController.patient
)

export default router