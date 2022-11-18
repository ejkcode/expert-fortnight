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
    test('GET: 200 - produces a reviews array sorted by date in descending order (by default when no query given)', () => {
        return request(app)
            .get('/api/reviews')
            .expect(200)
            .then(({body}) => {
                expect(body.reviews).toBeSortedBy('created_at', {descending: true});
            });
    });
    describe('11: /api/reviews queries', () => {
        test('GET: 200 - when given category query returns reviews array only from that category', () => {
            return request(app)
                .get('/api/reviews?category=social deduction')
                .expect(200)
                .then(({body}) => {
                    expect(body.reviews.length).toBe(11)
                    body.reviews.forEach((review) => {
                        expect(review.category).toBe('social deduction');
                    });
                });
        });
        test('GET: 200 - returns empty array when given category that has no reviews associated with it', () => {
            return request(app)
                .get('/api/reviews?category=children`s games')
                .expect(200)
                .then(({body}) => {
                    expect(body.reviews.length).toBe(0);
                });
        });
        test('GET: 200 - if no category is given, defaults to returning all reviews', () => {
            return request(app)
                .get('/api/reviews')
                .expect(200)
                .then(({body}) => {
                    expect(body.reviews.length).toBe(13);
                });
        });
        test('GET: 200 - when given sort by query, returns reviews array sorted by this value', () => {
            return request(app)
                .get('/api/reviews?sort_by=designer')
                .expect(200)
                .then(({body}) => {
                    expect(body.reviews).toBeSortedBy('designer', {descending: true});
                });
        });
        test('GET: 200 - when given an order, reviews array is ordered by this value', () => {
            return request(app)
                .get('/api/reviews?order=ASC')
                .expect(200)
                .then(({body}) => {
                    expect(body.reviews).toBeSortedBy('created_at', {descending: false})
                });
        });
        test('GET: 404 - category given does not exist, not equal to any in the categories table', () => {
            return request(app)
                .get('/api/reviews?category=banana')
                .expect(404)
                .then(({body}) => {
                    expect(body.msg).toBe('category not found');
                });
        });
        test('GET: 400 - sort by given not valid, not equal to any column in reviews table', () => {
            return request(app)
                .get('/api/reviews?sort_by=somethingbad')
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe('invalid sort query');
                });
        });
        test('GET: 400 - order given not valid, not equal to ASC or DESC', () => {
            return request(app)
                .get('/api/reviews?order=stuff')
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe('invalid sort query');
                });
        });
        test('GET: 200 - works for multiple queries on same request', () => {
            return request(app)
                .get('/api/reviews?category=social deduction&sort_by=votes&order=ASC')
                .expect(200)
                .then(({body}) => {
                    expect(body.reviews.length).toBe(11);
                    body.reviews.forEach((review) => {
                        expect(review.category).toBe('social deduction');
                    });
                    expect(body.reviews).toBeSortedBy('votes', {descending:false});
                });
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
    describe('10: /api/reviews/:review_id (comment count)', () => {
        test('GET: 200 - review response object includes a comment_count property: total count of all comments with this review_id', () => {
            return request(app)
                .get('/api/reviews/2')
                .expect(200)
                .then(({body}) => {
                    expect(body.review.comment_count).toBe('3');
                })
        });
    });
});

describe('6: /api/reviews/:review_id/comments', () => {
    test('GET: 200 - responds with array of comments for given review_id, each with correct properties', () => {
        return request(app)
            .get('/api/reviews/2/comments')
            .expect(200)
            .then(({body}) => {
                expect(body.comments.length).toBe(3);
                body.comments.forEach((comment) => {
                    expect(comment).toMatchObject({
                        comment_id: expect.any(Number),
                        votes: expect.any(Number),
                        created_at: expect.any(String),
                        author: expect.any(String),
                        review_id: 2
                    });
                });
            });

    });
    test('GET: 200 - array of comments ordered with most recent comments first', () => {
        return request(app)
            .get('/api/reviews/2/comments')
            .expect(200)
            .then(({body}) => {
                expect(body.comments).toBeSortedBy('created_at', {descending: true});
            });
    });
    test('GET: 200 - responds with empty array when given review_id which is valid but has no associated comments', () => {
        return request(app)
            .get('/api/reviews/5/comments')
            .expect(200)
            .then(({body}) => {
                expect(body.comments.length).toBe(0);
                expect(body.comments).toEqual([]);
            });
    });
    test('GET: 400 - invalid review_id given', () => {
        return request(app)
            .get('/api/reviews/apple/comments')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('invalid user input');
            });
    });
    test('GET: 404 - valid review_id but non-existent', () => {
        return request(app)
            .get('/api/reviews/1000/comments')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('review_id not found');
            });
    });
});

