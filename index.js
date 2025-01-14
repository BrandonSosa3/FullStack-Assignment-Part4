/*Code starts up a web server using Express. It now "listens" for incoming requests
at the port number we give it. */
const app = require('./app')  // the actual Express application
const config = require('./utils/config')  // we require this because this is were we store the port number
const logger = require('./utils/logger')

/*The output is twofold: First, it starts the actual web server, making it ready to handle incoming requests.
Second, it prints out a log message telling us that the server has successfully started, showing which port number it's using. */
app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})