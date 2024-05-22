import { Router } from "express";
import { authenticateAffiliate } from "../middlewares/auth";
import { body } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { AppointmentController } from "../controllers/AppointmentController";

const router = Router()

router.use(authenticateAffiliate)

//paciente podrá registrar o crear su cita
router.post('/',
    body('doctor')
        .notEmpty().withMessage('Doctor requerided'),
    body('hospital')
        .notEmpty().withMessage('Hospital requerided'),
    body('speciality')
        .notEmpty().withMessage('Speciality requerided'),
    body('dateAppointment')
        .notEmpty().withMessage('Date of appointment requerided'),
    handleInputErrors,
    AppointmentController.createAppointment
)
//obtener todas su citas para imprimirlas en la interfaz
//actualizarlas
//cancelarlas(eliminar de la DB)
//el sistema actualizará la cita a día de cita en el día de la cita
//el sistema actualizará la cita a finalizada una vez que haya pasado el día de la cita

export default router