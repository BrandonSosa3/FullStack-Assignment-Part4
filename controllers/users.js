// This imports the bcrypt library, which is a powerful tool for password hashing.
// Bcrypt is specifically designed to keep passwords secure by converting them into a complex
// string that can't be reversed back to the original password.
const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
// This imports the User model that defines the structure for user data in the database.
const User = require('../models/user')

// This sets up a POST route handler. When someone sends data to create a new user, this code will run.
// It's async because it performs operations that take time (like database access).
usersRouter.post('/', async (request, response) => {
  // This extracts username, name, and password from the request body using object destructuring.
  const { username, name, password } = request.body
  // This sets how complex the password hashing will be.
  //  A "salt" is random data that bcrypt adds to make each hash unique.
  // The number 10 means bcrypt will put the password through 2^10 rounds of processing, making it very hard to crack.
  const saltRounds = 10
  /*This is where bcrypt does its magic. It:

Generates a random salt
Combines it with the password
Runs it through multiple rounds of cryptographic operations
Produces a secure hash that looks like: "$2b$10$X9tPMIP16F/Y3Y6xYT12e.UFf" */
  const passwordHash = await bcrypt.hash(password, saltRounds)

  // Creates a new User object with the provided username, name, and the hashed password.
  const user = new User({
    username,
    name,
    passwordHash,
  })
  // Saves the new user to the database and waits for the operation to complete.
  const savedUser = await user.save()
  // Sends back a success response (201 = Created) with the saved user data in JSON format.
  response.status(201).json(savedUser)
})

// This is a route handler for fetching all users from the database.
usersRouter.get('/', async (request, response) => {
  // First, it uses the User model (which represents users in the database) to find all users by calling User.find({}).
  // The empty object {} means "find all users" with no filtering.
  // The populate('blogs') part is interesting - it tells the database to also include information about each user's blog,
  // specifically getting the url, title, author and id fields from those blogs.
  // Second, after getting the users and their blogs from the database, it sends this information back to whoever made
  // the request in JSON format using response.json(users).
  const users = await User
    .find({}).populate('blogs', { url: 1, title: 1, author: 1, id: 1 })
  response.json(users)
})

module.exports = usersRouter