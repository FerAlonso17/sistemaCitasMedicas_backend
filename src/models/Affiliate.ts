import mongoose, { Document, Schema } from "mongoose";

export interface IAffiliate extends Document {
    dni: string
    name: string
}

const affiliateSchema : Schema = new Schema({
    dni:{
        type: String,
        required: true,
        unique: true
    },
    name:{
        type: String,
        required: true
    }
})

const Affiliate = mongoose.model<IAffiliate>('Affiliate',affiliateSchema)
export default Affiliate