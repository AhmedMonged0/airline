const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const router = express.Router();

// Get all contact messages
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT * FROM contact_messages 
            ORDER BY created_at DESC
        `);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب رسائل التواصل'
        });
    }
});

// Get contact message by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(`
            SELECT * FROM contact_messages WHERE id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'الرسالة غير موجودة'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching contact message:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الرسالة'
        });
    }
});

// Create new contact message
router.post('/', [
    body('name').notEmpty().withMessage('الاسم مطلوب'),
    body('email').isEmail().withMessage('البريد الإلكتروني غير صحيح'),
    body('subject').notEmpty().withMessage('الموضوع مطلوب'),
    body('message').notEmpty().withMessage('الرسالة مطلوبة').isLength({ min: 10 }).withMessage('الرسالة يجب أن تكون 10 أحرف على الأقل')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const {
            name,
            email,
            subject,
            message
        } = req.body;

        // Insert message into database
        const [result] = await pool.execute(`
            INSERT INTO contact_messages (name, email, subject, message)
            VALUES (?, ?, ?, ?)
        `, [name, email, subject, message]);

        // Get the created message
        const [newMessage] = await pool.execute(`
            SELECT * FROM contact_messages WHERE id = ?
        `, [result.insertId]);

        // Send notification email (simulated)
        await sendContactNotification(newMessage[0]);

        res.status(201).json({
            success: true,
            message: 'تم إرسال رسالتك بنجاح. سنقوم بالرد عليك قريباً.',
            data: newMessage[0]
        });

    } catch (error) {
        console.error('Error creating contact message:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إرسال الرسالة'
        });
    }
});

// Update contact message status
router.put('/:id/status', [
    body('status').isIn(['unread', 'read', 'replied']).withMessage('حالة الرسالة غير صحيحة')
], async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        // Check if message exists
        const [existingMessage] = await pool.execute(`
            SELECT * FROM contact_messages WHERE id = ?
        `, [id]);

        if (existingMessage.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'الرسالة غير موجودة'
            });
        }

        // Update message status
        await pool.execute(`
            UPDATE contact_messages SET status = ? WHERE id = ?
        `, [status, id]);

        // Get updated message
        const [updatedMessage] = await pool.execute(`
            SELECT * FROM contact_messages WHERE id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'تم تحديث حالة الرسالة بنجاح',
            data: updatedMessage[0]
        });

    } catch (error) {
        console.error('Error updating contact message status:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث حالة الرسالة'
        });
    }
});

// Delete contact message
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if message exists
        const [existingMessage] = await pool.execute(`
            SELECT * FROM contact_messages WHERE id = ?
        `, [id]);

        if (existingMessage.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'الرسالة غير موجودة'
            });
        }

        // Delete message
        await pool.execute(`
            DELETE FROM contact_messages WHERE id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'تم حذف الرسالة بنجاح'
        });

    } catch (error) {
        console.error('Error deleting contact message:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف الرسالة'
        });
    }
});

// Get messages by status
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ['unread', 'read', 'replied'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'حالة الرسالة غير صحيحة'
            });
        }

        const [rows] = await pool.execute(`
            SELECT * FROM contact_messages 
            WHERE status = ?
            ORDER BY created_at DESC
        `, [status]);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Error fetching messages by status:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الرسائل'
        });
    }
});

// Get contact statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const [totalMessages] = await pool.execute(`
            SELECT COUNT(*) as total FROM contact_messages
        `);

        const [unreadMessages] = await pool.execute(`
            SELECT COUNT(*) as unread FROM contact_messages WHERE status = 'unread'
        `);

        const [readMessages] = await pool.execute(`
            SELECT COUNT(*) as read FROM contact_messages WHERE status = 'read'
        `);

        const [repliedMessages] = await pool.execute(`
            SELECT COUNT(*) as replied FROM contact_messages WHERE status = 'replied'
        `);

        const [recentMessages] = await pool.execute(`
            SELECT COUNT(*) as recent FROM contact_messages 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);

        res.json({
            success: true,
            data: {
                total: totalMessages[0].total,
                unread: unreadMessages[0].unread,
                read: readMessages[0].read,
                replied: repliedMessages[0].replied,
                recent: recentMessages[0].recent
            }
        });

    } catch (error) {
        console.error('Error fetching contact stats:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الإحصائيات'
        });
    }
});

