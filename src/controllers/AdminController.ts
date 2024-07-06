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
            const recordExist = await Record.findOne({dateRecord})
            if (recordExist) {
                const error = new Error('Record already exists')
                return res.status(400).json({ error: error.message })
            }

            //encontrar doctor
            const doctorExist= await Doctor.findOne({name:doctorR})
            if (!doctorExist) {
                const error = new Error('Doctor no valid')
                return res.status(404).json({ error: error.message })
            }

            const record = new Record()
            record.dateRecord = dateRecord
            record.specialityRecord = [{
                specialityR: specialityR,
                doctorRecord: [{
                    doctorR: doctorExist.id,
                    numberAppointment: numberAppointment,
                    appointmentsRecord: [] // inicializar con un array vacío
                }]
            }]

            await record.save()
            res.send('Record created correctly')
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

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
    // }

    static registerDoctor = async (req: Request, res: Response)=>{
        try {
            const doctor = new Doctor(req.body)

            const doctorExist = await Doctor.findOne({dni:doctor.dni})
            if (doctorExist) {
                const error = new Error('Doctor already exists')
                return res.status(400).json({error:error.message})
            }

            await doctor.save()
            res.send('Doctor created correctly')
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static getDoctorById = async (req: Request<{id:string},{},IDoctor>, res: Response)=>{
        const {id} = req.params
        try {
            const doctor = await Doctor.findById(id)
            if (!doctor) {
                const error = new Error('Doctor not found!')
                return res.status(404).json({error:error.message})
            }
            res.json(doctor)
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static getDoctors = async (req: Request,res:Response)=>{
        try {
            const doctors = await Doctor.find()
            res.json(doctors)
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }

    static updateDoctor = async (req: Request<{id:string},{},IDoctor>,res:Response)=>{
        const {id} = req.params
        try {
            const doctor = await Doctor.findById(id)

            if (!doctor) {
                const error = new Error('Doctor not found!')
                return res.status(404).json({error:error.message})
            }

            const doctorExist = await Doctor.findOne({dni:req.body.dni})
            if (doctorExist && doctorExist.dni.toString()!==doctor.dni.toString()) {
                const error = new Error('Doctor already exists')
                return res.status(400).json({error:error.message})
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

    static deleteDoctor = async (req: Request<{id:string},{},IDoctor>, res: Response)=>{
        const {id} = req.params
        try {
            const doctor = await Doctor.findById(id)
            if (!doctor) {
                const error = new Error('Doctor not found!')
                return res.status(404).json({error:error.message})
            }
            await doctor.deleteOne()
            res.send('Doctor deleted correctly')
        } catch (error) {
            res.status(500).json('There was an error*')
        }
    }
}