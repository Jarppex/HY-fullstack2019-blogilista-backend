const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({})
    response.json(blogs)
  } catch(exception) {
    next(exception)
  }
})

blogsRouter.post('/', async (request, response, next) => {
  console.log(request.body.likes)
  if (request.body.likes === undefined) {
    request.body.likes = 0
    console.log(request.body.likes)
  }
  const blog = new Blog(request.body)
  try {
    const result = await blog.save()
    response.status(201).json(result)
  } catch(exception) {
    next(exception)
  }
})

/*
blogsRouter.get('/:id', async (request, response, next) => { //KESKEN
  try{
    const note = await Blog.findById(request.params.id)
    if (note) {
      response.json(note.toJSON())
    } else {
      response.status(404).end()
    }
  } catch(exception) {
    next(exception)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => { //KESKEN
  try {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
})
*/

module.exports = blogsRouter