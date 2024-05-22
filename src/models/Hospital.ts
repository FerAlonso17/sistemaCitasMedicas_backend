import mongoose, { Document, Schema } from "mongoose";

export interface IHospital extends Document {
    name: string
    telephone: string
    direction: string
}
const hospitalSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    telephone: {
        type: String,
        required: true
    },
    direction: {
        type: String,
        required: true
    }
})

const Hospital = mongoose.model<IHospital>('Hospital',hospitalSchema)
export default Hospital