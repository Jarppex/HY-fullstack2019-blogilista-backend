const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {

    if (blogs.length === 0) {
        return 0
    }
    return blogs.reduce(((allLikes, blog) => allLikes + blog.likes), 0)
}

const favoriteBlog = (blogs) => {

    if (blogs.length === 0) {
        return undefined
    }
    return blogs.reduce((previous, current) => {
        return previous.likes > current.likes ? previous : current
    })
}
  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
  }