import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITokenAffiliate extends Document {
    token:string
    affiliate:Types.ObjectId
    createdAt:Date
    // expiresAt:Date
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
        required: true,
        // default: Date.now(),
        // expires: '30m' 
    }
})

const TokenAffiliate = mongoose.model<ITokenAffiliate>('TokenAffiliate',tokenSchema)
export default TokenAffiliate