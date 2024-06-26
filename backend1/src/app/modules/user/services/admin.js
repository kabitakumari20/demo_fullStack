
const res = require("express/lib/response");
const mongoose = require('mongoose');
let secret = "yrtuytytystyfytdsyy"
const moment = require('moment')
const { msg } = require("../../../../config/message");
const { UserSchema, User, Verification } = require("../model/user.model");
const CryptoJS = require("crypto-js");
const { generateAuthToken } = require("../../../util/generate.token");

let register = async (body) => {
    console.log("body------->", body);
    if (!body.email) throw msg.emailRequired;
    if (!body.password) throw msg.passwordRequired;
    let user = await User.findOne({ email: body.email });
    if (user) throw msg.emailAlreadyExists;
    body.role = "Admin"
    body.active = true;
    body.roleId = 1;
    // const Admin = getAdminModel();
    let password1 = CryptoJS.AES.encrypt(body.password, secret).toString();
    console.log("password1=======>>", password1)

    body.password = password1
    let newAdmin = new User(body);
    let res = await newAdmin.save();
    console.log("res=========>>", res)

    return {
        res: res,
        token: await generateAuthToken(res),
        message: msg.success
    };
};



let login = async (body) => {
    console.log(body)
    if (!body.email) throw msg.invalidEmail;
    if (!body.password) throw msg.passwordRequired;
    let res = await User.findOne({ email: body.email });
    console.log("res=======>>", res)
    if (!res) throw msg.userNotFound;
    if (res.roleId != 1) throw "you are not Authorised to login."
    let ciphertext = CryptoJS.AES.decrypt(res.password, secret).toString(CryptoJS.enc.Utf8);
    console.log("ciphertext", ciphertext);
    if (ciphertext == body.password) {
        let dd = body.rememberMe
        console.log("dd----------", dd)
        let rememberData = await User.findOneAndUpdate({ email: body.email }, { $set: { rememberMe: body.rememberMe } }, { new: true })
        console.log("rememberData----------", rememberData)
        return {
            res: rememberData,
            token: await generateAuthToken(res),
            message: msg.success
        }
    }
    throw msg.incorrectPassword;
}



let getAdminList = async () => {
    let data = await User.find()
    if (!data) return { msg: "ok", count: 0, result: data }
    return {
        msg: "ok",
        count: data.length,
        result: data
    }
}

module.exports = { register, login, getAdminList }