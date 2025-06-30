import { config } from "dotenv";
import { Contact } from "lucide-react";
import mongoose from "mongoose";


config();

const uri = process.env.HIDDEN_URI;

mongoose.connect(uri)
    .then(() => { console.log('✅ Connected to MongoDB'); })
    .catch(err => { console.error('❌ MongoDB connection error:', err.message); });


// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name!"],
        unique: [true, "This name is already taken!"],
    },
    email: {
        type: String,
        required: [true, "Please provide a valid Email!"],
        unique: [true, "Email is already used!"],
    },
    password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
    },
    role: {
        type: String,
        // required: [true, "Please provide this user a role!"],
    }
});

// Item Schema
const itemSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: [true, "This ID is already taken!"],
    },
    name: {
        type: String,
        required: [true, "Please provide a name!"],
        unique: [true, "This name is already used!"],
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        required: [true, "Please provide what category!"],
    },
    color: {
        type: String,
        required: [true, "What color is this item?"]
    },
    date_added: {
        type: Date,
        required: [true, "Please input the date it was added!"]
    },
    items: [
        {
            _id: false, // ← prevents automatic _id generation for each component
            name: {
                type: String,
                required: true,
            },
            quantity: {
                type: mongoose.Schema.Types.Int32,
                required: true,
            }
        }
    ]
}, { strict: false });

// Record Schema
const recordSchema = new mongoose.Schema({
    start_date: {
        type: Date,
        required: [true, "Please input starting date!"],
    },
    due_date: {
        type: Date,
        required: [true, "Please input due date!"],
    },
    user: {
        name: {
            type: String,
            required: true,
        },
        contact: {
            type: String,
            required: true,
        }
    },
    type: {
        type: String,
        required: [true, "What type of record is this?"]
    },
    item: {
        id: {
            type: String,
            ref: 'Item',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        quantity: {
            type: mongoose.Schema.Types.Int32,
        }
    }
}, { strict: false })



const User = mongoose.model('User', userSchema, 'users');
const Item = mongoose.model('Item', itemSchema, 'items');
const Record = mongoose.model('Record', recordSchema, 'records');

export { User, Item, Record };