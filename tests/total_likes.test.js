const { test, describe } = require('node:test')
const assert = require('node:assert')
const { totalLikes } = require('../utils/list_helper')

describe('total likes', () => {
    test('of empty list is zero', () => {
        const blogs = []
        const result = totalLikes(blogs)
        assert.strictEqual(result, 0)
    })

    test('when list has only one blog equals the likes of that', () => {
        const blogs = [
            {
                title: "First blog",
                author: "Author 1",
                url: "http://example.com",
                likes: 5
            }
        ]
        const result = totalLikes(blogs)
        assert.strictEqual(result, 5)
    })

    test('of a bigger list is calculated right', () => {
        const blogs = [
            {
                title: "First blog",
                author: "Author 1",
                url: "http://example.com",
                likes: 5
            },
            {
                title: "Second blog",
                author: "Author 2",
                url: "http://example2.com",
                likes: 10
            },
            {
                title: "Third blog",
                author: "Author 3",
                url: "http://example3.com",
                likes: 7
            }
        ]
        const result = totalLikes(blogs)
        assert.strictEqual(result, 22)
    })
})
