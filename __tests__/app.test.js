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

describe('4: /api/reviews', () => {
    test('GET: 200 - responds with reviews array of review objects, with correct properties', () => {
        return request(app)
            .get('/api/reviews')
            .expect(200)
            .then(({body}) => {
                expect(body.reviews.length).toBe(13);
                body.reviews.forEach((review) => {
                    expect(review).toMatchObject({
                        owner: expect.any(String),
                        title: expect.any(String),
                        review_id: expect.any(Number),
                        category: expect.any(String),
                        review_img_url: expect.any(String),
                        created_at: expect.any(String),
                        votes: expect.any(Number),
                        designer: expect.any(String),
                        comment_count: expect.any(String)
                    });
                });
            });
    });
    test('GET: 200 - produces a reviews array sorted by date in descending order', () => {
        return request(app)
            .get('/api/reviews')
            .expect(200)
            .then(({body}) => {
                expect(body.reviews).toBeSortedBy('created_at', {descending: true});
            });
    });
});

describe('5: /api/reviews/:review_id', () => {
    test('GET: 200 - responds with review object with correct properties', () => {
        return request(app)
            .get('/api/reviews/1')
            .expect(200)
            .then(({body}) => {
                expect(body.review).toMatchObject({
                    review_id: 1,
                    title: expect.any(String),
                    review_body: expect.any(String),
                    designer: expect.any(String),
                    review_img_url: expect.any(String),
                    votes: expect.any(Number),
                    category: expect.any(String),
                    owner: expect.any(String),
                    created_at: expect.any(String)
                });
            });
    });
    test('GET: 404 - review_id is valid but does not exist', () => {
        return request(app)
            .get('/api/reviews/1000')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('review_id not found');
            });
    });
    test('GET: 400 - review_id is invalid', () => {
        return request(app)
            .get('/api/reviews/somethingbad')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('invalid user input');
            });
    });
});