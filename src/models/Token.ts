import mongoose, { Document, Schema, Types } from "mongoose";

export interface IToken extends Document {
    token:string
    administrator:Types.ObjectId
    createdAt:Date
    // expiresAt:Date
}

const tokenSchema : Schema= new Schema({
    token:{
        type: String,
        required: true
    },
    administrator:{
        type: Types.ObjectId,
        ref: 'Administrator'
    },
    expiresAt:{
        type: Date,
        required: true,
        // default: Date.now(),
        // expires: '30m' 
    }
})

const Token = mongoose.model<IToken>('Token',tokenSchema)
export default Token