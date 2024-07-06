import { Router } from "express";
import { authenticateAdmin } from "../middlewares/auth";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { AdminController } from "../controllers/AdminController";

const router = Router()

router.use(authenticateAdmin)

//crear un nuevo registro para el día
router.post('/manageRecord',
    body('dateRecord')
        .notEmpty().withMessage('Date of appointment required'),
    body('specialityR')
        .notEmpty().withMessage('Speciality required'),
    body('doctorR')
        .notEmpty().withMessage('Doctor required'),
    body('numberAppointment')
        .notEmpty().withMessage('Number required'),
    handleInputErrors,
    AdminController.createRecord
)

//agregar especialidad al registro del día

//agregar doctorR al registro del día

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