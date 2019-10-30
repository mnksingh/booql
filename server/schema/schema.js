const graphql = require("graphql");
const Book = require("../models/book");
const Author = require("../models/author");
const _ = require("lodash");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const BookType = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
    author: {
      type: AuthorType,
      resolve: (parent, args) => Author.findById(parent.authorId)
    }
  })
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    books: {
      type: new GraphQLList(BookType),
      resolve: (parent, args) => Book.find({ authorId: parent.id })
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    book: {
      type: BookType,
      args: { id: { type: GraphQLID } },
      resolve: (parent, args) => Book.findById(args.id)
    },
    author: {
      type: AuthorType,
      args: { id: { type: GraphQLID } },
      resolve: (parent, args) => Author.findById(args.id)
    },
    books: {
      type: new GraphQLList(BookType),
      resolve: (parent, args) => Book.find({})
    },
    authors: {
      type: new GraphQLList(AuthorType),
      resolve: (parent, args) => Author.find({})
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createAuthor: {
      type: AuthorType,
      args: {
        name: { type: GraphQLString },
        age: { type: GraphQLInt }
      },
      resolve: (parent, args) =>
        new Author({ name: args.name, age: args.age }).save()
    },
    updateAuthor: {
      type: AuthorType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt }
      },
      resolve: async (parent, args) => {
        const { id, ...body } = args;

        const author = await Author.findById(id);

        author.set(body);

        return author.save();
      }
    },
    deleteAuthor: {
      type: AuthorType,
      args: { id: { type: GraphQLID } },
      resolve: (parent, args) => Author.findByIdAndDelete(args.id)
    },
    createBook: {
      type: BookType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: (parent, args) =>
        new Book({
          name: args.name,
          genre: args.genre,
          authorId: args.authorId
        }).save()
    },
    updateBook: {
      type: BookType,
      args: {
        id: { type: GraphQLID },
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: async (parent, args) => {
        const { id, ...body } = args;

        const book = await Book.findById(id);

        book.set(body);

        return book.save();
      }
    },
    deleteBook: {
      type: BookType,
      args: { id: { type: GraphQLID } },
      resolve: (parent, args) => Book.findByIdAndDelete(args.id)
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
