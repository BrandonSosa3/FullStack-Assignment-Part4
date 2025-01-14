// This first line creates a special tool called a router by using Express.js's Router functionality.
// Think of this router as a traffic controller for web requests. It will help direct
// it will help direct different blog-related requests (like creating new blogs, reading blogs,
// updating blogs) to the right place in your application.
const blogsRouter = require('express').Router()
// The second line imports a Blog model from a separate file.
const Blog = require('../models/blog')

// This is a route for retrieving all blog posts.
// The handler uses async/await to work with the database asynchronously.
// It queries the database using Blog.find({}), where the empty object {} means
// "find all blogs without any filters". The populate() method is used to enhance
// the blog data by including user information - specifically the username, name,
// and ID of the user who created each blog.
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1, id: 1 })
  // The response.json(blogs) line converts the blogs data into JSON format and sends it to whoever made the request.
  response.json(blogs)
})

// Route handler for creating a new blog post
// For inputs, it takes a request that must contain a blog title and URL in its body.
// It can optionally include an author and number of likes. It also needs a user object that
// represents who is creating the blog post.
blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const user = request.user

  // Exit with a 400 status code if the request body doesn't contain a title or URL.
  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'title or url missing' })
  }

  // Creation of a new Blog object with the provided info. If no likes are given it defaults to 0.
  // The blog is linked to the user by storing the user's ID in the blog's user field.
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })
  // new blog saved to the database
  const savedBlog = await blog.save()
  // the blogs Id is added the user's array of blogs, this is done to keep track of which blogs belong to which user.
  user.blogs = user.blogs.concat(savedBlog._id)
  // The user's updated information is saved to the database.
  await user.save()
  // The saved blog is sent back to the client as a JSON response.
  response.status(201).json(savedBlog)
})

// This is a route handler for deleting a blog post.
// The code takes two inputs: 1) the ID of the blog post to
// delete (from the URL parameter), and 2) the user information
// (from the request object) who is trying to delete the blog.
// When someone tries to delete a blog the following steps occur:
blogsRouter.delete('/:id', async (request, response) => {
  const user = request.user
  // 1. First, it looks up the blog post in the database using the provided ID
  const blog = await Blog.findById(request.params.id)
  // 2. If no blog is found with that ID, it tells the user "Blog not found" with a 404 status code
  if (!blog) {
    return response.status(404).json({ message: 'Blog not found' })
  }
  // 3. If a blog is found, it checks if the person trying to delete it is actually the owner of the blog
  if (blog.user.toString() !== user.id.toString()) {
    return response.status(401).json({ message: 'You do not have permission to delete this blog' })
  }
  // 4. If the user is the owner, it deletes the blog post from the database
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).json({ message: 'Blog was successfully deleted' })
})


blogsRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatedBlog => {
      response.json(updatedBlog)
    })
    .catch(error => next(error))
})


module.exports = blogsRouter