/*This file acts as the application's backbone, bringing together all components
and establishing the request processing pipeline. It's crucial for maintaining a
well-structured and maintainable Express application. We uses require statements to bring
in both built-in modules and custom modules from different files in the project.*/

const config = require('./utils/config')
// Imports Express.js framework and creates a new Express application instance.
const express = require('express')
require('express-async-errors')
const app = express()
// Imports CORS middleware to enable cross-origin requests between different domains.
const cors = require('cors')
// Imports route handlers for notes and users from their respective controller files.
// In these files we have defined blogsRouter, usersRouter and loginRouter as express.Router()
// objects.
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
// Imports our custom middleware functions for logging, handling unknown endpoints, and error handling.
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
// Imports mongoose library for interacting with MongoDB databases
const mongoose = require('mongoose')
// Configures mongoose to use less strict query filtering
mongoose.set('strictQuery', false)
// Logs a message using our logger utility when the application connects to our MongoDB database.
logger.info('connecting to', config.MONGODB_URI)
/*establishes a connection to MongoDB (a database) using mongoose.
 When the connection succeeds, it logs a success message; if it fails,
  it logs an error message. This connection allows the app to store and retrieve data. */
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })
// Uses the middleware cors to handle requests from different domains
app.use(cors())
// Helps the app understand JSON data sent in requests
app.use(express.json())
// Uses the middleware logger to log incoming requests
app.use(middleware.requestLogger)
// Uses the middleware tokenExtractor to extract and verify JWT tokens from requests
app.use(middleware.tokenExtractor)
// This is where we can actually use the router object we created in the controller files
/*here are three main routes:
// It tells Express to use the loginRouter to handle any requests that
// come to the '/api/login' URL path. When users try to log in to the application,
// their requests will be directed to this route, where the loginRouter (defined in controllers/login.js)
// will process the login credentials and authenticate users.
/api/blogs handles all requests related to blogs using blogsRouter
/api/users handles all requests related to users using usersRouter */
app.use('/api/login', loginRouter)
app.use('/api/blogs',middleware.userExtractor, blogsRouter)
app.use('/api/users', usersRouter)

// Here we make use of our two error handling middleware functions
app.use(middleware.unknownEndpoint) //handles requests to non existent routes
app.use(middleware.errorHandler)    // processes any errors that occur during request handling

// When another file wants to use this configured app (with all its middleware, routes, and
// database connections), they can import it using require(). This is particularly useful for
// separating the app configuration from the actual server startup code.
module.exports = app