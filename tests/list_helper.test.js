const testData = require('../utils/test_blog_data')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {

    test('of empty list is zero', () => {
        const result = listHelper.totalLikes(testData.listWithNoBlogs)
        expect(result).toBe(0)
    })

    test('when list has only one blog equals the likes of that', () => {
      const result = listHelper.totalLikes(testData.listWithOneBlog)
      expect(result).toBe(5)
    })

    test('of a bigger list is calculated right', () => {
        const result = listHelper.totalLikes(testData.blogs)
        expect(result).toBe(36)
    })
})

describe('favorite blog', () => {

    test('of empty list is undefined', () => {
        const result = listHelper.favoriteBlog(testData.listWithNoBlogs)
        expect(result).toEqual(undefined)
    })

    test('when list has only one blog is that one', () => {
      const result = listHelper.favoriteBlog(testData.listWithOneBlog)
      expect(result).toEqual(testData.listWithOneBlog[0])
    })

    test('of a bigger list is one with most likes', () => {
        const result = listHelper.favoriteBlog(testData.blogs)
        expect(result).toEqual(testData.blogs[2])
    })
})