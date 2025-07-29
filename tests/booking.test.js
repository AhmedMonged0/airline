const request = require('supertest');
const app = require('../server');
const pool = require('../backend/config/database');

describe('Booking API Tests', () => {
  beforeAll(async () => {
    // Setup test database
    await pool.execute('DELETE FROM bookings WHERE id > 0');
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking successfully', async () => {
      const bookingData = {
        from: 'الرياض',
        to: 'جدة',
        departure: '2024-03-15',
        return: '2024-03-20',
        passengers: 2,
        class: 'economy',
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '+966-50-123-4567',
        special_requests: 'مقعد بجانب النافذة'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.booking).toHaveProperty('id');
      expect(response.body.booking.from).toBe(bookingData.from);
      expect(response.body.booking.to).toBe(bookingData.to);
    });

    it('should return 400 for invalid booking data', async () => {
      const invalidData = {
        from: '',
        to: 'جدة',
        departure: '2024-03-15'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });

    it('should return 400 for invalid date format', async () => {
      const bookingData = {
        from: 'الرياض',
        to: 'جدة',
        departure: 'invalid-date',
        passengers: 1,
        class: 'economy',
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '+966-50-123-4567'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings', () => {
    it('should return all bookings', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.bookings)).toBe(true);
    });

    it('should return bookings by status', async () => {
      const response = await request(app)
        .get('/api/bookings?status=pending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.bookings)).toBe(true);
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should return a specific booking', async () => {
      // First create a booking
      const bookingData = {
        from: 'الرياض',
        to: 'دبي',
        departure: '2024-04-01',
        passengers: 1,
        class: 'business',
        name: 'سارة أحمد',
        email: 'sara@example.com',
        phone: '+966-50-987-6543'
      };

      const createResponse = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      const bookingId = createResponse.body.booking.id;

      const response = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.booking.id).toBe(bookingId);
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await request(app)
        .get('/api/bookings/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/bookings/:id', () => {
    it('should update a booking successfully', async () => {
      // First create a booking
      const bookingData = {
        from: 'الرياض',
        to: 'لندن',
        departure: '2024-05-01',
        passengers: 3,
        class: 'economy',
        name: 'خالد علي',
        email: 'khalid@example.com',
        phone: '+966-50-111-2222'
      };

      const createResponse = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      const bookingId = createResponse.body.booking.id;

      const updateData = {
        status: 'confirmed',
        special_requests: 'وجبات خاصة'
      };

      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.booking.status).toBe('confirmed');
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should delete a booking successfully', async () => {
      // First create a booking
      const bookingData = {
        from: 'الرياض',
        to: 'باريس',
        departure: '2024-06-01',
        passengers: 2,
        class: 'first',
        name: 'فاطمة محمد',
        email: 'fatima@example.com',
        phone: '+966-50-333-4444'
      };

      const createResponse = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      const bookingId = createResponse.body.booking.id;

      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify booking is deleted
      const getResponse = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .expect(404);
    });
  });

  describe('GET /api/bookings/stats', () => {
    it('should return booking statistics', async () => {
      const response = await request(app)
        .get('/api/bookings/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toHaveProperty('total');
      expect(response.body.stats).toHaveProperty('pending');
      expect(response.body.stats).toHaveProperty('confirmed');
      expect(response.body.stats).toHaveProperty('cancelled');
    });
  });
}); 