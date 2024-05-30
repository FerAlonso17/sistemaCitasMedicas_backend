import mongoose, { Document, Schema } from "mongoose";

export interface IPatient extends Document{
    dni: string
    firstName: string
    lastName: string
    birthdate: Date
    email: string
    password: string
    confirmed:boolean
}

const patientSchema: Schema = new Schema({
    dni: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmed: {
        type: Boolean,
        default: false
    }
})

const Patient = mongoose.model<IPatient>('Patient',patientSchema)
export default Patient