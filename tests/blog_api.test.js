const mongoose = require('mongoose')
const supertest = require('supertest')
//const helper = require('./test_helper') //KESKEN
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

/*
test('a valid note can be added ', async () => { //KESKEN
  const newNote = {
    content: 'async/await yksinkertaistaa asynkronisten funktioiden kutsua',
    important: true,
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const notesAtEnd = await helper.notesInDb()
  expect(notesAtEnd.length).toBe(helper.initialNotes.length + 1)

  const contents = notesAtEnd.map(n => n.content)
  expect(contents).toContain(
    'async/await yksinkertaistaa asynkronisten funktioiden kutsua'
  )
})

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