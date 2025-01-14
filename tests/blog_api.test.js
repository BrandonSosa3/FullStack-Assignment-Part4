// This is Node.js built in test runner module
// test: function to define individual test cases
// after: function to run cleanup code after all tests complete
// beforeEach: function to run setup code before each test case
// node:test explicitly specifies that this is a Node.js core module
const { test, after, beforeEach } = require('node:test')
// assert is Node.js built in assertion library
// Provides methods like strictEqual(), deepEqual(), etc.
// Essential for verifying expected test outcomes
const assert = require('assert')
// supertest is a popular testing library for HTTP assertions
// Allows testing Express.js APIs without running an actual server.
// Makes it easy to send HTTP requests and verify responses in tests.
const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./blog_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

// Auth token begins as null
let token = null

// This code is a test setup function that prepares a clean testing environment for a blog API.
// It runs before each test case and sets up fresh test data.
beforeEach(async () => {
  // Cleans the database by removing all existing blogs and users. The empty {} means delete everything.
  await Blog.deleteMany({})
  await User.deleteMany({})

  // creates an encrypted verson of the given password "sekret" using bcrypt
  // The number 10 represents the encryption rounds
  const passwordHash = await bcrypt.hash('sekret', 10)
  // Creates a new user with username "root" and the encrypted password
  // Then saves it to the database
  const user = new User({ username: 'root', passwordHash })
  await user.save()
  // makes a login request to the API with the test user credentials
  const response = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
  // stores the auth token recieved from the login response
  token = response.body.token

  // Loops through the initial test blogs, creates new blog objects for each one, adds
  // the user's ID to connect them to the test user, and saves each blog to database
  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog({
      ...blog,
      user: user._id
    })
    await blogObject.save()
  }
})

// Test that verifies if the API returns the right number of blogs.
// Makes GET req to the /api/blogs endpoint with the auth token
// Expects a 200 status code and checks if the response body contains the correct number of blogs
test('4.8 correct amount of blogs returned', async () => {
  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})
// The second test "4.9 verify that unique id named id" checks how the blog's identifier is
// formatted in the API response. It makes the same GET request to fetch blogs, but this time it
// looks at the first blog in the response and verifies two things: 1) that it has an 'id' property,
// and 2) that it doesn't have an '_id' property. This is important because it confirms the API is using
// the standard 'id' format instead of MongoDB's default '_id' format.
test('4.9 verify that unique id named id', async () => {
  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)

  const blog = response.body[0]
  assert(blog.id)
  assert(!blog._id)
})

test('4.10 successful creation of new blog', async () => {
  const newBlog = {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(n => n.title)
  assert(titles.includes('Type wars'))
})

test('4.11 test that verifies if likes property is missing in the request, it will default to the value 0', async () => {
  const newBlog = {
    title: 'Test blog without likes',
    author: 'Test Author',
    url: 'http://testurl.com'
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('4.12 missing title and url properties', async () => {
  const newBlog = {
    author: 'Test Author',
    likes: 5
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.error, 'title or url missing')
})

test('4.13 successful deletion of a blog', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const notesAtEnd = await helper.blogsInDb()
  assert.strictEqual(notesAtEnd.length, blogsAtStart.length - 1)
})



test('4.14 updating individual blog post.' , async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]

  const updatedBlog = {
    ...blogToUpdate,
    likes: blogToUpdate.likes + 1
  }

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updatedBlog)
    .expect(200)
})


test('4.23 adding a blog fails with status code 401 if token is not provided', async () => {
  const newBlog = {
    title: 'Test blog without token',
    author: 'Test Author',
    url: 'http://testurl.com',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

after(async () => {
  await mongoose.connection.close()
})



