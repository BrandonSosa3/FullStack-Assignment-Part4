const { test, after, beforeEach } = require('node:test')
const assert = require('assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./blog_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  for (let note of helper.initialBlogs) {
    let blog = new Blog(note)
    await blog.save()
  }
})

test('4.8 correct amount of blogs returned', async () => {
  const response = await api.get('/api/blogs')
  console.log('Response body:', response.body)
  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('4.9 verify that unique id named id', async () => {
  const response = await api.get('/api/blogs')
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
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.error, 'title or url missing')
})

test('4.13  successful deletion of a blog', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const notesAtEnd = await helper.blogsInDb()
  assert.strictEqual(notesAtEnd.length, blogsAtStart.length - 1)
  const titles = notesAtEnd.map(n => n.title)
  assert(!titles.includes(blogToDelete.title))
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
    .send(updatedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  const updatedBlogInDb = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
  assert.strictEqual(updatedBlogInDb.likes, blogToUpdate.likes + 1)

})

after(async () => {
  await mongoose.connection.close()
})
