import { ResultAsync, okAsync, errAsync } from "neverthrow";
import e from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from '../models/index.js';


const router = e.Router();

router.post('/api/register', async (req, res) => {
    const { name, email, password, secret_code } = req.body;

    if (!name || !email || !password || !secret_code) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const SECRET_CODES = {
        [process.env.SECRET_CODE_ADMIN]: 'admin',
        [process.env.SECRET_CODE_MANAGER]: 'manager',
        [process.env.SECRET_CODE_EMPLOYEE]: 'employee',
    };

    const role = SECRET_CODES[secret_code];
    if (!role) {
        return res.status(400).json({ message: "Invalid authorization code. Clearance denied." });
    }

    await ResultAsync.fromPromise(
        User.findOne({ email }).exec(),
        (error) => ({ status: 500, message: "Database error during clearance check.", error: error.message })
    )
        .andThen((existingUser) => {
            if (existingUser) return errAsync({ status: 400, message: "Email already registered in the system." });

            // If clear, move to hashing
            return ResultAsync.fromPromise(
                bcrypt.hash(password, 10),
                (error) => ({ status: 500, message: "Internal error securing credentials.", error: error.message })
            );
        })
        .andThen((hashedPassword) => {
            // Create user and return the save promise
            const user = new User({ name, email, password: hashedPassword, role });

            return ResultAsync.fromPromise(
                user.save(),
                (error) => ({ status: 500, message: "Error provisioning user workspace.", error: error.message })
            );
        })
        .match(
            (savedUser) => res.status(201).json({
                message: "System clearance granted. User created successfully.",
                result: savedUser
            }),
            (error) => res.status(error.status || 500).json(error)
        );
});

router.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    await ResultAsync.fromPromise(
        User.findOne({ email }).exec(),
        (error) => ({ status: 500, message: "Database error during user lookup.", error: error.message })
    )
        .andThen((user) => {
            // If user doesn't exist, derail to the error track
            if (!user) return errAsync({ status: 404, message: "Email not found" });

            // Otherwise, return the next ResultAsync (bcrypt)
            return ResultAsync.fromPromise(
                bcrypt.compare(password, user.password),
                (error) => ({ status: 500, message: "Internal error verifying credentials.", error: error.message })
            ).andThen((isValid) =>
                // Check the boolean result of bcrypt
                isValid ? okAsync(user) : errAsync({ status: 400, message: "Password does not match" })
            );
        })
        .andThen((user) => {
            // jwt.sign is synchronous but can throw, so we wrap it
            try {
                const token = jwt.sign(
                    { userId: user._id, userName: user.name, userEmail: user.email, userRole: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: "24h" }
                );
                return okAsync({ user, token }); // Pass both down the chain
            } catch (error) {
                return errAsync({ status: 500, message: "Error generating token", error: error.message });
            }
        })
        .match(
            // The Happy Path End
            ({ user, token }) => res.status(200).json({
                message: "Login Successful",
                email: user.email,
                token
            }),
            // The Error Track End (Catches EVERYTHING)
            (error) => res.status(error.status || 500).json(error)
        );
});

export default router;
