const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('../utils/test_helper')
const testData = require('../utils/blogs_testdata')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.remove({})

  for (let blog of testData.blogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

describe('GET', () => {

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
    const contents = response.body.map(r => r.title)
    expect(contents).toContain('React patterns')
  })

  test('a blog has identifying field "id"', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
  })
})

describe('POST', () => {

  test('a valid blog can be added', async () => {
    const newBlog = {
      "title": "Perunateatterit",
      "author": "Helena",
      "url": "www.perunateatterit.fi",
      "likes": 9
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(testData.blogs.length + 1)

    const contents = blogsAtEnd.map(n => n.title)
    expect(contents).toContain(newBlog.title)
  })

  test('blogs undefined "likes" gets default value "0"', async () => {
    const newBlog = {
      "title": "Unpopular blog",
      "author": "Nobody",
      "url": "www.nothingtoseehere.com",
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0)
  })
})
/*
test('note without content is not added', async () => { //KESKEN
  const newNote = {
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400)

  const notesAtEnd = await helper.notesInDb()

  expect(notesAtEnd.length).toBe(helper.initialNotes.length)
})

test('a specific note can be viewed', async () => { //KESKEN
  const notesAtStart = await helper.notesInDb()

  const noteToView = notesAtStart[0]

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(resultNote.body).toEqual(noteToView)
})

test('a note can be deleted', async () => { //KESKEN
  const notesAtStart = await helper.notesInDb()
  const noteToDelete = notesAtStart[0]

  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204)

  const notesAtEnd = await helper.notesInDb()

  expect(notesAtEnd.length).toBe(
    helper.initialNotes.length - 1
  )

  const contents = notesAtEnd.map(r => r.content)

  expect(contents).not.toContain(noteToDelete.content)
})
*/

afterAll(() => {
  mongoose.connection.close()
})