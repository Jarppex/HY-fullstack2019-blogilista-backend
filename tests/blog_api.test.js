const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('../utils/test_helper')
const testData = require('../utils/blogs_testdata')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {

  await User.deleteMany({})
  const user = new User({ username: 'root', password: 'sekret' })
  await user.save()

  await Blog.remove({})
  for (let blog of testData.blogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

describe('GET: blogs', () => {

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(testData.blogs.length)
  })

  test('the first blog is about react patterns', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)
    expect(titles).toContain('React patterns')
  })

  test('a blog has identifying field "id"', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
  })
})

describe('GET: a specific blog', () => {

  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]
    blogToView.id = blogToView.id.toString()

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(blogToView)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    console.log(validNonexistingId)

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('POST: blogs', () => {

  test('a valid blog can be added', async () => {
    const users = await User.find({})
    const userToPostBlog = users[0] // TULEE MUUTTUMAAN

    const newBlog = {
      "title": "Perunateatterit",
      "author": "Helena",
      "url": "www.perunateatterit.fi",
      "likes": 9,
      "user": userToPostBlog._id
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(testData.blogs.length + 1)

    const titles = blogsAtEnd.map(n => n.title)
    expect(titles).toContain(newBlog.title)

    const usersBlog = blogsAtEnd.find(blog => {
      return blog.title === newBlog.title
    })
    expect(usersBlog.user.toString()).toContain(newBlog.user.toString())
  })

  test('blog without likes gets default value 0', async () => {
    const users = await User.find({})
    const userToPostBlog = users[0] // TULEE MUUTTUMAAN

    const newBlog = {
      "title": "Unpopular blog",
      "author": "Nobody",
      "url": "www.nothingtoseehere.com",
      "user": userToPostBlog._id
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0)

    expect(blogsAtEnd.length).toBe(testData.blogs.length + 1)

    const usersBlog = blogsAtEnd.find(blog => {
      return blog.title === newBlog.title
    })
    expect(usersBlog.user.toString()).toContain(newBlog.user.toString())
  })

  test('blog without title or url is not added', async () => {
    const users = await User.find({})
    const userToPostBlog = users[0] // TULEE MUUTTUMAAN

    const newBlogs = [
      {
        "author": "Nobody",
        "user": userToPostBlog._id
      },
      {
        "author": "Nobody",
        "url": "www.nothingtoseehere2.com",
        "user": userToPostBlog._id
      },
      {
        "title": "Unpopular blog3",
        "author": "Nobody",
        "likes": 2,
        "user": userToPostBlog._id
      }
    ]
    await api
      .post('/api/blogs')
      .send(newBlogs[0])
      .expect(400)
    await api
      .post('/api/blogs')
      .send(newBlogs[1])
      .expect(400)
    await api
      .post('/api/blogs')
      .send(newBlogs[2])
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(testData.blogs.length)
  })
})

describe('DELETE: a specific blog', () => {

  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(testData.blogs.length - 1)

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('PUT: a specific blog', () => {

  test('blogs likes can be changed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogTochange = blogsAtStart[0]

    const newBlog = {
      _id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 55,
      __v: 0
    }
    await api
      .put(`/api/blogs/${blogTochange.id}`)
      .send(newBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(testData.blogs.length)
    expect(blogsAtEnd[0].likes).toBe(newBlog.likes)
  })
})

afterAll(() => {
  mongoose.connection.close()
})