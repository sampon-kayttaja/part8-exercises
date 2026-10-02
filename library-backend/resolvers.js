const { GraphQLError } = require('graphql')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const resolvers = {
  Query: {
    bookCount: async() => await Book.countDocuments(),
    authorCount: async() => await Author.countDocuments(),
    allAuthors: async() => await Author.find({}),
    allBooks: async (root, args) => {
      const filter = {}
      if (args.genre) {
        filter.genres = args.genre
      }
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (!author) return []
        filter.author = author._id
      }

      const books = await Book.find(filter).populate('author')
      return books
    },
    me: (root, args, context) => {
      return context.currentUser
    },
  },
  Author: {
    bookCount: async (root) => await Book.countDocuments({ author: root._id }),
  },
  Mutation: {
    addAuthor: async (root, args) => {
      const author = new Author({ ...args })
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Error adding author', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.name, error },
        })
      }
      return author
    },
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      let author = await Author.findOne({ name: args.author })
      if (!author) {
        author = new Author({ name: args.author })
        if (author.name.length < 4) {
          throw new GraphQLError('Author name must be at least 4 characters long', {
            extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.name },
          })
        }
        try {
          await author.save()
        } catch (error) {
          throw new GraphQLError('Error adding book and author', {
            extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.title, error },
          })
        }
      }

      const book = new Book({ ...args, author: author._id })
      if (book.title.length < 4) {
        throw new GraphQLError('Book title must be at least 4 characters long', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.title },
        })
      }
      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError('Error adding book', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.title, error },
        })
      }
      return await book.populate('author')
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      const author = await Author.findOne({ name: args.name })
      if (!author) return null
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Error updating author', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.name, error },
        })
      }
      return author
    },
    createUser: async (root, args) => {
      if (args.password.length < 3) {
        throw new GraphQLError('Password must be at least 3 characters long', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: 'password' },
        })
      }
      const passwordHash = await bcrypt.hash(args.password, 10)
      const user = new User({
        username: args.username, 
        passwordHash,
        favoriteGenre: args.favoriteGenre
      })

      return await user.save()
        .catch(error => {
          throw new GraphQLError(`Creating the user failed: ${error.message}`, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(args.password, user.passwordHash)

      if (!(user && passwordCorrect)) {
        throw new GraphQLError('Invalid username or password', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }
      
      const userForToken = {
        username: user.username,
        id: user._id,
      }
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
    _resetDatabase: async () => {
      if (process.env.NODE_ENV !== 'test') {
        throw new GraphQLError('Database reset is only allowed in test environment', {
          extensions: { code: 'FORBIDDEN' },
        })
      }
      await Book.deleteMany({})
      await Author.deleteMany({})
      await User.deleteMany({})
      return true
    }
  },
}

module.exports = resolvers
