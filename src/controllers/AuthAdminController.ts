import type { Request,Response } from "express"
import Administrator from "../models/Administrator"
import { checkPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../email/AuthEmail"
import { generateJWT } from "../utils/jwt"

export class AuthAdminController {
    static createAccount = async (req:Request,res:Response)=>{
        try {
            const {email,password} = req.body

            //Prevenir users duplicados
            const adminExist = await Administrator.findOne({email})
            if (adminExist) {
                const error = new Error('The user is already registered')
                return res.status(409).json({error: error.message})
            }

            //Registrar nuevo admin
            const admin = new Administrator(req.body)

            //Hash psw
            admin.password = await hashPassword(password)

            //Generar token
            const token = new Token()
            token.token = generateToken()
            token.administrator=admin.id

            //enviar email
            AuthEmail.sendConfirmationEmail({
                email: admin.email,
                name: admin.name,
                token: token.token
            })

            await Promise.allSettled([admin.save(),token.save()])
            res.send('Account created correctly, check your email to confirm')
        } catch (error) {
            res.status(500).json({error: 'There was an error*'})
        }
    }

    static confirmAccount =async (req:Request,res:Response)=>{
        try {
            const {token} = req.body
            const tokenWithData = await Token.findOne({token})
            if (!tokenWithData) {
                const error = new Error('Token no valid')
                return res.status(404).json({error: error.message})
            }
            const administrator = await Administrator.findById(tokenWithData.administrator)
            administrator.confirmed=true
            await Promise.allSettled([administrator.save(),tokenWithData.deleteOne()])
            
            //res.send('Cuenta confirmada correctamente, ahora puedes iniciar sesión')
            
            //generar jwt
            const JWT = generateJWT({id:administrator.id})
            res.send(JWT)
        } catch (error) {
            res.status(500).json({error: 'There was an error*'})
        }
    }

    static login = async (req:Request,res:Response)=>{
        try {
            const {email,password} = req.body
            const admin = await Administrator.findOne({email})
            //verificar que exista el user
            if (!admin) {
                const error= new Error('User no exist')
                return res.status(404).json({error:error.message})
            }

            //verificar que la cuenta este confirmada
            if (!admin.confirmed) {
                const token = new Token()
                token.token = generateToken()
                token.administrator= admin.id
                await token.save()
                AuthEmail.sendConfirmationEmail({
                    email: admin.email,
                    name: admin.name,
                    token: token.token
                })
                const error= new Error('Account no confirmed, we have sent a new confirmation email')
                return res.status(401).json({error:error.message})
            }

            //verificar pswd
            const isPasswordCorrect = await checkPassword(password,admin.password)
            if (!isPasswordCorrect) {
                const error= new Error('Password incorrect')
                return res.status(404).json({error:error.message})
            }

            //generar jwt
            const jwt = generateJWT({id: admin.id})
            res.send(jwt)
        } catch (error) {
            res.status(500).json({error: 'There was an error'})
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            //Verificar si existe usuario
            const admin = await Administrator.findOne({ email })
            if (!admin) {
                const error = new Error('The user is not registered')
                return res.status(404).json({ error: error.message })
            }

            if (admin.confirmed) {
                const error = new Error('The user is already confirmed')
                return res.status(403).json({ error: error.message })
            }

            //Generar el token
            const token = new Token()
            token.token = generateToken()
            token.administrator = admin.id
            //await token.save()

            //enviar el email
            AuthEmail.sendConfirmationEmail({
                email: admin.email,
                name: admin.name,
                token: token.token
            })

            await Promise.allSettled([admin.save(), token.save()])
            res.send('A new token was sent to your email')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            //Verificar si existe usuario
            const admin = await Administrator.findOne({ email })
            if (!admin) {
                const error = new Error('The user is not registered')
                return res.status(404).json({ error: error.message })
            }

            //Generar el token
            const token = new Token()
            token.token = generateToken()
            token.administrator = admin.id
            await token.save()

            //enviar el email
            AuthEmail.sendPasswordResetToken({
                email: admin.email,
                name: admin.name,
                token: token.token
            })

            res.send('Check your email and follow the instruccions')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static validateToken = async (req: Request, res: Response)=>{
        try {
            const {token} = req.body
            const tokenWithData = Token.findOne({token})
            if (!tokenWithData) {
                const error = new Error('Token no valid')
                return res.status(404).json({error: error.message})
            }
            res.send('Token válid, define your new password')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response)=>{
        try {
            const {token} = req.params
            const tokenWithData = await Token.findOne({token})
            if (!tokenWithData) {
                const error = new Error('Token no valid')
                return res.status(404).json({error: error.message})
            }
            const admin = await Administrator.findById(tokenWithData.administrator)
            admin.password = await hashPassword(req.body.password)

            await Promise.allSettled([admin.save(), tokenWithData.deleteOne()])
            res.send('Password modified correctly')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static admin = async (req: Request, res: Response)=>{
        return res.json(req.administrator)
    }
}