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
  const user = new User(
    { username: "root", password: "sekret" })
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
    const newUser = {
      "username": "Tarmo",
      "password": "salis123"
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    //console.log('Käyttäjä lisätty!! =', newUser)
    const loggedInUser = await api
      .post('/api/login')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    //console.log('Käyttäjän sisäänkirjautuminen onnistui!! =', loggedInUser.body)

    const allUsers = await helper.usersInDb()
    const userToPostBlog = allUsers.find(user => {
      return user.username === loggedInUser.body.username
    })
    //console.log('Blogin lisäävä käyttäjä on ==', userToPostBlog)

    const newBlog = {
      "title": "Perunateatterit",
      "author": "Helena",
      "url": "www.perunateatterit.fi",
      "likes": 9,
      "user": userToPostBlog.id
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set({ Authorization: loggedInUser.body.token })
      .expect(201)
      .expect('Content-Type', /application\/json/)
    //console.log('Käyttäjä lisäsi blogin!! =', newBlog)

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
    const newUser = {
      "username": "Tarmo",
      "password": "salis123"
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    //console.log('Käyttäjä lisätty!! =', newUser)
    const loggedInUser = await api
      .post('/api/login')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    //console.log('Käyttäjän sisäänkirjautuminen onnistui!! =', loggedInUser.body)

    const allUsers = await helper.usersInDb()
    const userToPostBlog = allUsers.find(user => {
      return user.username === loggedInUser.body.username
    })
    //console.log('Blogin lisäävä käyttäjä on ==', userToPostBlog)

    const newBlog = {
      "title": "Unpopular blog",
      "author": "Nobody",
      "url": "www.nothingtoseehere.com",
      "user": userToPostBlog.id
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set({ Authorization: loggedInUser.body.token })
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
    const newUser = {
      "username": "Tarmo",
      "password": "salis123"
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    //console.log('Käyttäjä lisätty!! =', newUser)
    const loggedInUser = await api
      .post('/api/login')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    //console.log('Käyttäjän sisäänkirjautuminen onnistui!! =', loggedInUser.body)

    const allUsers = await helper.usersInDb()
    const userToPostBlog = allUsers.find(user => {
      return user.username === loggedInUser.body.username
    })
    //console.log('Blogin lisäävä käyttäjä on ==', userToPostBlog)

    const newBlogs = [
      {
        "author": "Nobody",
        "user": userToPostBlog.id
      },
      {
        "author": "Nobody",
        "url": "www.nothingtoseehere2.com",
        "user": userToPostBlog.id
      },
      {
        "title": "Unpopular blog3",
        "author": "Nobody",
        "likes": 2,
        "user": userToPostBlog.id
      }
    ]
    await api
      .post('/api/blogs')
      .send(newBlogs[0])
      .set({ Authorization: loggedInUser.body.token })
      .expect(400)
    await api
      .post('/api/blogs')
      .send(newBlogs[1])
      .set({ Authorization: loggedInUser.body.token })
      .expect(400)
    await api
      .post('/api/blogs')
      .send(newBlogs[2])
      .set({ Authorization: loggedInUser.body.token })
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(testData.blogs.length)
  })
})

describe('DELETE: a specific blog', () => {

  test('a blog can be deleted', async () => {
    const newUser = {
      "username": "Tarmo",
      "password": "salis123"
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    //console.log('Käyttäjä lisätty!! =', newUser)
    const loggedInUser = await api
      .post('/api/login')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    //console.log('Käyttäjän sisäänkirjautuminen onnistui!! =', loggedInUser.body)

    const allUsers = await helper.usersInDb()
    const userToPostBlog = allUsers.find(user => {
      return user.username === loggedInUser.body.username
    })
    //console.log('Blogin lisäävä käyttäjä on ==', userToPostBlog)

    const newBlog = {
      "title": "Perunateatterit",
      "author": "Helena",
      "url": "www.perunateatterit.fi",
      "likes": 9,
      "user": userToPostBlog.id
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set({ Authorization: loggedInUser.body.token })
      .expect(201)
      .expect('Content-Type', /application\/json/)
    //console.log('Käyttäjä lisäsi blogin!! =', newBlog)

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart.find(blog => {
      return blog.title === newBlog.title
    })
    //console.log('Blogia ollaan poistamassa!! =', blogToDelete)

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)
    //console.log('Ei onnistunut!! =', blogToDelete)
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({ Authorization: loggedInUser.body.token })
      .expect(204)
    //console.log('Nyt onnistui!! =', blogToDelete)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(blogsAtStart.length - 1)

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