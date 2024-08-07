import mongoose, { Document, Schema, Types } from "mongoose";

const specialityList = {
    GENERAL_MEDICINE: 'General medicine',
    ODONTOLOGY:'Odontology',
    OBSTETRICS:'Obstetrics',
    PEDIATRICS:'Pediatrics',
    GERIATRICS:'Geriatrics',
    PSYCHOLOGY:'Psychology'
} as const
export type SpecialityList = typeof specialityList[keyof typeof specialityList]

const stateList = {
    PENDING:'Pending',
    RESCHEDULED:'Rescheduled',
    FINISHED:'Finished',
    DAY_OF_APPOINTMENT:'Day_of_appointment'
}
export type StateList = typeof stateList[keyof typeof stateList]

export interface IAppointment extends Document {
    patient: Types.ObjectId
    doctor: Types.ObjectId
    hospital: Types.ObjectId
    speciality: SpecialityList
    dateAppointment: Date
    state: StateList
    orderAttention:number
}

const appointmentSchema:Schema = new Schema({
    patient: {
        type: Types.ObjectId,
        ref:'Patient',
        required:true
    },
    doctor: {
        type: Types.ObjectId,
        ref:'Doctor',
        required:true,
        default: null
    },
    hospital: {
        type: Types.ObjectId,
        ref:'Hospital',
        required:true
    },
    speciality: {
        type: String,
        enum: Object.values(specialityList),
        default: null //specialityList.GENERAL_MEDICINE
    },
    dateAppointment: {
        type: Date,
        required:true
    },
    state: {
        type: String,
        enum: Object.values(stateList),
        default: stateList.PENDING
    },
    orderAttention: {
        type: Number
    }
},{timestamps:true})

const Appointment = mongoose.model<IAppointment>('Appointment',appointmentSchema)
export default Appointment