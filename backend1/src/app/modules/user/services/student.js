
const res = require("express/lib/response");
const mongoose = require('mongoose');
let secret = "yrtuytytystyfytdsyy"

const moment = require('moment')
const { msg } = require("../../../../config/message");

const { User } = require("../model/user.model");
const CryptoJS = require("crypto-js");

const registerStudentByAdmin = async (user, body) => {
    // console.log("body------->", body);
    if (!body.email) throw new Error(msg.emailRequired);
    if (!body.password) throw new Error(msg.passwordRequired);
    let findUser = await User.findOne({ email: body.email });
    // console.log("findUser==========>>", findUser);
    if (findUser) return { msg: emailAlreadyExists };
    body.active = true;
    body.role = "Student";
    body.roleId = 0;
    let password1 = CryptoJS.AES.encrypt(body.password, secret).toString();
    // console.log("password1=======>>", password1)
    body.password = password1
    let newStudent = new User(body);
    // console.log("newStudent==============>>", newStudent);
    let res = await newStudent.save();
    // console.log("res==========>>", res);
    return {
        message: msg.success,
        res: res
        // token: token,
    };

};


let getStudentList = async (user) => {
    let data = await User.find({ roleId: 0 })
    if (!data) return { msg: "ok", count: 0, result: data }
    return {
        msg: "ok",
        count: data.length,
        result: data
    }
}

const getStudentById = async (user, id) => {
    let findStudent = await User.findById(id)
    if (!findStudent) throw "student not found"
    return {
        msg: "student found successfully",
        result: findStudent
    }
}

const updateStudentById = async (user, id, body) => {
    let findStudent = await User.findByIdAndUpdate(id, { $set: body }, { new: true })
    if (!findStudent) throw "Student not found"
    return {
        msg: "student updated successfully",
        result: findStudent
    }
}

const deleteStudentById = async (user, id) => {
    let findStudent = await User.findByIdAndDelete(id)
    if (!findStudent) throw "student not found"
    return {
        msg: "student deleteed successfully",
        result: findStudent
    }
}



const searchStudentByAdmin = async (data) => {
    // const isValidObjectId = mongoose.Types.ObjectId.isValid(data.key);

    const searchCriteria = [
        { roleId: 0, "firstName": { $regex: data.key, $options: "i" } },
        { roleId: 0, "lastName": { $regex: data.key, $options: "i" } },
        { roleId: 0, "phone": { $regex: data.key, $options: "i" } },
        { roleId: 0, "email": { $regex: data.key, $options: "i" } },
        { roleId: 0, "address.city": { $regex: data.key, $options: "i" } },
        { roleId: 0, "address.state": { $regex: data.key, $options: "i" } },
    ];

    // If the key is a valid ObjectId, add the _id search to the criteria
    const keyAsNumber = Number(data.key);
    if (!isNaN(keyAsNumber)) {
        searchCriteria.push({ roleId: 0, school: user.school, _id: keyAsNumber });
    }

    let ress = await User.find({
        $or: searchCriteria
    }, "firstName lastName email phone address profile document role roleId motherInfo fatherInfo class section").lean();

    if (!ress.length) {
        return { msg: 'Student does not exist', result: [] }
    } else {
        return {
            msg: msg.success,
            count: ress.length,
            result: ress
        };
    }
};


module.exports = {
    registerStudentByAdmin,
    getStudentList,
    getStudentById,
    updateStudentById,
    deleteStudentById,
    searchStudentByAdmin
}