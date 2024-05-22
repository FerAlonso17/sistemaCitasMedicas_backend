import type { Request,Response } from "express"
import Affiliate from "../models/Affiliate"
import { generateJWT } from "../utils/jwt"

export class AuthAffiliateController{

    static login = async (req:Request,res:Response)=>{
        try {
            const {dni} = req.body
            const patient = await Affiliate.findOne({dni})

            if (!patient) {
                const error = new Error('You are not affiliated with insurance')
                return res.status(404).json({error: error.message})
            }

            const jwt = generateJWT({id: patient.id})
            res.send(jwt)
        } catch (error) {
            res.status(500).json({error:'There was an error*'})
        }
    }

    static patient = async (req:Request,res:Response)=>{
        return res.json(req.affiliate)
    }
}