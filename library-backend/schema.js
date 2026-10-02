const typeDefs = /* GraphQL */ `
  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type Book {
    title: String!
    published: Int
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int
    authorCount: Int
    allAuthors: [Author]!
    allBooks(author: String, genre: String): [Book]!
    me: User
  }

  type Mutation {
    addAuthor(
      name: String!
      born: Int
    ): Author!
    addBook(
      title: String!
      published: Int
      author: String!
      genres: [String!]!
    ): Book!
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
    _resetDatabase: Boolean
  }
`

module.exports = typeDefs