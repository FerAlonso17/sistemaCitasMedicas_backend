import { Router } from "express";
import { authenticateAdmin } from "../middlewares/auth";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { RecordController } from "../controllers/RecordController";

const router = Router();

router.use(authenticateAdmin);

// Crear un nuevo record
router.post('/',
    body('dateRecord')
        .notEmpty().withMessage('Date of record is required'),
    body('hospitalRecord')
        .isArray({ min: 1 }).withMessage('Hospital record must be an array with at least one item'),
    handleInputErrors,
    RecordController.createRecord
);

// Obtener todos los records
router.get('/', RecordController.getRecords);

// Actualizar un record específico por su ID
router.put('/:id',
    param('id').isMongoId().withMessage('Invalid record ID'),
    body('dateRecord')
        .optional(),
    body('hospitalRecord')
        .optional()
        .isArray().withMessage('Hospital record must be an array'),
    handleInputErrors,
    RecordController.updateRecord
);

// Eliminar un record específico por su ID
router.delete('/:id',
    param('id').isMongoId().withMessage('Invalid record ID'),
    handleInputErrors,
    RecordController.deleteRecord
);

export default router;
