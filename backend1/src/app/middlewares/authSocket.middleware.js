const jwt = require("jsonwebtoken");
const { User } = require("../modules/user/models/user.model");
exports.AuthSocket =  async function (socket, next) {
  try {
    const token = socket.handshake.headers.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    const decoded = jwt.verify(token, process.env.secret_token);
    console.log("decoded",decoded)
    const user = await User.findOne({
      _id: decoded._id,
    });
    if (!user) {
      throw new Error("User doesn't exist");
    }

    socket.user = user;
    socket.user.id = user._id.toString();
    next();
  } catch (err) {
    console.log(err.message);
    next(new Error("Authentication error"));
  }
}
