import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { IAppointment } from "./Appointment";

const specialityDoctor = {
    GENERAL_MEDICINE: 'General medicine',
    ODONTOLOGY:'Odontology',
    OBSTETRICS:'Obstetrics',
    PEDIATRICS:'Pediatrics',
    GERIATRICS:'Geriatrics',
    PSYCHOLOGY:'Psychology'
} as const

export type SpecialityDoctor = typeof specialityDoctor[keyof typeof specialityDoctor]

export interface IRecord extends Document {
    dateRecord: Date
    specialityRecord: {
        specialityR:SpecialityDoctor,
        doctorRecord: {
            doctorR: Types.ObjectId,
            numberAppointment: number
            appointmentsRecord: PopulatedDoc<IAppointment & Document>[]
        }[]
    }[]
}

const recordSchema: Schema = new Schema({
    dateRecord: {
        type: Date,
        required: true
    },
    specialityRecord:[
        {
            specialityR:{
                type: String,
                enum: Object.values(specialityDoctor),
                default: null
            },
            doctorRecord: [
                {
                    doctorR: {
                        type: Types.ObjectId,
                        ref: 'Doctor',
                        required: true,
                        default: null
                    },
                    numberAppointment: {
                        type: Number,
                        default: 10
                    },
                    appointmentsRecord: [
                        {
                            type: Types.ObjectId,
                            ref: 'Appointment'
                        }
                    ]
                }
            ]
        }
    ]
}, { timestamps: true })

const Record = mongoose.model<IRecord>('Record', recordSchema)
export default Record