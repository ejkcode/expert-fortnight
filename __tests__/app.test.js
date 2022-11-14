const request = require('supertest');
const app = require('../app.js');
const db = require('../db/connections.js');
const seed = require('../db/seeds/seed.js');
const data = require('../db/data/test-data/index.js');

beforeEach(() => {
    return seed(data);
})

afterAll(() =>{
    return db.end();
})

describe('3: /api/categories', () => {
    test('GET - 200: responds with array of category objects, each with slug and description properties', () => {
        return request(app)
            .get('/api/categories')
            .expect(200)
            .then(({body}) => {
                body.categories.forEach((category) => {
                    expect(category).toMatchObject({
                        slug: expect.any(String),
                        description: expect.any(String),
                    })
                })
            });
    });
});

