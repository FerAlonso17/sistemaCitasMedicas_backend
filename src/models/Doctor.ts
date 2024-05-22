import mongoose, { Document, Schema } from "mongoose"

const specialityDoctor = {
    GENERAL_MEDICINE: 'General medicine',
    ODONTOLOGY:'Odontology',
    OBSTETRICS:'Obstetrics',
    PEDIATRICS:'Pediatrics',
    GERIATRICS:'Geriatrics',
    PSYCHOLOGY:'Psychology'
} as const

export type SpecialityDoctor = typeof specialityDoctor[keyof typeof specialityDoctor]

export interface IDoctor extends Document {
    name:string
    dni:string
    speciality: SpecialityDoctor
    appointmentByDay: number
}

const doctorSchema: Schema = new Schema({
    name:{
        type: String,
        required:true,
        trim:true
    },
    dni:{
        type: String,
        required:true,
        trim:true,
        unique:true
    },
    speciality: {
        type: String,
        enum: Object.values(specialityDoctor),
        default: null
    },
    appointmentByDay: {
        type: Number,
        default: 10
    }
})

const Doctor = mongoose.model<IDoctor>('Doctor',doctorSchema)
export default Doctor