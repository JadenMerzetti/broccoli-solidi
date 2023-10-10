const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return await User.findOne(
          { _id: context.user._id },
          { __v: 0, password: 0 }
        );
      } 
      throw new AuthenticationError('You need to log in...');
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
        const user = await User.create(args);

        const token = signToken(user);
        
        return { token, user };
    },

    login: async (parent, args) => {
      try {
        const { username, email, password } = args;
        const user = await User.findOne({ $or: [{ username }, { email }] });

        if (!user) {
          throw new Error("User not found");
        }

        const correctPass = await user.isCorrectPassword(password);

        if (!correctPass) {
          throw new Error('Incorrect password');
        }

        const token = signToken(user);

        return { token, user };
      } catch (err) {
        throw new Error(err.message);
      }
    },

    saveBook: async (parent, args, context) => {
      const { book } = args;
      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: book } },
        { new: true, runValidators: true }
      ).populate('savedBooks');

        return updatedUser;
    },  

    removeBook: async (parent, args, context) => {
      const { bookId } = args;
      const { user } = context;
    
      try {
        const foundUser = await User.findById(user._id);
  
        if (!foundUser) {
          throw new AuthenticationError('User not found');
        }
    
        foundUser.savedBooks = foundUser.savedBooks.filter(
          (book) => book.bookId !== bookId
        );
    
        await foundUser.save();
    
        return foundUser;
      } catch (err) {
        throw new ApolloError('Failed to remove book', 'INTERNAL_SERVER_ERROR');
      }
    }


  },
};

module.exports = resolvers;