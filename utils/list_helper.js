const  _ = require('lodash')

const dummy = (blogs) => {
    return 1
  }


const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
      return null
    }
  
    const favorite = blogs.reduce((max, blog) => {
      return blog.likes > max.likes ? blog : max
    }, blogs[0])
  
    return {
      title: favorite.title,
      author: favorite.author,
      likes: favorite.likes
    }
  }

const mostBlogs = (blogs) =>{
    if (blogs.length === 0) {
        return null
    }

    // _.groupBy creates a new object where the keys are 
    // the author names, and the values are arrays of blogs written by that author.
    const grouped = _.groupBy(blogs, 'author')

    // _.mapValues transforms the values in the grouped object 
    // it takes each array og blogs and returns the length of the array
    const counted = _.mapValues(grouped, (blogs) => blogs.length)

    // Object.entries converties the object into an array of key value pairs
    // _.maxBy finds the entry with the highest count
    // the second argument in maxBy is a function that returns the value to compare
    // so we do not considered the 0th index and look at count in the 1st index
    const topAuthor = _.maxBy(Object.entries(counted), ([, count]) => count)

    // We format the return object with the indexes 0 and 1 from the array we crafted above
    return {
        author: topAuthor[0],
        blogs: topAuthor[1]
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return null
    }

    const grouped = _.groupBy(blogs, 'author')
    const likesCounted = _.mapValues(grouped, (blogs) => _.sumBy(blogs, 'likes'))
    const topAuthor = _.maxBy(Object.entries(likesCounted), ([, count]) => count)

    return {
        author: topAuthor[0],
        likes: topAuthor[1]
    }
}
  

module.exports = {
    dummy, 
    totalLikes, 
    favoriteBlog, 
    mostBlogs, 
    mostLikes
}