// Imported for creating login tokens
const jwt = require('jsonwebtoken')
// Imported for hashing passwords
const bcrypt = require('bcrypt')
// Imported for creating a router object
const loginRouter = require('express').Router()
// Imported for accessing the user model
const User = require('../models/user')

// Defines the route for handling login requests
// The following steps occur whe somone tries to log in:
loginRouter.post('/', async (request, response) => {
  // 1. we destructure the request body to get the username and password
  const { username, password } = request.body
  // 2. we take the username and look for a matching user from the database
  const user = await User.findOne({ username })
  // 3. If no user found (user === null), passwordCorrect is false
  // If user exists, compares provided password with stored hash
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  // 4. Now we check if either the user does not exist or the password is incorrect
  // If either of these are true, we return a 401 Unauthorized response
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }
  // 5. Now we take the users username and id and create a token for the user
  // This object contains just the essential info to id the user later
  const userForToken = {
    username: user.username,
    id: user._id,
  }

  // token expires in 60*60 seconds, that is, in one hour
  // 6. Next it creates a special auth token using the jwt.sign().
  // This token is like a secure digital pass that proves the user is logged in.
  // The token is created using three things: the user information we packaged earlier,
  // a secret key stored in process.env.SECRET, and an expiration time of one hour (60*60 seconds).
  // Think of it like creating a temporary ID card that expires after an hour.
  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: 60*60 }
  )
  // 7. Finally, the code sends a response back to whoever requested the login. The response has a status code of 200
  // (meaning everything went well) and includes three pieces of information:
  // The authentication token it just created
  // The user's username
  // The user's name
  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter