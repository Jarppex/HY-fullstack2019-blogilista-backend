const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog
      .find({})
      .populate('user', { username: 1, name: 1 })
    response.json(blogs)
  } catch(exception) {
    next(exception)
  }
})

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog
      .findById(request.params.id)
      .populate('user', { username: 1, name: 1 })
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
  const body = request.body
  if (!body.likes) {
    body.likes = 0
  }
  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'content missing' })
  }
  let token = request.get('authorization')
  //console.log('Tokeni on ===', token)
  if (!token) {
    token = body.token
    //console.log('Tokeni on ===', token)
  }
  //console.log('Tokeni on ===', token)
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    //console.log('Dekoodattu tokeni on ===', decodedToken)
    if (!token || !decodedToken.id) {
      //console.log('Ei löytyny tokeneita...')
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    //let user
    if (body.user) {
      const user = await User.findById(request.body.user)
      if (user) {
        const blog = new Blog(body)
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        response.status(201).json(savedBlog)
      }
      //if (!user && request.body.user.id) {
      //user = await User.findById(request.body.user.id)
      /*
        const allUsers = await Blog.find({})
        user = allUsers.find(user => {
          return user.username === body.user.username
        })*/
    }
    //console.log('found user by ID:', user)
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
    likes: body.likes,
    user: body.user
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