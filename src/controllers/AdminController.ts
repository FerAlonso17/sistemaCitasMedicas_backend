import { Request, Response } from "express"
import Record from "../models/Record"
import moment from "moment"
import Doctor, { IDoctor } from "../models/Doctor"

export class AdminController {

    static createRecord = async (req: Request, res: Response) => {
        const { dateRecord, specialityR, doctorR, numberAppointment } = req.body

        try {
            //validar si la fecha es posterior al día de registro
            const minDate = moment().add(0, 'days')
            const dateRecordOfAdmin = moment(dateRecord);
            const dateRecordOfAdminValid = dateRecordOfAdmin.isValid() && dateRecordOfAdmin.isAfter(minDate)
            if (!dateRecordOfAdminValid) {
                const error = new Error('Date no valid')
                return res.status(400).json({ error: error.message })
            }

            //encontrar registro por la fecha y lanzar error si es que ya existe
            const recordExist = await Record.findOne({ dateRecord })
            if (recordExist) {
                const error = new Error('Record already exists')
                return res.status(400).json({ error: error.message })
            }

            //encontrar doctor
            const doctorExist = await Doctor.findById(doctorR)
            if (!doctorExist) {
                const error = new Error('Doctor no valid')
                return res.status(404).json({ error: error.message })
            }

            const record = new Record()
            record.dateRecord = dateRecord
            record.specialityRecord = [{
                specialityR: specialityR,
                doctorRecord: [{
                    doctorR,
                    numberAppointment,
                    appointmentsRecord: [] // inicializar con un array vacío
                }]
            }]
            await record.save()
            res.send('Record created correctly')
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static addDoctorToRecord = async (req: Request, res: Response) => {
        const { id } = req.params
        const { specialityR, doctorR, numberAppointment } = req.body
        try {
            const record = await Record.findById(id)
            if (!record) {
                const error = new Error('Record not found')
                return res.status(404).json({ error: error.message })
            }
            const doctorExist = await Doctor.findById(doctorR)
            if (!doctorExist) {
                const error = new Error('Doctor no valid')
                return res.status(404).json({ error: error.message })
            }

            // Buscar el índice de la especialidad coincidente
            const matchingSpecialityIndex = record.specialityRecord.findIndex(
                (item) => item.specialityR === specialityR
            );
            if (matchingSpecialityIndex === -1) {
                record.specialityRecord.push({
                    specialityR,
                    doctorRecord: [{
                        doctorR,
                        numberAppointment,
                        appointmentsRecord: []
                    }]
                })
            } else {
                const matchingDoctorIndex = record.specialityRecord[matchingSpecialityIndex].doctorRecord.findIndex(
                    (item) => item.doctorR.toString() === doctorR.toString()
                );
                if (matchingDoctorIndex !== -1) {
                    const error = new Error('Doctor already exists for this specialty');
                    return res.status(400).json({ error: error.message });
                } else {
                    // Add the doctor to the existing specialty record
                    record.specialityRecord[matchingSpecialityIndex].doctorRecord.push({ doctorR, numberAppointment, appointmentsRecord: [] });
                }
            }
            await record.save()
            res.send('Register updated correctly')
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static deleteSpecialityOfRecord = async (req: Request, res: Response) => {
        //Si ya hay citas se tiene q reprogramar, si no normal
        const { id } = req.params

        try {
            const record = await Record.findById(id)
            if (!record) {
                const error = new Error('Record not found')
                return res.status(404).json({ error: error.message })
            }

            // Buscar el índice de la especialidad coincidente
            const matchingSpecialityIndex = record.specialityRecord.findIndex(
                (item) => item.specialityR === req.body.specialityR
            );

            if (matchingSpecialityIndex === -1) {
                // Especialidad no encontrada, no hay nada que eliminar
                return res.status(400).json({ error: 'Speciality not found' });
            }

            // Verificar si hay citas en la especialidad
            const hasAppointments = record.specialityRecord[matchingSpecialityIndex].doctorRecord.some(
                (doctor) => doctor.appointmentsRecord.length > 0
            );

            if (hasAppointments) {
                return res.status(400).json({ error: 'You have to reschedule appointments before' });
            }

            // Eliminación segura: eliminar la especialidad coincidente del array
            record.specialityRecord.splice(matchingSpecialityIndex, 1);
            await record.save()
            res.send('Updated correctly')
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static deleteDoctorFromRecord = async (req: Request, res: Response) => {
        const { id } = req.params
        const { specialityR, doctorR } = req.body;

        try {
            const record = await Record.findById(id)
            if (!record) {
                const error = new Error('Record not found')
                return res.status(404).json({ error: error.message })
            }

            // Buscar el índice de la especialidad coincidente
            const matchingSpecialityIndex = record.specialityRecord.findIndex(
                (item) => item.specialityR === specialityR
            );
            if (matchingSpecialityIndex === -1) {
                // Especialidad no encontrada, no hay nada que eliminar
                return res.status(400).json({ error: 'Speciality not found' });
            }

            //Buscar el índice del doctor coincidente
            const matchingDoctorIndex = record.specialityRecord[matchingSpecialityIndex].doctorRecord.findIndex((item) => item.doctorR.toString() === doctorR.toString())
            if (matchingDoctorIndex === -1) {
                // Doctor no encontrado, no hay nada que eliminar
                return res.status(400).json({ error: 'Doctor not found' });
            }
            // Verificar si hay citas en la especialidad
            // const hasAppointments = record.specialityRecord[matchingSpecialityIndex].doctorRecord[matchingDoctorIndex].appointmentsRecord.some(
            //     (doctor) => doctor.appointmentsRecord.length > 0
            // );

            // if (hasAppointments) {
            //     return res.status(400).json({ error: 'You have to reschedule appointments before' });
            // }
            if (record.specialityRecord[matchingSpecialityIndex].doctorRecord.length==1) {
                record.specialityRecord.splice(matchingSpecialityIndex, 1);
            } else {
                // Eliminación segura: eliminar la especialidad coincidente del array
                record.specialityRecord[matchingSpecialityIndex].doctorRecord.splice(matchingDoctorIndex, 1);
            }

            await record.save()
            res.send('Updated correctly')
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static updateNumberAppointments = async (req: Request, res: Response) => {
        const { id } = req.params
        const { specialityR, doctorR, numberAppointment } = req.body
        try {
            const recordExist = await Record.findById(id)
            if (!recordExist) {
                const error = new Error('Record not found')
                return res.status(404).json({ error: error.message })
            }
            const matchingSpecialityRecord = recordExist.specialityRecord.find(item => {
                return item.specialityR.toString() === specialityR.toString()
            })
            if (!matchingSpecialityRecord) {
                const error = new Error('Speciality no valid')
                return res.status(404).json({ error: error.message })
            }
            const matchingDoctorRecord = matchingSpecialityRecord.doctorRecord.find(item => {
                return item.doctorR.toString() === doctorR.toString()
            })
            if (!matchingDoctorRecord) {
                const error = new Error('Doctor no valid')
                return res.status(404).json({ error: error.message })
            }
            if (matchingDoctorRecord.appointmentsRecord.length === 0 || numberAppointment > matchingDoctorRecord.numberAppointment) {
                matchingDoctorRecord.numberAppointment = numberAppointment
                await recordExist.save()
                res.send('Updated correctly')
            } else {
                const error = new Error('You have to reschedule appointments before')
                return res.status(400).json({ error: error.message })
            }
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static getRecordById = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            const record = await Record.findById(id).populate({ path: 'specialityRecord.doctorRecord.doctorR', select: 'name speciality' })
            if (!record) {
                const error = new Error('Record not found')
                return res.status(404).json({ error: error.message })
            }
            res.json(record)
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static getRecordByDate = async (req: Request, res: Response) => {
        const { dateRecord } = req.params
        try {
            const record = await Record.findOne({ dateRecord }).populate({ path: 'specialityRecord.doctorRecord.doctorR', select: 'name speciality' })
            if (!record) {
                const error = new Error('Record not found')
                return res.status(404).json({ error: error.message })
            }
            res.json(record)
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }
    //Reprogramar uno
    // static rescheduleOneApointment = async (req: Request, res: Response)=> {
    //     const {idRecordToChange,idAppointmentToChange} = req.params
    //     const { dateRecord, specialityR, doctorR } = req.body
    //     try {
    //         const recordExist = await Record.findOne({ dateRecord })
    //         if (!recordExist) {
    //             const error = new Error('Record not found')
    //             return res.status(404).json({ error: error.message })
    //         }

    //         //Speciality
    //         const matchingSpecialityRecord = recordExist.specialityRecord.find(item => {
    //             return item.specialityR.toString() === specialityR.toString()
    //         })
    //         const matchingDoctorRecord = matchingSpecialityRecord.doctorRecord.find(item => {
    //             return item.doctorR.toString() === doctorR.id.toString()
    //         })
    //         matchingDoctorRecord.appointmentsRecord.push(idAppointmentToChange)
    //         //actualizar fecha,numero de orden y eliminar de registro anterior
    //         await record.save()
    //         res.send('Register updated correctly')
    //     } catch (error) {
    //         res.status(500).json('There was an error*')
    //     }
    // }

    //Reprogramar todo

    // static updateDateRecord = async (req: Request, res: Response) => {
    //     //Validar que el doctor no se duplique
    //     const dateRecordExist = await Record.findOne({ dateRecord })
    //     if (dateRecordExist) {
    //         //Primero se valida trayendo al registro que haga match con la especialidad
    //         const matchingSpecialityRecord = dateRecordExist.specialityRecord.find(item => {
    //             item.specialityR.toString() === specialityR.toString()
    //         }
    //         )
    //         if (matchingSpecialityRecord) {
    //             //Segundo se valida trayendo al registro que haga match con el doctor
    //             const matchingDoctorRecord = matchingSpecialityRecord.doctorRecord.find(item => {
    //                 item.doctorR.toString() === doctorR.toString()
    //             }
    //             )
    //             if (matchingDoctorRecord) {
    //                 const error = new Error('The doctor is already registered')
    //                 return res.status(401).json({ error: error.message })
    //             }
    //             return
    //         }
    //         return
    //     }
    //     try {

    //     } catch (error) {

    //     }
    // }z

    static registerDoctor = async (req: Request, res: Response) => {
        try {
            const doctor = new Doctor(req.body)

            const doctorExist = await Doctor.findOne({ dni: doctor.dni })
            if (doctorExist) {
                const error = new Error('Doctor already exists')
                return res.status(400).json({ error: error.message })
            }

            await doctor.save()
            res.send('Doctor created correctly')
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static getDoctorById = async (req: Request<{ id: string }, {}, IDoctor>, res: Response) => {
        const { id } = req.params
        try {
            const doctor = await Doctor.findById(id)
            if (!doctor) {
                const error = new Error('Doctor not found!')
                return res.status(404).json({ error: error.message })
            }
            res.json(doctor)
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

    static updateDoctor = async (req: Request<{ id: string }, {}, IDoctor>, res: Response) => {
        const { id } = req.params
        try {
            const doctor = await Doctor.findById(id)

            if (!doctor) {
                const error = new Error('Doctor not found!')
                return res.status(404).json({ error: error.message })
            }

            const doctorExist = await Doctor.findOne({ dni: req.body.dni })
            if (doctorExist && doctorExist.dni.toString() !== doctor.dni.toString()) {
                const error = new Error('Doctor already exists')
                return res.status(400).json({ error: error.message })
            }

            doctor.name = req.body.name
            doctor.dni = req.body.dni
            doctor.speciality = req.body.speciality

            await doctor.save()
            res.send('Doctor updated correctly')
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static deleteDoctor = async (req: Request<{ id: string }, {}, IDoctor>, res: Response) => {
        const { id } = req.params
        try {
            const doctor = await Doctor.findById(id)
            if (!doctor) {
                const error = new Error('Doctor not found!')
                return res.status(404).json({ error: error.message })
            }
            await doctor.deleteOne()
            res.send('Doctor deleted correctly')
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }
}