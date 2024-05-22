import mongoose, { Document, Schema, Types } from "mongoose";

export interface IToken extends Document {
    token:string
    administrator:Types.ObjectId
    createdAt:Date
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
        default: Date.now(),
        expires: '20m' 
    }
})

const Token = mongoose.model<IToken>('Token',tokenSchema)
export default Token