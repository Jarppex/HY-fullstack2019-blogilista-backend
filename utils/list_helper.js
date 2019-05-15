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

const mostBlogs = (blogs) => {

    if (blogs.length === 0) {
        return undefined
    }
    return blogs
        .reduce((previous, current) => {

            const sameAuthor = blog => blog.author === current.author
            const author = previous.find(sameAuthor)

            if (previous.length === 0 || author === undefined) {
                previous.push({author: current.author, blogs: 1})
            }
            else {
                author.blogs += 1
            }
            return previous
        }, [])
        .reduce((previous, current) => {
            return previous.blogs > current.blogs ? previous : current
        })
}
  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
  }