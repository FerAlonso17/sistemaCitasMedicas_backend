import { Router } from "express";
import { authenticateAdmin } from "../middlewares/auth";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { AdminController } from "../controllers/AdminController";

const router = Router()

router.use(authenticateAdmin)

/***********RECORDS****************** */
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

//agregar doctor a un registro creado anteriormente
router.put('/manageRecord/:id',
    param('id').isMongoId().withMessage('Id no valid'),
    body('specialityR')
        .notEmpty().withMessage('Speciality required'),
    body('doctorR')
        .notEmpty().withMessage('Doctor required'),
    body('numberAppointment')
        .notEmpty().withMessage('Number required'),
    handleInputErrors,
    AdminController.addDoctorToRecord
)

//Eliminar especialidad de registro
router.put('/manageRecord/:id/speciality',
    param('id').isMongoId().withMessage('Id no valid'),
    body('specialityR')
        .notEmpty().withMessage('Speciality required'),
    handleInputErrors,
    AdminController.deleteSpecialityOfRecord
)

//Eliminar doctor de registro
router.put('/manageRecord/:id/doctor',
    param('id').isMongoId().withMessage('Id no valid'),
    body('specialityR')
        .notEmpty().withMessage('Speciality required'),
    body('doctorR')
        .notEmpty().withMessage('Doctor required'),
    handleInputErrors,
    AdminController.deleteDoctorFromRecord
)

//Actualizar numero de citas
router.patch('/manageRecord/:id',
    param('id').isMongoId().withMessage('Id no valid'),
    body('specialityR')
        .notEmpty().withMessage('Speciality required'),
    body('doctorR')
        .notEmpty().withMessage('Doctor required'),
    body('numberAppointment')
        .notEmpty().withMessage('Number required'),
    handleInputErrors,
    AdminController.updateNumberAppointments
)
//obtener record
router.get('/manageRecord/:id',
    param('id').isMongoId().withMessage('Id no valid'),
    AdminController.getRecordById
)
router.get('/manageRecord/:dateRecord',
    AdminController.getRecordByDate
)
export default router