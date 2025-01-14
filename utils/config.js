/* The handling of environment variables is extracted into a separate utils/config.js file: */

// IT IS IMPORTANT THAT dotenv is imported before the "blog" model
// is imported. This ensures that the environment variables from
// the .env file are loaded before the model is used.
require('dotenv').config()

// The environment variables are accessed using process.env.VAR_NAME.
// The PORT variable is used to specify the port number the application should listen on.
const PORT = process.env.PORT

/*  The interesting part is how it handles the database connection string (MONGODB_URI).
It uses a conditional (ternary) operator to make a choice: if the application is running in 'test'
mode (NODE_ENV === 'test'), it uses one database connection (TEST_MONGODB_URI), but otherwise,
 it uses the regular database connection (MONGODB_URI). This is helpful because you often want to use a
 different database when testing versus normal operation.*/
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

// The other parts of the application can access the environment variables by importing the configuration module
module.exports = {
  MONGODB_URI,
  PORT
}