import { Request, Response } from "express";
import Record from "../models/Record";
import { IRecord } from "../models/Record";

export class RecordController {
    static createRecord = async (req: Request, res: Response) => {
        try {
            const recordData: IRecord = req.body;

            // Crear un nuevo registro
            const record = new Record(recordData);

            // Guardar el registro en la base de datos
            await record.save();

            res.status(201).json(record);
        } catch (error) {
            res.status(500).json({ error: 'There was an error creating the record', details: error.message });
        }
    }

    static getRecords = async (req: Request, res: Response) => {
        try {
            const records = await Record.find()
                .populate({
                    path: 'hospitalRecord.hospitalR',
                    model: 'Hospital'
                })
                .populate({
                    path: 'hospitalRecord.specialityRecord.doctorRecord.doctorR',
                    model: 'Doctor'
                })
                .populate({
                    path: 'hospitalRecord.specialityRecord.doctorRecord.appointmentsRecord',
                    model: 'Appointment'
                });

            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: 'There was an error retrieving the records', details: error.message });
        }
    }

    static updateRecord = async (req: Request, res: Response) => {
        try {
            const recordId = req.params.id;
            const updateData = req.body;

            const updatedRecord = await Record.findByIdAndUpdate(recordId, updateData, { new: true });

            if (!updatedRecord) {
                return res.status(404).json({ error: 'Record not found' });
            }

            res.status(200).json(updatedRecord);
        } catch (error) {
            res.status(500).json({ error: 'There was an error updating the record', details: error.message });
        }
    }

    static deleteRecord = async (req: Request, res: Response) => {
        try {
            const recordId = req.params.id;

            const deletedRecord = await Record.findByIdAndDelete(recordId);

            if (!deletedRecord) {
                return res.status(404).json({ error: 'Record not found' });
            }

            res.status(200).json({ message: 'Record deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'There was an error deleting the record', details: error.message });
        }
    }
}