// Search contact messages
router.get('/search/query', async (req, res) => {
    try {
        const { q, status, date_from, date_to } = req.query;
        
        let query = 'SELECT * FROM contact_messages WHERE 1=1';
        const params = [];

        if (q) {
            query += ' AND (name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)';
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (date_from) {
            query += ' AND created_at >= ?';
            params.push(date_from);
        }

        if (date_to) {
            query += ' AND created_at <= ?';
            params.push(date_to);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await pool.execute(query, params);

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });

    } catch (error) {
        console.error('Error searching contact messages:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء البحث في الرسائل'
        });
    }
});

// Send contact notification email (simulated)
async function sendContactNotification(message) {
    try {
        // This would integrate with your email service
        console.log('Sending contact notification for:', message.email);
        console.log('Message details:', message);
        
        // In a real implementation, you would use nodemailer here
        // const transporter = nodemailer.createTransporter({
        //     host: process.env.EMAIL_HOST,
        //     port: process.env.EMAIL_PORT,
        //     secure: false,
        //     auth: {
        //         user: process.env.EMAIL_USER,
        //         pass: process.env.EMAIL_PASS
        //     }
        // });
        
        // Send notification to admin
        // await transporter.sendMail({
        //     from: process.env.EMAIL_USER,
        //     to: process.env.ADMIN_EMAIL,
        //     subject: 'رسالة تواصل جديدة - شركة الطيران العربية',
        //     html: generateAdminNotificationTemplate(message)
        // });
        
        // Send confirmation to user
        // await transporter.sendMail({
        //     from: process.env.EMAIL_USER,
        //     to: message.email,
        //     subject: 'تأكيد استلام رسالتك - شركة الطيران العربية',
        //     html: generateUserConfirmationTemplate(message)
        // });
        
    } catch (error) {
        console.error('Error sending contact notification:', error);
    }
}

// Generate admin notification email template
function generateAdminNotificationTemplate(message) {
    return `
        <div dir="rtl" style="font-family: 'Cairo', sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>رسالة تواصل جديدة</h2>
            <p>تم استلام رسالة تواصل جديدة من الموقع.</p>
            
            <h3>تفاصيل الرسالة:</h3>
            <ul>
                <li><strong>الاسم:</strong> ${message.name}</li>
                <li><strong>البريد الإلكتروني:</strong> ${message.email}</li>
                <li><strong>الموضوع:</strong> ${message.subject}</li>
                <li><strong>الرسالة:</strong> ${message.message}</li>
                <li><strong>التاريخ:</strong> ${message.created_at}</li>
            </ul>
            
            <p>يرجى الرد على هذه الرسالة في أقرب وقت ممكن.</p>
        </div>
    `;
}

// Generate user confirmation email template
function generateUserConfirmationTemplate(message) {
    return `
        <div dir="rtl" style="font-family: 'Cairo', sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>تأكيد استلام رسالتك</h2>
            <p>مرحباً ${message.name}،</p>
            <p>شكراً لك على التواصل معنا. تم استلام رسالتك بنجاح.</p>
            
            <h3>تفاصيل رسالتك:</h3>
            <ul>
                <li><strong>الموضوع:</strong> ${message.subject}</li>
                <li><strong>الرسالة:</strong> ${message.message}</li>
                <li><strong>التاريخ:</strong> ${message.created_at}</li>
            </ul>
            
            <p>سنقوم بالرد عليك في أقرب وقت ممكن.</p>
            
            <p>مع تحيات،<br>فريق شركة الطيران العربية</p>
        </div>
    `;
}

module.exports = router; 