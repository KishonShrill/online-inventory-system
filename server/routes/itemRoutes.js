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

router.post('/api/items', async (req, res) => {
    try {
        const { id, name, description, category, color, date_added, type, _id, items } = req.body;

        console.log(type)

        if (type === 'UPDATE') {
            // Update the existing item by _id
            const updated = await Item.findByIdAndUpdate(
                _id, // You need to pass _id from the frontend
                { description, category, color, date_added, items},
                { new: true } // Return the updated document
            );

            if (!updated) {
                return res.status(404).json({ message: "Item not found", type });
            }

            return res.status(200).json({
                message: "Item updated successfully",
                result: updated,
                type
            });
        }

        // Default: create a new item
        const item = new Item({
            id,
            name,
            description,
            category,
            color,
            date_added,
            items: Array.isArray(items) ? items : [] // fallback in case when empty
        });

        const result = await item.save();
        res.status(201).json({
            message: "Item created successfully",
            result,
            type
        });

    } catch (error) {
        res.status(500).json({
            path: '/api/items',
            message: error.message,
            type: req.body.type,
        });
    }
});


router.delete('/api/items', async (req, res) => {
    try {
        const itemId = req.body.id; // the _id of the item to delete

        if (!itemId) {
            return res.status(400).json({
                message: 'Missing item ID in request body',
                path: '/api/items',
            });
        }

        const result = await Item.deleteOne({ _id: itemId });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: 'Item not found',
                path: '/api/items',
            });
        }

        res.status(200).json({
            message: 'Item deleted successfully',
            result: itemId,
            type: req.body.type,
        });
        
    } catch (error) {
        res.status(500).json({
            path: '/api/items',
            message: error.message,
            type: req.body.type,
        }); 
    }
})

export default router;