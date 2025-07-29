const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'رمز الوصول مطلوب'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'رمز الوصول غير صحيح'
            });
        }
        req.user = user;
        next();
    });
};

// Admin login
router.post('/login', [
    body('username').notEmpty().withMessage('اسم المستخدم مطلوب'),
    body('password').notEmpty().withMessage('كلمة المرور مطلوبة')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // Find user
        const user = await db.get(`
            SELECT * FROM admin_users WHERE username = ?
        `, [username]);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تسجيل الدخول'
        });
    }
});

// Get dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        // Get booking statistics
        const bookingStats = await db.get(`
            SELECT 
                COUNT(*) as total_bookings,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
                COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings
            FROM bookings
        `);

        // Get contact message statistics
        const contactStats = await db.get(`
            SELECT 
                COUNT(*) as total_messages,
                COUNT(CASE WHEN status = 'unread' THEN 1 END) as unread_messages,
                COUNT(CASE WHEN status = 'read' THEN 1 END) as read_messages,
                COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied_messages
            FROM contact_messages
        `);

        // Get recent bookings
        const recentBookings = await db.all(`
            SELECT * FROM bookings 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        // Get recent messages
        const recentMessages = await db.all(`
            SELECT * FROM contact_messages 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                bookings: bookingStats,
                messages: contactStats,
                recent_bookings: recentBookings,
                recent_messages: recentMessages
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب بيانات لوحة التحكم'
        });
    }
});

// Get all admin users
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await db.all(`
            SELECT id, username, email, role, created_at 
            FROM admin_users 
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب المستخدمين'
        });
    }
});

// Create new admin user
router.post('/users', [
    authenticateToken,
    body('username').notEmpty().withMessage('اسم المستخدم مطلوب'),
    body('email').isEmail().withMessage('البريد الإلكتروني غير صحيح'),
    body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    body('role').isIn(['admin', 'moderator']).withMessage('الدور غير صحيح')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const { username, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await db.get(`
            SELECT * FROM admin_users WHERE username = ? OR email = ?
        `, [username, email]);

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await db.run(`
            INSERT INTO admin_users (username, email, password, role)
            VALUES (?, ?, ?, ?)
        `, [username, email, hashedPassword, role]);

        // Get the created user
        const newUser = await db.get(`
            SELECT id, username, email, role, created_at 
            FROM admin_users WHERE id = ?
        `, [result.id]);

        res.status(201).json({
            success: true,
            message: 'تم إنشاء المستخدم بنجاح',
            data: newUser
        });

    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إنشاء المستخدم'
        });
    }
});

module.exports = router;