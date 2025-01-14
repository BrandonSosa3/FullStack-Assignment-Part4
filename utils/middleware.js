const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

// THESE FUNCTIONS ARE MIDDLEWARE MEANING:
// they sit between the incoming request and your main application code.

// This is a custom middleware function that acts like a diary keeper for the web app.
// Whenever someone makes a request to our server, this middleware function logs
// the HTTP method (like GET or POST) and the url path (like /api/notes) of the request.
// And any data they are sending (the body). After logging this information, it calls the next middleware function in the chain
// using "next()"
const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

// The custom middleware is like a bouncer that handles lost visitors. When someone tries to access
// a url route that does not exist in our application, this function sends back a 404 status code
// meaning "not found" along with a simple error message saying "unknown endpoint".
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


// This custom middleware function is like a problme solver that catches different types
// of errors and responds appropriately. It takes four parameters: the error itself, the request,
// , the response, and the next function. When an error occurs it first logs the error message,
// then it uses the if logic to check what kind of error it is.

// Note on difference between 400, 404, and 500:
// The 400 status code effectively tells the client
// "Hey, there's something wrong with your request - please fix your data and try again."
// It's different from a 404 (Not Found) or 500 (Server Error) because it specifically
// indicates that the problem is with the request data itself, not with finding the resource or server issues.
const errorHandler = (error, request, response, next) => {
  logger.error(error.message)
  // If it's a "CastError" (usually means someone used an invalid ID format), it sends back a 400 status with "malformatted id"
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  // If it's a "ValidationError" (happens when data doesn't meet requirements), it sends back the specific error message
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  // If it's a "MongoServerError" about duplicate keys (trying to create a username that already exists), it sends back an
  // appropriate message If the error doesn't match any of these cases, it passes the error to the next error handler.
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }
  next(error)
}

// This function helps get an auth token from incoming requests
// When a req comes in, it looks for something called "authorization" in the request headers.
// If it finds one that starts with "Bearer", it removes the "Bearer" part and saves just the token part
// into the request object. If there is no "authorization" header or if it doesn't start with "Bearer",
// it sets the token to null. This makes the token easily accessible to other parts of the app.
const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  } else {
    request.token = null
  }
  next()
}

// This function works with the token we got from the above function. It takes that token and
// verifies it using a secret key stored in process.env.SECRET. If the token is valid, and contains
// a valid user ID, it looks up the full user info from the database using the ID. Then it attaches
// the found user info to the request object. This way, any part of the app that needs the user's info
const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (decodedToken.id) {
    request.user = await User.findById(decodedToken.id)
  }
  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}

