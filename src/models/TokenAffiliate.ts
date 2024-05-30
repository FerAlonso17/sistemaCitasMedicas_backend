import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITokenAffiliate extends Document {
    token:string
    affiliate:Types.ObjectId
    createdAt:Date
    expiresAt:Date
}

const tokenSchema : Schema= new Schema({
    token:{
        type: String,
        required: true
    },
    affiliate:{
        type: Types.ObjectId,
        ref: 'Affiliate'
    },
    expiresAt:{
        type: Date,
        default: Date.now(),
        expires: '10m' 
    }
})

tokenSchema.index({expiresAt:1},{expireAfterSeconds:0})

const TokenAffiliate = mongoose.model<ITokenAffiliate>('TokenAffiliate',tokenSchema)
export default TokenAffiliate