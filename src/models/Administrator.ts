import mongoose, { Document, Schema } from "mongoose";

export interface IAdministrator extends Document {
    email: string
    password: string
    name: string
    position: string
    confirmed: boolean
}

const administratorSchema : Schema = new Schema({
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
    name: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    confirmed: {
        type: Boolean,
        default: false
    }
})

const Administrator = mongoose.model<IAdministrator>('Administrator',administratorSchema)
export default Administrator