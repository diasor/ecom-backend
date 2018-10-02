const request = require('supertest');
const expect = require('expect');

const { app } = require('./../app');
const { cart } = require('./../models/cart');

describe('POST /cart', () => {
  it('should create a new cart with a new element', (done) => {
    request(app)
      .post('/cart')
      .send({})
      .expect(200)
      .expect((res) => {
        expect(res.body).toBe();
      })
      .end((error, res) => {
        if (error) {
          return done(error);
        }

        
      });
  });
});
