import { config } from "dotenv";
import cors from 'cors';
import express from "express";
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';


config();

const PORT = process.env.PORT || 5000;
const DEVELOPMENT = process.env.VITE_LOCALHOST || 'localhost';

const allowedOrigins = process.env.DEVELOPMENT
    ? [
        'http://localhost:5173',
        'http://localhost:4173',
        `http://${DEVELOPMENT}:5173`,
        `http://${DEVELOPMENT}:4173`,
        `https://cdiis-ois.vercel.app`,
    ]
    : `https://cdiis-ois.vercel.app`;

const corsOptions = {
    origin: function (origin, callback) {
        console.log("Origin Requests: " + origin);
        console.log("Non-browser: " + !origin);

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if the origin is in the allowed origins list
        if (allowedOrigins.includes(origin)) {
            // ✅ Origin is allowed
            callback(null, true);
        } else {
            // ❌ Origin not allowed
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true, // Allow cookies, authorization headers if needed
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content', 'Accept', 'Content-Type', 'Authorization']
};

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use([
    '/register',
    '/login',
    '/api',
], limiter);

app.use(authRoutes);
app.use(itemRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});