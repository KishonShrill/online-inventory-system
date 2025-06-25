import e from "express";

import { Item } from "../models/models.js";

const router = e.Router();

router.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find().sort({ category: -1 })
        
        res.json(items);

    } catch (error) {
        res.status(500).json({ 
            path: '/api/items',
            message: error.message 
        })
    }
});

export default router;