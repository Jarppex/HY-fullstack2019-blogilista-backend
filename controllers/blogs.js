const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog
      .find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
  } catch(exception) {
    next(exception)
  }
})

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
      response.json(blog)
    } else {
      response.status(404).end()
    }
  } catch(exception) {
    next(exception)
  }
})

blogsRouter.post('/', async (request, response, next) => {
  if (!request.body.likes) {
    request.body.likes = 0
  }
  if (!request.body.title || !request.body.url) {
    return response.status(400).json({ error: 'content missing' })
  }
  const token = request.get('authorization')
  //console.log('Tokeni on ===', token)
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    //console.log('Dekoodattu tokeni on ===', decodedToken)
    if (!token || !decodedToken.id) {
      //console.log('Ei löytyny tokeneita...')
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    let user
    if (request.body.user) {
      user = await User.findById(request.body.user)
      //console.log('found user by ID:', user)
    }
    const blog = new Blog(request.body)
    const savedBlog = await blog.save()
    //console.log('savedBlog:', savedBlog)
    if (user) {
      user.blogs = user.blogs.concat(savedBlog._id)
      await user.save()
      //console.log('user:', user)
    }
    response.status(201).json(savedBlog)
  } catch(exception) {
    next(exception)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    const token = request.get('authorization')
    //console.log('Tokeni on ===', token)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    //console.log('Dekoodattu tokeni on ===', decodedToken)
    if (!token || !decodedToken.id) {
      //console.log('Ei löytyny tokeneita...')
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }
  try {
    const savedBlog = await Blog
      .findByIdAndUpdate(request.params.id, blog, { new: true })
    response.status(200).json(savedBlog.toJSON())
  } catch (exception) {
    next(exception)
  }
})

module.exports = blogsRouter