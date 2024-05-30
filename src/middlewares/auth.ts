import  {Request,Response,NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import Administrator, {IAdministrator} from '../models/Administrator'
import Patient, { IPatient } from '../models/Patient'

declare global {
    namespace Express {
        interface Request{
            administrator?: IAdministrator
            patient?: IPatient
        }
    }
}

export const authenticateAdmin = async (req: Request,res:Response,next:NextFunction)=>{
    const bearer = req.headers.authorization
    if (!bearer) {
        const error = new Error('Not authorized')
        return res.status(401).json({error: error.message})
    }

    const token = bearer.split(' ')[1]

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        if (typeof decoded === 'object' && decoded.id) {
            const administrator = await Administrator.findById(decoded.id).select('_id name email')
            if (administrator) {
                req.administrator=administrator
                next()
            } else {
                res.status(500).json({error: 'Token no valid'})
            }
        }
    } catch (error) {
        res.status(500).json({error: 'Token no valid'})
    }
}

export const authenticateAffiliate = async (req: Request,res:Response,next:NextFunction)=>{
    const bearer = req.headers.authorization

    if (!bearer) {
        const error = new Error('Not authorized')
        return res.status(401).json({error: error.message})
    }

    const token = bearer.split(' ')[1]

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        if (typeof decoded === 'object' && decoded.id) {
            const patient = await Patient.findById(decoded.id)
            if (patient) {
                req.patient=patient
                next()
            } else {
                res.status(500).json({error: 'Token no valid'})
            }
        }
    } catch (error) {
        res.status(500).json({error: 'Token no valid'})
    }
}