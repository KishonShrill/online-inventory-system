import e from "express";

import { Attendance } from "../models/index.js";

const router = e.Router();

router.get('/api/attendances', async (req, res) => {
    const { limit, date } = req.query;
    
    let isToday = false;
    if ('today' === limit) isToday = true; 
    try {
        const attendances = isToday
            ? await Attendance.find({ date: new Date(date) }).sort({ date: -1, category: 1 })
            : await Attendance.find().sort({ date: -1 })

        res.json(attendances);
        
    } catch (error) {
        res.status(500).json({
            path: '/api/attendances',
            message: error.message,
        });
    }
});

router.post('/api/attendances', async (req, res) => {
    try {
        const { body } = req;

        console.log(JSON.stringify(body))

        const attendance = await Attendance.create(body)

        return res.status(201).json({
            message: `Attendance taken for item ${body.id}`,
            result: attendance,
        })
        
    } catch (error) {
        res.status(500).json({
            path: '/api/items',
            message: error.message,
            type: req.body.type,
        });
    }
})

export default router;