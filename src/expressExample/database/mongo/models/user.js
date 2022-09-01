const { model, Schema } = require('mongoose')

const UserSchema = new Schema(
  {
    id: {
      required: true,
      type: String,
      unique: true
    },
    name: {
      required: true,
      type: String
    },
    lastName: {
      required: true,
      type: String
    },
    email: {
      required: true,
      type: String
    },
    salt: {
      required: true,
      type: String
    },
    hash: {
      required: true,
      type: String
    },
    role: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'roles'
    },
    articleId: {
      required: false,
      type: Schema.Types.ObjectId,
      ref: 'articles'
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toObject: {
      transform: (_, ret) => {
        delete ret._id
      }
    }
  }
)

const UserModel = model('users', UserSchema)

module.exports = UserModel
