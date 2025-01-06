const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

/*app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})*/

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})