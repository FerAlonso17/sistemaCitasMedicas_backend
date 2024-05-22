import { transporter } from "../config/nodemailer"

interface IEmail{
    email:string
    name:string
    token:string
}

export class AuthEmail{
    static sendConfirmationEmail = async (admin: IEmail)=>{
        await transporter.sendMail({
            from: 'HealthInsurance<essalud@health.com>',
            to: admin.email,
            subject: 'Health - Confirma tu cuenta',
            text: 'Health - Confirma tu cuenta',
            html: `<p>Hola ${admin.name}, has creado tu cuenta en Sistema de citas médicas EsSalud, ya casi está todo listo, solo debes confirmar tu cuenta.</p>
                <p>Visita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/admin/confirm-account">Confirmar cuenta</a>
                <p>E ingresa el código: <b>${admin.token}</b></p>
                <p>Este token expira en 10 minutos</p>
            `
        })
    }

    static sendPasswordResetToken = async (admin: IEmail)=>{
        await transporter.sendMail({
            from: 'HealthInsurance<essalud@health.com>',
            to: admin.email,
            subject: 'Health - Reestablece tu password',
            text: 'Health - Reestablece tu password',
            html: `<p>Hola ${admin.name}, has solicitado reestablecer tu password.</p>
                <p>Visita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/admin/new-password">Reestablecer password</a>
                <p>E ingresa el código: <b>${admin.token}</b></p>
                <p>Este token expira en 10 minutos</p>
            `
        })
    }
}