describe('7: /api/reviews/:review_id/comments', () => {
    test('POST: 201 - responds with posted comment when given request body containing object with username and body properties', () => {
        const newComment = {
            username: 'bainesface',
            body: 'I thought this game was awesome!'
        };
        return request(app)
            .post('/api/reviews/1/comments')
            .send(newComment)
            .expect(201)
            .then(({body}) => {
                expect(body.comment).toMatchObject({
                    body: 'I thought this game was awesome!',
                    author: 'bainesface',
                    review_id: 1,
                    created_at: expect.any(String),
                    votes: 0
                });
            });
    });
    test('POST: 400 - review_id given is invalid', () => {
        const newComment = {
            username: 'bainesface',
            body: 'I thought this game was awesome!'
        };
        return request(app)
            .post('/api/reviews/banana/comments')
            .send(newComment)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('invalid user input');
            });
    });
    test('POST: 400 - missing username or body in request body, `bad request`', () => {
        const newComment = {body: 'It was alright'};
        return request(app)
            .post('/api/reviews/1/comments')
            .send(newComment)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('missing username and/or body properties in request body');
            });
    });
    test('POST: 404 - review_id is valid but non-existent, review_id not found', () => {
        const newComment = {
            username: 'dav3rid',
            body: 'I liked it'
        };
        return request(app)
            .post('/api/reviews/1000/comments')
            .send(newComment)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('review_id not found');
            });
    });
    test('POST: 400 - username given is not found in users table', () => {
        const newComment = {
            username: 'badUser',
            body: 'I really liked it'
        };
        return  request(app)
            .post('/api/reviews/3/comments')
            .send(newComment)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('user not found');
            });
    });
});

describe('8: /api/reviews/:review_id', () => {
    test('PATCH: 200 - given review_id, update review object votes property by given number, leaving other properties unchanged', () => {
        const updateVotes = {inc_votes: 4};
        return request(app)
            .patch('/api/reviews/1')
            .send(updateVotes)
            .expect(200)
            .then(({body}) => {
                expect(body.updated_review).toMatchObject({
                    review_id: 1,
                    title: 'Agricola',
                    designer: 'Uwe Rosenberg',
                    owner: 'mallionaire',
                    review_img_url:
                    'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                    review_body: 'Farmyard fun!',
                    category: 'euro game',
                    created_at: "2021-01-18T10:00:20.514Z",
                    votes: 5
                });
            });
    });
    test('PATCH: 200 - updates review object votes property when given number is negative', () => {
        const updateVotes = {inc_votes: -2};
        return request(app)
            .patch('/api/reviews/2')
            .send(updateVotes)
            .expect(200)
            .then(({body}) => {
                expect(body.updated_review).toMatchObject({
                    review_id: 2,
                    title: 'Jenga',
                    designer: 'Leslie Scott',
                    owner: 'philippaclaire9',
                    review_img_url:
                    'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                    review_body: 'Fiddly fun for all the family',
                    category: 'dexterity',
                    created_at: "2021-01-18T10:01:41.251Z",
                    votes: 3
                })
            })
    })
    test('PATCH: 200 - sets votes = 0 when result of updating number of votes gives a negative number', () => {
        const updateVotes = {inc_votes: -10};
        return request(app)
            .patch('/api/reviews/1')
            .send(updateVotes)
            .expect(200)
            .then(({body}) => {
                expect(body.updated_review).toMatchObject({
                    review_id: 1,
                    title: 'Agricola',
                    designer: 'Uwe Rosenberg',
                    owner: 'mallionaire',
                    review_img_url:
                    'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                    review_body: 'Farmyard fun!',
                    category: 'euro game',
                    created_at: "2021-01-18T10:00:20.514Z",
                    votes: 0
                })
            })
    })
    test('PATCH: 400 - invalid review_id given', () => {
        const updateVotes = {inc_votes: 4};
        return request(app)
            .patch('/api/reviews/apple')
            .send(updateVotes)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('invalid user input');
            });
    });
    test('PATCH: 404 - review_id valid but non-existent, id not found', () => {
        const updateVotes = {inc_votes: 4};
        return request(app)
            .patch('/api/reviews/1000')
            .send(updateVotes)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('review_id not found');
            });
    });
    test('PATCH: 400 - invalid inc_votes in request body (non-number)', () => {
        const updateVotes = {inc_votes: 'banana'};
        return request(app)
            .patch('/api/reviews/2')
            .send(updateVotes)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('invalid user input')
            })
    })
});

describe('9: /api/users', () => {
    test('GET: 200 - returns array of objects, each with a username, name and avatar_url property', () => {
        return request(app)
            .get('/api/users')
            .expect(200)
            .then(({body}) => {
                expect(body.users.length).toBe(4)
                body.users.forEach((user) => {
                    expect(user).toMatchObject({
                        username: expect.any(String),
                        name: expect.any(String),
                        avatar_url: expect.any(String)
                    });
                });
            });
    });
});