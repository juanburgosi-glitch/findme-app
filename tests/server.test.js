const request = require('supertest');
const app = require('../server');

describe('API Tests', () => {
    test('GET /api/people should require authentication', async () => {
        const response = await request(app).get('/api/people');
        expect(response.statusCode).toBe(401);
    });

    // Añadir más tests aquí
});
