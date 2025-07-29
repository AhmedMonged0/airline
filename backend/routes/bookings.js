const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const router = express.Router();

// Get all bookings
router.get('/', async (req, res) => {
    try {
        const rows = await db.all(`
            SELECT * FROM bookings 
            ORDER BY created_at DESC
        `);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الحجوزات'
        });
    }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const row = await db.get(`
            SELECT * FROM bookings WHERE id = ?
        `, [id]);
        
        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'الحجز غير موجود'
            });
        }
        
        res.json({
            success: true,
            data: row
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الحجز'
        });
    }
});

// Create new booking
router.post('/', [
    body('name').notEmpty().withMessage('الاسم مطلوب'),
    body('email').isEmail().withMessage('البريد الإلكتروني غير صحيح'),
    body('phone').notEmpty().withMessage('رقم الهاتف مطلوب'),
    body('from_location').notEmpty().withMessage('مدينة المغادرة مطلوبة'),
    body('to_location').notEmpty().withMessage('مدينة الوصول مطلوبة'),
    body('departure_date').isDate().withMessage('تاريخ المغادرة غير صحيح'),
    body('passengers').isInt({ min: 1 }).withMessage('عدد الركاب يجب أن يكون 1 على الأقل'),
    body('class_type').isIn(['economy', 'business', 'first']).withMessage('فئة المقعد غير صحيحة')
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
            phone,
            from_location,
            to_location,
            departure_date,
            return_date,
            passengers,
            class_type
        } = req.body;

        // Insert booking into database
        const result = await db.run(`
            INSERT INTO bookings (
                name, email, phone, from_location, to_location,
                departure_date, return_date, passengers, class_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            name, email, phone, from_location, to_location,
            departure_date, return_date, passengers, class_type
        ]);

        // Get the created booking
        const newBooking = await db.get(`
            SELECT * FROM bookings WHERE id = ?
        `, [result.id]);

        // Send confirmation email (simulated)
        await sendBookingConfirmation(newBooking);

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الحجز بنجاح',
            data: newBooking
        });

    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إنشاء الحجز'
        });
    }
});

// Update booking
router.put('/:id', [
    body('name').optional().notEmpty().withMessage('الاسم مطلوب'),
    body('email').optional().isEmail().withMessage('البريد الإلكتروني غير صحيح'),
    body('phone').optional().notEmpty().withMessage('رقم الهاتف مطلوب'),
    body('status').optional().isIn(['pending', 'confirmed', 'cancelled']).withMessage('حالة الحجز غير صحيحة')
], async (req, res) => {
    try {
        const { id } = req.params;
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        // Check if booking exists
        const existingBooking = await db.get(`
            SELECT * FROM bookings WHERE id = ?
        `, [id]);

        if (!existingBooking) {
            return res.status(404).json({
                success: false,
                message: 'الحجز غير موجود'
            });
        }

        // Update booking
        const updateFields = [];
        const updateValues = [];
        
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(req.body[key]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'لا توجد بيانات للتحديث'
            });
        }

        updateValues.push(id);
        await db.run(`
            UPDATE bookings SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, updateValues);

        // Get updated booking
        const updatedBooking = await db.get(`
            SELECT * FROM bookings WHERE id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'تم تحديث الحجز بنجاح',
            data: updatedBooking
        });

    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث الحجز'
        });
    }
});

// Delete booking
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if booking exists
        const existingBooking = await db.get(`
            SELECT * FROM bookings WHERE id = ?
        `, [id]);

        if (!existingBooking) {
            return res.status(404).json({
                success: false,
                message: 'الحجز غير موجود'
            });
        }

        // Delete booking
        await db.run(`
            DELETE FROM bookings WHERE id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'تم حذف الحجز بنجاح'
        });

    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف الحجز'
        });
    }
});

// Get bookings by status
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ['pending', 'confirmed', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'حالة الحجز غير صحيحة'
            });
        }

        const rows = await db.all(`
            SELECT * FROM bookings 
            WHERE status = ?
            ORDER BY created_at DESC
        `, [status]);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Error fetching bookings by status:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الحجوزات'
        });
    }
});

// Get bookings statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const totalBookings = await db.get(`
            SELECT COUNT(*) as total FROM bookings
        `);

        const pendingBookings = await db.get(`
            SELECT COUNT(*) as pending FROM bookings WHERE status = 'pending'
        `);

        const confirmedBookings = await db.get(`
            SELECT COUNT(*) as confirmed FROM bookings WHERE status = 'confirmed'
        `);

        const cancelledBookings = await db.get(`
            SELECT COUNT(*) as cancelled FROM bookings WHERE status = 'cancelled'
        `);

        const recentBookings = await db.get(`
            SELECT COUNT(*) as recent FROM bookings 
            WHERE created_at >= datetime('now', '-7 days')
        `);

        res.json({
            success: true,
            data: {
                total: totalBookings.total,
                pending: pendingBookings.pending,
                confirmed: confirmedBookings.confirmed,
                cancelled: cancelledBookings.cancelled,
                recent: recentBookings.recent
            }
        });

    } catch (error) {
        console.error('Error fetching booking stats:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الإحصائيات'
        });
    }
});

// Search bookings
router.get('/search/query', async (req, res) => {
    try {
        const { q, status, date_from, date_to } = req.query;
        
        let query = 'SELECT * FROM bookings WHERE 1=1';
        const params = [];

        if (q) {
            query += ' AND (name LIKE ? OR email LIKE ? OR from_location LIKE ? OR to_location LIKE ?)';
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (date_from) {
            query += ' AND departure_date >= ?';
            params.push(date_from);
        }

        if (date_to) {
            query += ' AND departure_date <= ?';
            params.push(date_to);
        }

        query += ' ORDER BY created_at DESC';

        const rows = await db.all(query, params);

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });

    } catch (error) {
        console.error('Error searching bookings:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء البحث في الحجوزات'
        });
    }
});

// Send booking confirmation email (simulated)
async function sendBookingConfirmation(booking) {
    try {
        // This would integrate with your email service
        console.log('Sending confirmation email to:', booking.email);
        console.log('Booking details:', booking);
        
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
        
        // await transporter.sendMail({
        //     from: process.env.EMAIL_USER,
        //     to: booking.email,
        //     subject: 'تأكيد الحجز - شركة الطيران العربية',
        //     html: generateBookingEmailTemplate(booking)
        // });
        
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}

// Generate booking email template
function generateBookingEmailTemplate(booking) {
    return `
        <div dir="rtl" style="font-family: 'Cairo', sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>تأكيد الحجز</h2>
            <p>مرحباً ${booking.name}،</p>
            <p>شكراً لك على حجز رحلتك مع شركة الطيران العربية.</p>
            
            <h3>تفاصيل الحجز:</h3>
            <ul>
                <li><strong>رقم الحجز:</strong> ${booking.id}</li>
                <li><strong>من:</strong> ${booking.from_location}</li>
                <li><strong>إلى:</strong> ${booking.to_location}</li>
                <li><strong>تاريخ المغادرة:</strong> ${booking.departure_date}</li>
                <li><strong>عدد الركاب:</strong> ${booking.passengers}</li>
                <li><strong>فئة المقعد:</strong> ${booking.class_type}</li>
            </ul>
            
            <p>سنقوم بالتواصل معك قريباً لتأكيد تفاصيل الرحلة.</p>
            
            <p>مع تحيات،<br>فريق شركة الطيران العربية</p>
        </div>
    `;
}

module.exports = router; 