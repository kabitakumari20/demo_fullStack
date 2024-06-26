const jwt = require("jsonwebtoken");
let secret_token = "yrtuytytystyfytdsyy"
// For generating jwt auth token
exports.generateAuthToken = user => {
    return new Promise((resolve, reject) => {
        let token = jwt.sign({ _id: user._id.toString() }, secret_token);
        resolve(token);
    });
};


exports.generateAuthTokenForParent1 = user => {
    return new Promise((resolve, reject) => {
        let token = jwt.sign({ _id: user._id.toString() }, secret_token);
        resolve(token);
    });
};




exports.generateAuthTokenForParent = user => {
    return new Promise((resolve, reject) => {
        console.log("user======inside the generateAuthTokenForParent======", user)
        // if (!user || (!user.motherInfo && !user.fatherInfo)) {
        if (!user) {

            reject(new Error('user not found'));
            return;
        }

        let payload = {
            email: user.motherInfo?.email || user.fatherInfo?.email,
            // role: 'Parent'
        };

        let token = jwt.sign(payload, secret_token);
        resolve(token);
    });
};


