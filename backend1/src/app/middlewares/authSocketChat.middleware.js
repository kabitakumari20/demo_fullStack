const jwt = require("jsonwebtoken");
const { User } = require("../modules/user/models/user.model");
const { ChatContact } = require("../modules/ChatApp/models/contact")
exports.AuthSocketChat = async function (socket, next) {
    try {
        const token = socket.handshake.headers.token;
        const chatApp = socket.handshake.query.chatApp
        if (!token) {
            return next(new Error("Authentication error"));
        }
        const decoded = jwt.verify(token, process.env.secret_token);
        const user = await User.findOne({
            _id: decoded._id,
        });
        if (!user) {
            throw new Error("User doesn't exist");
        }

        let email;
        if(user.fatherInfo.email) email = user.fatherInfo.email
        else email = user.motherInfo.email

        if (chatApp && chatApp == 'parent') {
            let chatData = await ChatContact.findOne({
                email: email,
                isParent: true,
                schoolId: user.school
            })
            if (!chatData) {
                let name;
                if (user.fatherInfo.name) name = user.fatherInfo.name
                else name = user.motherInfo.name
                chatData = await ChatContact.create({
                    userId: user._id,
                    email: email,
                    isParent: true,
                    schoolId: user.school,
                    name: name,
                    profile: user.profileImages
                })
            }
            socket.chatData = chatData
            socket.chatData.id = chatData._id.toString()
        } else {
            let chatData = await ChatContact.findOne({
                userId: user._id,
                isParent: false,
                schoolId: user.school
            })
            if (!chatData) {
                chatData = await ChatContact.create({
                    userId: user._id,
                    schoolId: user.school,
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`
                })
            }
            socket.chatData = chatData
            socket.chatData.id = chatData._id.toString()
        }

        socket.user = user;
        socket.user.id = user._id.toString();
        next();
    } catch (err) {
        next(new Error("Authentication error"));
    }
}
