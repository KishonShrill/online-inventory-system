import e from 'express';

import { Item, Record } from '../models/index.js';

const router = e.Router();

router.get('/api/records', async (req, res) => {
    try {
        const records = await Record.find().sort({ type: -1, start_date: -1 })

        res.json(records);

    } catch (error) {
        res.status(500).json({
            path: '/api/records',
            message: error.message
        })
    }
});

router.post('/api/records', async (req, res) => {
    try {
        const { user, item, date, type, quantity, _id } = req.body;

        if (type === 'reserve') {
            const addedRecord = await Record.create({
                start_date: new Date().toLocaleDateString('en-CA'),
                due_date: date,
                user: {
                    name: user.name,
                    contact: user.contact
                },
                type,
                item: {
                    _id: item._id,
                    id: item.id,
                    name: item.name,
                    quantity: quantity ? Number(quantity) : 1
                },
            })

            const returnedItem = await Item.updateOne(
                { id: item.id },
                { $set: {status: "Reserved"} },
            );

            return res.status(201).json({
                message: "Record added successfully",
                result: addedRecord,
                record: {
                    userName: user.name,
                    userContact: user.contact,
                    itemId: item.id,
                    itemName: item.name,
                    date,
                    quantity: quantity ? Number(quantity) : 1,
                    type,
                }
            })
        }

        if (type === 'cancelled') {
            const updatedRecord = await Record.findByIdAndUpdate(
                _id,
                {
                    due_date: 'N/A',
                    returned_date: "N/A",
                    type,
                },
                { new: true }
            );
            const returnedItem = await Item.updateOne(
                { id: item.id },
                { $set: {status: "Available"} },
            );

            return res.status(201).json({
                message: "Record cancelled successfully",
                result: {
                    updatedRecord,
                    returnedItem: await Item.find({id: item.id}, {status: 1}),
                },
            });
        }

        if (type === 'returned') {
            const updatedRecord = await Record.findByIdAndUpdate(
                _id,
                {
                    returned_on: date,
                    type,
                },
                { new: true }
            );
            const returnedItem = await Item.updateOne(
                { id: item.id },
                { $set: {status: "Available"} },
            );

            return res.status(201).json({
                message: "Record returned successfully",
                result: {
                    updatedRecord,
                    returnedItem: await Item.find({id: item.id}, {status: 1}),
                },
            });
        }

        const updatedRecord = await Record.findByIdAndUpdate(
            _id,
            {
                start_date: new Date().toLocaleDateString('en-CA'),
                due_date: date,
                type,
            },
            { new: true }
        );
        const borrowedItem = await Item.updateOne(
            { id: item.id },
            { $set: {status: "Borrowed"} },
        );

        return res.status(201).json({
            message: "Record updated successfully",
            result: {
                updatedRecord,
                borrowedItem: await Item.find({id: item.id}, {status:1}),
            },
            record: {
                userName: user.name,
                userContact: user.contact,
                itemId: item.id,
                itemName: item.name,
                start_date: new Date().toLocaleDateString('en-CA'),
                due_date: date,
                quantity: quantity ? Number(quantity) : 1,
                type,
            }
        })
        
    } catch (error) {
        res.status(500).json({
            path: '/api/records',
            message: error.message
        })
    }
});

export default router;