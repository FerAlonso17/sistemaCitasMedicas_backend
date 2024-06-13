import  {Request,Response,NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import Administrator, {IAdministrator} from '../models/Administrator'
import Affiliate, { IAffiliate } from '../models/Affiliate'

declare global {
    namespace Express {
        interface Request{
            administrator?: IAdministrator
            affiliate?: IAffiliate
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
                res.status(500).json({error: 'Token no valid - 1'})
            }
        }
    } catch (error) {
        res.status(500).json({error: 'Token no valid - 2'})
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
            const affiliate = await Affiliate.findById(decoded.id)
            if (affiliate) {
                req.affiliate=affiliate
                next()
            } else {
                res.status(500).json({error: 'Token no valid - 3'})
            }
        }
    } catch (error) {
        res.status(500).json({error: 'Token no valid - 4'})
    }
}