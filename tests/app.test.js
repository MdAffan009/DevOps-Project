const request = require('supertest');
const app = require('../app');


//Signup tests
describe('POST /signup', () => {

  it('should return 200 and success message for valid input', async () => {
    const res = await request(app)
      .post('/signup')
      .send({ username: 'testuser', email: 'test@test.com', password: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Signup successful');
  });

  it('should fail when fields are missing', async () => {
    const res = await request(app)
      .post('/signup')
      .send({ email: 'test@test.com' }); // no username or password

    expect(res.statusCode).toBe(400);
  });

});


//Login Tests
describe('POST /login', () => {

  beforeEach(async () => {
    // Create a user before each login test
    await request(app)
      .post('/signup')
      .send({ username: 'testuser', email: 'login@test.com', password: '123456' });
  });

  it('should return 200 and a token for correct credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'login@test.com', password: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined(); // token exists
  });

  it('should return 400 for wrong password', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'login@test.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Wrong password');
  });

  it('should return 400 for non-existent email', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'nobody@test.com', password: '123456' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('User not found');
  });

});