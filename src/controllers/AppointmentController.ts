import { Request, Response } from "express"
import Appointment, { IAppointment } from "../models/Appointment"
import moment from "moment"
import Record from "../models/Record"
import Doctor from "../models/Doctor"
import Hospital from "../models/Hospital"

export class AppointmentController {

    static registerAppointment = async (req: Request<{}, {}, IAppointment>, res: Response) => {

        const appointment = new Appointment(req.body)
        appointment.patient = req.patient.id

        //Validar si no existe una cita para el mismo paciente el mismo día
        const appointmentExist = await Appointment.find({
            patient: appointment.patient,
            speciality: appointment.speciality
        })
        const formatDate = 'DD/MM/YYYY'
        if (appointmentExist) {
            for (let index = 0; index < appointmentExist.length; index++) {
                const fechaExistente = moment(appointmentExist[index].dateAppointment).format(formatDate)
                const fechaIngresada = moment(appointment.dateAppointment).format(formatDate)
                if (fechaExistente === fechaIngresada) {
                    const error = new Error('You already have an appointment for that day')
                    return res.status(400).json({ error: error.message })
                }
                if (appointmentExist[index].state !== ('Finished')) {
                    const error = new Error('You already have an appointment pending for that specialty')
                    return res.status(400).json({ error: error.message })
                }
            }
        }

        //validar la fecha(En un lapso de 1 a 15 días después del día de registro)
        const minDate = moment().add(0, 'days').startOf('day')
        const maxDate = moment().add(14, 'days').startOf('day')
        const dateAppointmentValid = moment.isDate(appointment.dateAppointment) && moment(appointment.dateAppointment).isAfter(minDate) && moment(appointment.dateAppointment).isBefore(maxDate)
        if (!dateAppointmentValid) {
            const error = new Error('You can only register your appointment in a range of 15 days')
            return res.status(400).json({ error: error.message })
        }
        //REVISAR SI FUNCIONA
        //appointment.dateAppointment = moment(appointment.dateAppointment).toDate()

        //validar si existe doctor y si existe asignar su id al registro de cita
        const doctorExist = await Doctor.findById(req.body.doctor)
        if (!doctorExist) {
            const error = new Error('Doctor no exist')
            return res.status(404).json({ error: error.message })
        }
        // appointment.doctor = doctorExist.id

        //validar si existe hospital y si existe asignar su id al registro de cita
        const hospitalExist = await Hospital.findById(req.body.hospital)
        if (!hospitalExist) {
            const error = new Error('Hospital no exist')
            return res.status(404).json({ error: error.message })
        }
        // appointment.hospital = hospitalExist.id

        //Validar si el registro aún no existe
        const recordOfDay = await Record.findOne({ dateRecord: appointment.dateAppointment })
        if (!recordOfDay) {
            const error = new Error('There are no doctors assigned yet')
            return res.status(400).json({ error: error.message })
        }

        //VALIDAR LA CANTIDAD DE CITAS QUE TENDRÁ EL DOCTOR, VERIFICANDO QUE NO EXCEDA A LA CANTIDAD DEL DÍA ASIGNADA AL DOCTOR
        //Primero se valida trayendo al registro que haga match con la especialidad
        const matchingSpecialityRecord = recordOfDay.specialityRecord.find(item => {
            return item.specialityR.toString() === req.body.speciality.toString()
        })
        if (!matchingSpecialityRecord) {
            const error = new Error('Speciality no valid')
            return res.status(404).json({ error: error.message })
        }
        //Segundo se valida trayendo al registro que haga match con el doctor
        const matchingDoctorRecord = matchingSpecialityRecord.doctorRecord.find(item => {
            return item.doctorR.toString() === doctorExist.id.toString()
        })
        if (!matchingDoctorRecord) {
            const error = new Error('Doctor no valid')
            return res.status(404).json({ error: error.message })
        }
        if (matchingDoctorRecord.numberAppointment === matchingDoctorRecord.appointmentsRecord.length) {
            const error = new Error('Number of appointments exceeds the limit')
            return res.status(400).json({ error: error.message })
        }

        //validar el orden de atencion(con el matching hecho en la validacion anterior)
        // const quantityAppointments = await Appointment.countDocuments(
        //     {dateAppointment:req.body.dateAppointment,
        //     state:{$in:['Pending','Rescheduled']}
        //     })
        const quantityAppointments = matchingDoctorRecord.appointmentsRecord.length
        appointment.orderAttention = quantityAppointments + 1

        matchingDoctorRecord.appointmentsRecord.push(appointment.id)

        try {
            await Promise.allSettled([appointment.save(), recordOfDay.save()])
            res.send('Appointment registered correctly')
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static getAppointmentsByAffiliate = async (req: Request<{}, {}, IAppointment>, res: Response) => {
        try {
            const appointments = await Appointment.find({ patient: req.patient.id })
                .populate({ path: 'doctor', select: 'name' })
                .populate('hospital')

            for (let i = 0; i < appointments.length; i++) {
                const appointment = appointments[i];

                const appointmentDate = moment.utc(appointment.dateAppointment).add(1, 'day')
                const today = moment.utc()

                if (appointmentDate.isSame(today, 'day')) {
                    appointment.state = 'Day_of_appointment'
                } else if (appointmentDate.isBefore(today, 'day')) {
                    appointment.state = 'Finished'
                }
                await appointment.save()
            }
            res.json(appointments)
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static updateAppointmentById = async (req: Request<{ id: string }, {}, IAppointment>, res: Response) => {
        const { id } = req.params
        try {
            const appointment = await Appointment.findById(id)

            if (!appointment) {
                const error = new Error('Appointment not found!')
                return res.status(404).json({ error: error.message })
            }
            if (appointment.patient.toString() !== req.patient.id.toString()) {
                const error = new Error('Action no valid')
                return res.status(404).json({ error: error.message })
            }
            if (appointment.state === 'Finished' || appointment.state === 'Day_of_appointment') {
                const error = new Error('You can no longer edit this appointment')
                return res.status(404).json({ error: error.message })
            }

            //Validacion para eliminar de record el id de la cita
            const appointmentToDelete: IAppointment = appointment
            const recordToDelete = await Record.findOne({ dateRecord: appointmentToDelete.dateAppointment })
            const matchingSpecialityRecordToDelete = recordToDelete.specialityRecord.find(item => {
                return item.specialityR.toString() === appointmentToDelete.speciality.toString()
            })
            const matchingDoctorRecordToDelete = matchingSpecialityRecordToDelete.doctorRecord.find(item => {
                return item.doctorR.toString() === appointmentToDelete.doctor.toString()
            })
            matchingDoctorRecordToDelete.appointmentsRecord = matchingDoctorRecordToDelete.appointmentsRecord.filter(item => item.toString() !== id)

            // Reordenar las citas restantes
            for (let i = 0; i < matchingDoctorRecordToDelete.appointmentsRecord.length; i++) {
                const appointmentId = matchingDoctorRecordToDelete.appointmentsRecord[i];
                const otherAppointment = await Appointment.findById(appointmentId);
                otherAppointment.orderAttention = i + 1;
                await otherAppointment.save();
            }

            //validar la fecha(En un lapso de 1 a 15 días después del día de registro)
            const enteredDate = moment(req.body.dateAppointment);
            const maximumDate = moment().add(15, 'days');
            if (enteredDate.isBefore(moment()) || enteredDate.isAfter(maximumDate)) {
                const error = new Error('You can only register your appointment in a range of 15 days')
                return res.status(400).json({ error: error.message })
            }

            //Validar si no existe una cita para el mismo paciente el mismo día
            const appointmentExist = await Appointment.find({
                patient: appointment.patient,
                speciality: appointment.speciality
            })
            const formatDate = 'DD/MM/YYYY'
            if (appointmentExist) {
                for (let index = 0; index < appointmentExist.length; index++) {
                    const fechaExistente = moment(appointmentExist[index].dateAppointment).format(formatDate)
                    const fechaIngresada = moment(appointment.dateAppointment).format(formatDate)
                    if ((fechaExistente === fechaIngresada) && (appointmentExist[index].id !== appointment.id)) {
                        const error = new Error('You already have an appointment for that day')
                        return res.status(400).json({ error: error.message })
                    }
                    if ((appointmentExist[index].state !== ('Finished')) && (appointmentExist[index].id !== appointment.id)) {
                        const error = new Error('You already have an appointment pending for that specialty')
                        return res.status(400).json({ error: error.message })
                    }
                }
            }

            //validar si existe doctor y si existe asignar su id al registro de cita
            const doctorExist = await Doctor.findById(req.body.doctor)
            if (!doctorExist) {
                const error = new Error('Doctor no exist')
                return res.status(404).json({ error: error.message })
            }

            //validar si existe hospital y si existe asignar su id al registro de cita
            const hospitalExist = await Hospital.findById(req.body.hospital)
            if (!hospitalExist) {
                const error = new Error('Hospital no exist')
                return res.status(404).json({ error: error.message })
            }

            //Validar si el registro aún no existe
            const recordOfDay = await Record.findOne({ dateRecord: req.body.dateAppointment })
            if (!recordOfDay) {
                const error = new Error('There are no doctors assigned yet')
                return res.status(400).json({ error: error.message })
            }

            //VALIDAR LA CANTIDAD DE CITAS QUE TENDRÁ EL DOCTOR, VERIFICANDO QUE NO EXCEDA A LA CANTIDAD DEL DÍA ASIGNADA AL DOCTOR
            //Primero se valida trayendo al registro que haga match con la especialidad
            const matchingSpecialityRecord = recordOfDay.specialityRecord.find(item => {
                return item.specialityR.toString() === req.body.speciality.toString()
            })
            if (!matchingSpecialityRecord) {
                const error = new Error('Speciality no valid')
                return res.status(404).json({ error: error.message })
            }
            //Segundo se valida trayendo al registro que haga match con el doctor
            const matchingDoctorRecord = matchingSpecialityRecord.doctorRecord.find(item => {
                return item.doctorR.toString() === doctorExist.id.toString()
            })
            if (!matchingDoctorRecord) {
                const error = new Error('Doctor no valid')
                return res.status(404).json({ error: error.message })
            }
            if (matchingDoctorRecord.numberAppointment === matchingDoctorRecord.appointmentsRecord.length) {
                const error = new Error('Number of appointments exceeds the limit')
                return res.status(400).json({ error: error.message })
            }

            appointment.doctor = doctorExist.id
            appointment.hospital = hospitalExist.id
            appointment.speciality = req.body.speciality
            appointment.dateAppointment = req.body.dateAppointment
            //Cambiar a pendiente si el estado aterior era reeprogramado
            if (appointment.state === 'Rescheduled') {
                appointment.state = 'Pending'
            }
            //validar el orden de atencion(con el matching hecho en la validacion anterior)
            const quantityAppointments = matchingDoctorRecord.appointmentsRecord.length
            appointment.orderAttention = quantityAppointments + 1

            matchingDoctorRecord.appointmentsRecord.push(appointment.id)
            appointment.orderAttention = matchingDoctorRecord.appointmentsRecord.length;

            await Promise.allSettled([appointment.save(), recordOfDay.save(), recordToDelete.save()])
            res.send('Appointment updated correctly')
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static deleteAppointmentsByAffiliate = async (req: Request<{ id: string }, {}, IAppointment>, res: Response) => {
        const { id } = req.params
        try {
            const appointment = await Appointment.findById(id)
            if (!appointment) {
                const error = new Error('Appointment not found!')
                return res.status(404).json({ error: error.message })
            }
            if (appointment.patient.toString() !== req.patient.id.toString()) {
                const error = new Error('Action no valid')
                return res.status(404).json({ error: error.message })
            }

            if (appointment.state === 'Finished' || appointment.state === 'Day_of_appointment') {
                const error = new Error('You can no longer cancel this appointment')
                return res.status(404).json({ error: error.message })
            }

            //Validacion para eliminar de record el id de la cita
            const appointmentToDelete: IAppointment = appointment
            const recordToDelete = await Record.findOne({ dateRecord: appointmentToDelete.dateAppointment })
            const matchingSpecialityRecordToDelete = recordToDelete.specialityRecord.find(item => {
                return item.specialityR.toString() === appointmentToDelete.speciality.toString()
            })
            const matchingDoctorRecordToDelete = matchingSpecialityRecordToDelete.doctorRecord.find(item => {
                return item.doctorR.toString() === appointmentToDelete.doctor.toString()
            })
            matchingDoctorRecordToDelete.appointmentsRecord = matchingDoctorRecordToDelete.appointmentsRecord.filter(item => item.toString() !== id)

            // Reordenar las citas restantes
            for (let i = 0; i < matchingDoctorRecordToDelete.appointmentsRecord.length; i++) {
                const appointmentId = matchingDoctorRecordToDelete.appointmentsRecord[i];
                const otherAppointment = await Appointment.findById(appointmentId);
                otherAppointment.orderAttention = i + 1;
                await otherAppointment.save();
            }

            await Promise.allSettled([appointment.deleteOne(), recordToDelete.save()])
            res.send('Appointment cancelled')
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static getAppointmentById = async (req: Request<{ id: string }, {}, IAppointment>, res: Response) => {
        const { id } = req.params
        try {
            const appointment = await Appointment.findById(id)
                .populate({ path: 'doctor', select: 'name' })
                .populate('hospital')
            if (!appointment) {
                const error = new Error('Appointment not found!')
                return res.status(404).json({ error: error.message })
            }
            if (appointment.patient.toString() !== req.patient.id.toString()) {
                const error = new Error('Action no valid')
                return res.status(404).json({ error: error.message })
            }

            res.json(appointment)
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static getDoctors = async (req: Request, res: Response) => {
        try {
            const doctors = await Doctor.find()
            res.json(doctors)
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static getHospitals = async (req: Request, res: Response) => {
        try {
            const hospitals = await Hospital.find()
            res.json(hospitals)
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }
}