const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
  content: String,
  blog: mongoose.Schema.Types.ObjectId
})

commentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Comment', commentSchema)