import { transporter } from "../config/nodemailer"

interface IEmail{
    email:string
    name:string
    token:string
}

export class AuthPatientEmail{
    static sendConfirmationEmail = async (patient: IEmail)=>{
        await transporter.sendMail({
            from: 'HealthInsurance<essalud@health.com>',
            to: patient.email,
            subject: 'Health - Confirma tu cuenta',
            text: 'Health - Confirma tu cuenta',
            html: `<p>Hola ${patient.name}, has creado tu cuenta en Sistema de citas médicas EsSalud, ya casi está todo listo, solo debes confirmar tu cuenta.</p>
                <p>Código de confirmación: <b>${patient.token}</b></p>
                <p>Este token expira en 10 minutos</p>
            `
        })
    }

    static sendPasswordResetToken = async (patient: IEmail)=>{
        await transporter.sendMail({
            from: 'HealthInsurance<essalud@health.com>',
            to: patient.email,
            subject: 'Health - Reestablece tu password',
            text: 'Health - Reestablece tu password',
            html: `<p>Hola ${patient.name}, has solicitado reestablecer tu password.</p>
                <p>Código de confirmación: <b>${patient.token}</b></p>
                <p>Este token expira en 10 minutos</p>
            `
        })
    }
}