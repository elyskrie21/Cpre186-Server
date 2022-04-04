const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  }, 
  update: {
    type: Boolean,
    default: true,
  }
}, {toJSON: {virtuals: true}, toObject: {virtuals: true}});

userSchema.virtual('products', {
  ref: "Product",
  localField: '_id',
  foreignField: 'user',
  justOne: false
})

userSchema.pre("save", function (next) {
  let user = this;

  if (this.isModified("password") || this.isNew) {
    let salt = bcrypt.genSaltSync(10, (err, salt) => {
      if (err) {
        return next(err);
      }
    });
    let hash = bcrypt.hashSync(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
    });
    user.password = hash;
  }
  return next();
});

userSchema.methods.comparePassword = function (passw, cb) {
  let isMatch = bcrypt.compareSync(passw, this.password, (err) => {
    if (err) {
      return cb(err);
    }
  });

  cb(null, isMatch);
};

module.exports = mongoose.model("User", userSchema);
