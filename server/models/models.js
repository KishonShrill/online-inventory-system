import { config } from "dotenv";
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
    }
});

const User = mongoose.model('Authentication', userSchema, 'users');

export { User };