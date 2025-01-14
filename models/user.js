/*In this file we are creating user to be used elsewhere*/

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  name: String,
  passwordHash: {
    type: String,
    required: true,
    minlength: 3,
  },
  // specifies that the user field will store a MongoDB ObjectId
  // ObjectId is a special type of identifier used by MongDB to uniquely identify each document
  // ref: 'Blog' tells MongoDB that this ObjectId refers to a document in the 'Blog' collection
  // This creates a relationship between the user and blog
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ]
})

// This code is responsible for how user data gets converted to JSON when sending it back in API responses
// The code sets up a special transformation rule using toJSON that automatically runs whenever a user
// object needs to be converted to JSON format. It takes two inputs: the original document (which contains
// all the user data from the database) and a returnedObject (which will be the final JSON output).
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})


module.exports = mongoose.model('User', userSchema)
