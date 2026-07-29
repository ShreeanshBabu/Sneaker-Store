const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');

function sendTokenResponse(user, res, statusCode) {
    const token = jwt.sign(
        {userId: user.id, role: user.role},
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    );

    res.cookie('token',token,{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(statusCode).json({
        message: statusCode === 201 ? 'Account Created' : 'Login Successful',
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
}

async function register(req, res) {
    try {
        const {name, email, password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({error: 'Fill all fields'});
        }

        if (password.length < 8) {
            return res.status(400).json({error: 'Password must contain atleast 8 characters'});
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({error: 'Invalid email format'});
        }

        // --- Pre-check: fast, friendly UX for the common case (not a race, just a taken email) ---
        // NOTE: this check alone is NOT a guarantee — two requests with the same
        // email could both pass this check if they arrive at nearly the same time
        // (a "race condition" / TOCTOU: time-of-check to time-of-use gap).
        const existingUser = await prisma.user.findUnique({where: {email} });
        if (existingUser) {
            return res.status(409).json({error: 'An account with this email already exists'});
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {name, email, hashedPassword},
        });

        sendTokenResponse(user, res, 201);
    } catch (err) {
        // --- Real guarantee: Postgres's own @unique constraint on `email` is atomic,
        // so even if two near-simultaneous requests both slip past the findUnique
        // check above, only ONE create() can ever actually succeed. The other
        // will land here with Prisma's known error code for a constraint violation.
        if (err.code === 'P2002') {
            return res.status(409).json({error: 'An account with this email already exists'});
        }

        console.error(err);
        res.status(500).json({error: 'Registration failed'});
    }
}

async function login(req, res) {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({error: 'Email and Password are required'});
    }

    try {
        const user = await prisma.user.findUnique({where: {email}});

        if (!user) return res.status(401).json({error: 'Invalid email or password'});

        const isMatch = await bcrypt.compare(password, user.hashedPassword);

        if (!isMatch) return res.status(401).json({error: 'Invalid email or password'});

        sendTokenResponse(user, res, 200);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Login failed'});
    }
}

async function logout(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    res.status(200).json({message: 'Logged out successfully'});
}

async function getMe(req, res) {
    try {
        const user = await prisma.user.findUnique({
            where: {id: req.user.userId},
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            }
        });

        if (!user) return res.status(404).json({message: 'User not found'});

        res.status(200).json({user});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
}

module.exports = {register, login, logout, getMe};