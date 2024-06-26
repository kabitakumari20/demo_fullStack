const { User } = require("../modules/user/model/user.model");


const { msg } = require("../../config/message"),

    { errorHandler } = require("../helpers/errorHandling.helper");


//User authentication
exports.authenticate = async (req, res, next) => {
    try {
        const auth = req.header("Authorization");
        console.log("auth=========>>", auth)
        if (!auth) throw message.msg.unauthorisedRequest;
        const token = auth.substr(auth.indexOf(" ") + 1);
        // console.log('hii');
        const user = await User.findByToken(token, res);
        console.log("user========>>", user)
        req.user = user;
        if (!user) throw message.msg.unauthorisedRequest;
        return next();
    } catch (err) {
        const error = errorHandler(err, 401);
        return res.status(error.status).send(error);
    }
};

// exports.adminAuthenticate = async (req, res, next) => {
//     try {
//         const auth = req.header("Authorization");
//         console.log("Authorization header==========>>", auth);
//         if (!auth) throw message.msg.unauthorisedRequest;

//         const token = auth.split(" ")[1]; // Extract token after 'Bearer'
//         const user = await User.findByTokenAndRole(token, 'Admin');

//         req.user = user;
//         if (!user) throw message.msg.unauthorisedRequest;

//         return next();
//     } catch (err) {
//         console.error('Authentication error:', err);
//         const error = errorHandler(err, 401);
//         return res.status(error.status).send(error);
//     }
// };

// student authentication
exports.studentAuthenticate = async (req, res, next) => {
    try {
        const auth = req.header("Authorization");
        if (!auth) throw message.msg.unauthorisedRequest;
        const token = auth.substr(auth.indexOf(" ") + 1);
        const student = await User.findByToken(token, res);
        if (!student) throw message.msg.unauthorisedRequest;
        req.student = student;
        // console.log(student);
        return next();
    } catch (err) {
        console.log(err);
        const error = errorHandler(err, 401);
        return res.status(error.status).send(error);
    }
}




exports.teacherAuthenticate = async (req, res, next) => {
    try {
        const auth = req.header("Authorization");
        if (!auth) throw message.msg.unauthorisedRequest;
        const token = auth.substr(auth.indexOf(" ") + 1);
        const teacher = await User.findByToken(token, res);
        if (!teacher) throw message.msg.unauthorisedRequest;
        req.teacher = teacher;
        return next();
    } catch (err) {
        const error = errorHandler(err, 401);
        return res.status(error.status).send(error);
    }
}




exports.parentAuthenticate = async (req, res, next) => {
    try {
        const auth = req.header("Authorization");
        if (!auth) throw message.msg.unauthorisedRequest;

        const token = auth.substr(auth.indexOf(" ") + 1);
        console.log("token=========>>", token);

        const user = await User.findByToken(token, res);
        // const user = await User.findOne({})
        // user = await User.findOne({ 'fatherInfo.email': body.email });


        console.log("user=======>>", user);

        // if (!user) {
        //   throw message.msg.unauthorisedRequest;
        // }

        // Check if the token matches either fatherInfo or motherInfo
        if (user.fatherInfo && user.fatherInfo.token === token) {
            req.parentInfo = user.fatherInfo;
        } else if (user.motherInfo && user.motherInfo.token === token) {
            req.parentInfo = user.motherInfo;
        } else {
            throw message.msg.unauthorisedRequest;
        }

        console.log("req.parentInfo=======>>", req.parentInfo);
        return next();
    } catch (err) {
        const error = errorHandler(err, 401);
        return res.status(error.status).send(error);
    }
};

