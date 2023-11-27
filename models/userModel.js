const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: { type: String, default: null, required: true },
  last_name: { type: String, default: null, required: true },
  profile: { type: String, default: null },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    user: { type: Number },
    employee: { type: Number },
    admin: { type: Number },
  },
  refreshToken: [String],
});

module.exports = mongoose.model("User", userSchema);
