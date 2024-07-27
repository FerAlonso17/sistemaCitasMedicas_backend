import type { Request, Response } from "express"
import Affiliate from "../models/Affiliate"
import { generateJWT } from "../utils/jwt"
import Patient, { IPatient } from "../models/Patient"
import { checkPassword, hashPassword } from "../utils/auth"
import { generateToken } from "../utils/token"
import { AuthPatientEmail } from "../email/AuthPatientEmail"
import TokenAffiliate from "../models/TokenAffiliate"

export class AuthAffiliateController {

    // static login = async (req:Request,res:Response)=>{
    //     try {
    //         const {dni} = req.body
    //         const patient = await Affiliate.findOne({dni})

    //         if (!patient) {
    //             const error = new Error('You are not affiliated with insurance')
    //             return res.status(404).json({error: error.message})
    //         }

    //         const jwt = generateJWT({id: patient.id})
    //         res.send(jwt)
    //     } catch (error) {
    //         res.status(500).json({error:'There was an error*'})
    //     }
    // }

    static createAccount = async (req: Request<{}, {}, IPatient>, res: Response) => {
        try {
            const { dni, firstName, lastName, birthdate, email, password } = req.body

            //Verificar si está afiliado
            const dniAffiliateExist = await Affiliate.findOne({ dni })
            if (!dniAffiliateExist) {
                const error = new Error('The user is not affiliated with the insurance')
                return res.status(409).json({ error: error.message })
            }

            //validar datos con la DB
            const fullname = `${firstName.trim()} ${lastName.trim()}`
            if (fullname.toLowerCase() !== dniAffiliateExist.name.trim().toLowerCase()) {
                const error = new Error('The name entered does no match the one that appears on the DNI')
                return res.status(409).json({ error: error.message })
            }

            //Validar fecha de nacimiento
            const birthdateEntered = birthdate.toString()
            const birthdateAffiliateExist = await Affiliate.findOne({ birthdate: birthdateEntered })
            if (!birthdateAffiliateExist) {
                const error = new Error('The birthdate entered does no match the one that appears on the DNI')
                return res.status(409).json({ error: error.message })
            }

            //Prevenir users duplicados
            const patientExist = await Patient.findOne({ email })
            if (patientExist) {
                const error = new Error('The user is already registered')
                return res.status(409).json({ error: error.message })
            }

            //Registrar nuevo paciente
            const patient = new Patient(req.body)

            //Hash psw
            patient.password = await hashPassword(password)

            //Generar token
            const token = new TokenAffiliate({
                token: generateToken().token,
                affiliate: patient.id,
                expiresAt: generateToken().expiresAt
            });

            //enviar email
            AuthPatientEmail.sendConfirmationEmail({
                email: patient.email,
                name: fullname,
                token: token.token
            })

            await Promise.allSettled([patient.save(), token.save()])
            res.send('Account created correctly, check your email to confirm')
        } catch (error) {
            res.status(500).json({ error: 'There was an error*' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenWithData = await TokenAffiliate.findOne({ token })
            if (!tokenWithData) {
                const error = new Error('Token no valid')
                return res.status(404).json({ error: error.message })
            }
            const patient = await Patient.findById(tokenWithData.affiliate)
            patient.confirmed = true
            //await Promise.allSettled([patient.save(), tokenWithData.deleteOne()])

            await patient.save()
            await tokenWithData.deleteOne()

            //res.send('Cuenta confirmada correctamente, ahora puedes iniciar sesión')

            //generar jwt
            const JWT = generateJWT({ id: patient.id })
            res.send(JWT)
        } catch (error) {
            res.status(500).json({ error: 'There was an error*' })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const patient = await Patient.findOne({ email })
            //verificar que exista el user
            if (!patient) {
                const error = new Error('User no exist')
                return res.status(404).json({ error: error.message })
            }

            //verificar que la cuenta este confirmada
            if (!patient.confirmed) {
                const token = new TokenAffiliate({
                    token: generateToken().token,
                    affiliate: patient.id,
                    expiresAt: generateToken().expiresAt
                });
                await token.save()
                AuthPatientEmail.sendConfirmationEmail({
                    email: patient.email,
                    name: `${patient.firstName} ${patient.lastName}`,
                    token: token.token
                })
                const error = new Error('Account no confirmed, we have sent a new confirmation email')
                return res.status(401).json({ error: error.message })
            }

            //verificar pswd
            const isPasswordCorrect = await checkPassword(password, patient.password)
            if (!isPasswordCorrect) {
                const error = new Error('Password incorrect')
                return res.status(404).json({ error: error.message })
            }

            //generar jwt
            const jwt = generateJWT({ id: patient.id })
            res.send(jwt)
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            //Verificar si existe usuario
            const patient = await Patient.findOne({ email })
            if (!patient) {
                const error = new Error('The user is not registered')
                return res.status(404).json({ error: error.message })
            }

            if (patient.confirmed) {
                const error = new Error('The user is already confirmed')
                return res.status(403).json({ error: error.message })
            }

            //Generar el token
            const token = new TokenAffiliate({
                token: generateToken().token,
                affiliate: patient.id,
                expiresAt: generateToken().expiresAt
            });

            //enviar el email
            AuthPatientEmail.sendConfirmationEmail({
                email: patient.email,
                name: `${patient.firstName} ${patient.lastName}`,
                token: token.token
            })

            await Promise.allSettled([patient.save(), token.save()])
            res.send('A new token was sent to your email')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            //Verificar si existe usuario
            const patient = await Patient.findOne({ email })
            if (!patient) {
                const error = new Error('The user is not registered')
                return res.status(404).json({ error: error.message })
            }

            //Generar el token
            const token = new TokenAffiliate({
                token: generateToken().token,
                affiliate: patient.id,
                expiresAt: generateToken().expiresAt
            });
            await token.save()

            //enviar el email
            AuthPatientEmail.sendPasswordResetToken({
                email: patient.email,
                name: `${patient.firstName} ${patient.lastName}`,
                token: token.token
            })

            res.send('Check your email and follow the instruccions')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenWithData = TokenAffiliate.findOne({ token })
            if (!tokenWithData) {
                const error = new Error('Token no valid')
                return res.status(404).json({ error: error.message })
            }
            res.send('Token válid, define your new password')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const tokenWithData = await TokenAffiliate.findOne({ token })
            if (!tokenWithData) {
                const error = new Error('Token no valid')
                return res.status(404).json({ error: error.message })
            }
            const patient = await Patient.findById(tokenWithData.affiliate)
            patient.password = await hashPassword(req.body.password)

            // await Promise.allSettled([patient.save(), tokenWithData.deleteOne()])
            await patient.save()
            await tokenWithData.deleteOne()
            res.send('Password modified correctly')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static patient = async (req: Request, res: Response) => {
        return res.json(req.patient)
    }
}