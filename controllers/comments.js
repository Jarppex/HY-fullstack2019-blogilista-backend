const commentsRouter = require('express').Router()
const Comment = require('../models/comment')

commentsRouter.get('/', async (request, response) => {
  const comments = await Comment.find({})
  response.json(comments.map(c => c.toJSON()))
})

commentsRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body

    if (!body.content) {
      return response.status(400).json({ error: 'content is missing' })
    }
    if (body.content.length < 3) {
      return response.status(400).json({ error: 'comment is too short (mininum length: 3)' })
    }

    const comment = new Comment({
      content: body.content,
      blog: body.blog
    })

    const savedComment = await comment.save()

    response.status(200).json(savedComment)
  } catch (exception) {
    next(exception)
  }
})

module.exports = commentsRouter