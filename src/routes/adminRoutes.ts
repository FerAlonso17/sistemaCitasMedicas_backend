import { Router } from "express";
import { authenticateAdmin } from "../middlewares/auth";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { AdminController } from "../controllers/AdminController";

const router = Router()

router.use(authenticateAdmin)

/***********DOCTORS****************** */
//registrar doctor
router.post('/',
    body('name')
        .notEmpty().withMessage('Name required'),
    body('dni')
        .notEmpty().withMessage('DNI required'),
    body('speciality')
        .notEmpty().withMessage('Speciality required'),
    handleInputErrors,
    AdminController.registerDoctor
)

//obtener doctor
router.get('/:id',
    param('id').isMongoId().withMessage('Id no valid'),
    handleInputErrors,
    AdminController.getDoctorById
)
router.get('/',
    AdminController.getDoctors
)

router.put('/:id',
    param('id').isMongoId().withMessage('Id no valid'),
    body('name')
        .notEmpty().withMessage('Name required'),
    body('dni')
        .notEmpty().withMessage('DNI required'),
    body('speciality')
        .notEmpty().withMessage('Speciality required'),
    handleInputErrors,
    AdminController.updateDoctor
)

router.delete('/:id',
    param('id').isMongoId().withMessage('Id no valid'),
    handleInputErrors,
    AdminController.deleteDoctor
)

export default router