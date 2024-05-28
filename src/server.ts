import express from "express";
import { configDotenv } from "dotenv";
import morgan from "morgan";
import cors from 'cors'
import { connectDB } from "./config/db";
import authAdminRoutes from './routes/authAdminRoutes'
import authAffiliateRoutes from './routes/authAffiliateRoutes'
import appointmentRoutes from './routes/appointmentRoutes'
import recordRoutes from './routes/recordRoutes'
import { corsConfig } from "./config/cors";

configDotenv()
connectDB()

const app = express()
app.use(cors(corsConfig))

app.use(morgan('dev'))

app.use(express.json())

//Routes
app.use('/api/auth', authAdminRoutes)
app.use('/api/affiliate/auth',authAffiliateRoutes)
app.use('/api/affiliate/appointments',appointmentRoutes)
app.use('/api/record',recordRoutes)

export default app