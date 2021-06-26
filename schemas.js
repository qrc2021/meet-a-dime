const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
exports.getModels = function () {
  const UsersSchema = new mongoose.Schema({
    Login: {
      type: String,
      required: true,
    },
    Password: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
  })

  const CardsSchema = new mongoose.Schema({
    Card: {
      type: String,
      required: true,
    },
    UserId: {
      type: String,
      required: true,
    },
  })

  UsersSchema.pre('save', function (next) {
    if (!this.isModified('Password')) {
      return next()
    } else {
      hash = bcrypt.hash(this.Password, 10, (err, hash) => {
        if (err) {
          return next(err)
        } else this.Password = hash
        next()
      })
    }
  })

  const Users = mongoose.model('Users', UsersSchema, 'Users')
  const Cards = mongoose.model('Cards', CardsSchema, 'Cards')

  return { Users: Users, Cards: Cards }
}
