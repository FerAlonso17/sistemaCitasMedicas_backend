import { Router } from "express";
import { authenticateAffiliate } from "../middlewares/auth";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { AppointmentController } from "../controllers/AppointmentController";

const router = Router()

router.use(authenticateAffiliate)

//paciente podrá registrar o crear su cita
router.post('/',
    body('doctor')
        .notEmpty().withMessage('Doctor required'),
    body('hospital')
        .notEmpty().withMessage('Hospital required'),
    body('speciality')
        .notEmpty().withMessage('Speciality required'),
    body('dateAppointment')
        .notEmpty().withMessage('Date of appointment required'),
    handleInputErrors,
    AppointmentController.registerAppointment
)

//obtener las citas por afiliado
router.get('/',
    AppointmentController.getAppointmentsByAffiliate
)
//obtener doctores
router.get('/doctors',
    AppointmentController.getDoctors
)
//obtener hospitales
router.get('/hospitals',
    AppointmentController.getHospitals
)

//actualizarlas
router.put('/:id',
    param('id').isMongoId().withMessage('Id no valid'),
    body('doctor')
        .notEmpty().withMessage('Doctor requerided'),
    body('hospital')
        .notEmpty().withMessage('Hospital requerided'),
    body('speciality')
        .notEmpty().withMessage('Speciality requerided'),
    body('dateAppointment')
        .notEmpty().withMessage('Date of appointment requerided'),
    handleInputErrors,
    AppointmentController.updateAppointmentById
)

//cancelarlas(eliminar de la DB)
router.delete('/:id',
    param('id').isMongoId().withMessage('Id no valid'),
    handleInputErrors,
    AppointmentController.deleteAppointmentsByAffiliate
)

router.get('/:id',
    param('id').isMongoId().withMessage('Id no valid'),
    handleInputErrors,
    AppointmentController.getAppointmentById
)


export default router