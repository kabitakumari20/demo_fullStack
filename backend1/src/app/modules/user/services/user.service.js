const res = require("express/lib/response");
const moment = require('moment')
const { msg } = require("../../../../config/message");

const { UserSchema, User, Verification } = require("../model/user.model");
const CryptoJS = require("crypto-js");
const { generateAuthToken } = require("../../util/generate.token");
const getAdminModel = () => {
    return mongoose.model('Admin', User.schema, 'admin');
};
let PASSWORD_FOR_TEACHER = Math.floor(1000 + Math.random() * 99999999).toString();
let sendOTP = async (data) => {
    let OTP = Math.floor(1000 + Math.random() * 999).toString();
    let user = await User.findOne({ email: data.email, isEmailVerified: true });
    if (user) throw msg.duplicateEmail;
    let user1 = await User.findOne({ email: data.email, isEmailVerified: false });
    if (user1) {
        let abc = await sendEmailForOTP(data.email, OTP, "resend", data.firstName);
        if (abc) {
            let otptxt = CryptoJS.AES.encrypt(
                OTP,
                process.env.secret_key
            ).toString();
            console.log('otp', OTP);
            let newDate = new Date();
            let u = await User.findOneAndUpdate({ email: data.email }, { $set: { otp: otptxt, otpDate: newDate } }, { new: true });
            if (!u) throw msg.NotExist;
            return {
                result: msg.success,
            };
        }
    }

    let updateUserdb;
    if (data.email) {
        let abc = await sendEmailForOTP(data.email, OTP, "verify", data.firstName);
        if (abc) {
            let ciphertext = CryptoJS.AES.encrypt(
                OTP,
                process.env.secret_key
            ).toString();
            console.log('otp', OTP);
            let newDate = new Date();
            let body = {
                "email": data.email,
                "otpDate": newDate,
                "otp": ciphertext
            }
            var u = new User(body);
            // console.log(u);

            updateUserdb = await u.save();
            if (updateUserdb) {
                return {
                    result: msg.success,
                };
            }
        }
    }
};

let sendOTPForForgotPassword = async (data) => {
    if (!data.email) throw msg.emailRequired;
    let user = await User.findOne({ email: data.email, isEmailVerified: false });
    if (user) {
        let OTP = Math.floor(1000 + Math.random() * 999).toString();
        let abc = await sendEmailForOTP(data.email, OTP, "resend", " Dear User");
        if (abc) {
            let otptxt = CryptoJS.AES.encrypt(
                OTP,
                process.env.secret_key
            ).toString();
            console.log('otp', OTP);
            let newDate = new Date();
            let u = await User.findOneAndUpdate({ email: data.email }, { $set: { otp: otptxt, otpDate: newDate } }, { new: true });
            if (!u) throw msg.NotExist;
            return {
                result: msg.success,
            };
        }
    }
    else {
        throw "email does not exist"
    }
}

let sendEmailForOTP = async (email, otp, type, name) => {
    try {
        let emailData = {
            toEmail: email,
            Type: type,
            Name: name,
            OTP: otp,
        };
        if (type == "resend") {
            let data = await sendOtp(emailData);
            return data;
        } else {
            const data = await sendOtp(emailData);
            return data;
        }
    } catch (e) {
        console.log(e);
    }
};



let emailVerify = async (data) => {
    if (!data.otp) throw msg.requiredOtp;
    if (!data.email) throw msg.invalidEmail;
    let user = await User.findOne({ email: data.email });
    if (!user) throw msg.UsernotExist;
    let date1 = user.otpDate;
    let date1Time = date1.getTime();
    let date2 = new Date();
    let date2Time = date2.getTime();
    let minutes = (date2Time - date1Time) / (1000 * 60);
    if (minutes > 2) throw msg.expireOtp;

    let ciphertext = CryptoJS.AES.decrypt(
        user.otp,
        process.env.secret_key
    ).toString(CryptoJS.enc.Utf8);

    if (ciphertext == data.otp) {
        let res = await User.findByIdAndUpdate(user._id, { $set: { isEmailVerified: true } });
        return {
            message: msg.success
        };
    } else throw msg.incorrectOTP;
};


let register = async (body) => {
    console.log("body------->", body)
    if (!body.email) throw msg.emailRequired
    if (!body.password) throw msg.passwordRequired
    let user = await User.findOne({ email: body.email });
    if (!user) throw msg.invalidEmail;
    body.active = true;
    delete body.email;

    let password1 = CryptoJS.AES.encrypt(body.password, secret).toString();
    console.log("password1=======>>", password1)
    body.password = password1;
    body.roleId = 2;
    let res = await User.findByIdAndUpdate(user._id, { $set: body }, { new: true });
    return {
        res: res,
        token: await generateAuthToken(res),
        message: msg.success
    };
}



let updateAccount = async (user, body) => {
    if (user.roleId > 3 && user.roleId < 1) throw msg.actionForbidden;
    let res = await User.findByIdAndUpdate(user._id, { $set: body }, { new: true });
    if (!res) throw msg.userNotFound;
    return {
        result: res
    }
}


let login = async (body) => {
    console.log(body)
    if (!body.email) throw msg.invalidEmail;
    if (!body.password) throw msg.passwordRequired;
    let res = await User.findOne({ email: body.email });
    console.log("res=======>>", res)
    if (!res) throw msg.userNotFound;
    if (res.roleId != 1) throw "you are not Authorised to login."
    let ciphertext = CryptoJS.AES.decrypt(res.password, process.env.secret_key).toString(CryptoJS.enc.Utf8);
    console.log("ciphertext", ciphertext);
    if (ciphertext == body.password) {



        if (body.rememberMe === true) {
            let dd = body.rememberMe
            console.log("dd----------", dd)
            let rememberData = await User.findOneAndUpdate({ email: body.email }, { $set: { rememberMe: body.rememberMe } }, { new: true })
            console.log("rememberData----------", rememberData)
            // Set a long-lived cookie or store the user's ID in local storage for future logins
            // Example: Set a cookie with the user's ID
            // setCookie('rememberedUserID', res.id, { expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) });
            return {
                res: rememberData,
                token: await generateAuthToken(res),
                message: msg.success
            }
        } else {
            let dd = body.rememberMe
            let rememberData = await User.findOneAndUpdate({ email: body.email }, { $set: { rememberMe: dd } }, { new: true })
            return {
                res: rememberData,
                token: await generateAuthToken(res),
                message: msg.success
            }
        }

        // return {
        //   res: res,
        //   token: await generateAuthToken(res),
        //   message: msg.success
        // }
    }
    throw msg.incorrectPassword;
}

// let login = async (body) => {
//   console.log(body);
//   if (!body.email) throw msg.invalidEmail;
//   if (!body.password) throw msg.passwordRequired;
//   let res = await User.findOne({ email: body.email });
//   if (!res) throw msg.userNotFound;
//   let ciphertext = CryptoJS.AES.decrypt(res.password, process.env.secret_key).toString(CryptoJS.enc.Utf8);
//   console.log("ciphertext", ciphertext);
//   if (ciphertext == body.password) {
//     // Check if rememberMe option is enabled
//     // let rememberMe = body.rememberMe || false;

//     if (body.rememberMe === true) {
//       let dd = body.rememberMe
//       console.log("dd----------", dd)
//       let rememberData = await User.findOneAndUpdate({ email: body.email }, { $set: { rememberMe: body.rememberMe } }, { new: true })
//       console.log("rememberData----------", rememberData)
//       // Set a long-lived cookie or store the user's ID in local storage for future logins
//       // Example: Set a cookie with the user's ID
//       // setCookie('rememberedUserID', res.id, { expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) });
//       return {
//         res: rememberData,
//         message: msg.success
//       };
//     } else {
//       let dd = body.rememberMe
//       let rememberData = await User.findOneAndUpdate({ email: body.email }, { $set: { rememberMe: dd } }, { new: true })
//     }


//     // return {
//     //   res: res,
//     //   message: msg.success
//     // };
//   }
//   throw msg.incorrectPassword;
// };

let randomNumber = Math.floor(1000 + Math.random() * 99999999).toString();

const registerTeacher = async (user, body, files) => {
    if (user.roleId > 3 && user.roleId < 1) throw msg.actionForbidden;
    let data = {}
    if (body.roleId == 1 || body.roleId == 2) throw "you have not authorized to add these roles"

    // var f = Object.keys(files).map((a) => { return [a, files[a][0].key] });
    // f.forEach(a => {
    //   if (a[0] == "profile") {
    //     data.profile = a[1];
    //   } else if (a[0] == "certificate") {
    //     data.certificate = a[1];
    //   }
    //   else if (a[0] == "document") {
    //     data.document = a[1]
    //   }
    // });


    body.document = {};

    delete body.docNumber
    delete body.docType;

    // body.profile = body.profile;

    // body.roleId = 3;
    // body.role = 'Teacher'

    if (!body.email) throw msg.emailRequired;
    let school = await School.findOne({ registeredBy: user._id });
    if (!school) throw msg.noshoolregisterd;
    body.school = school._id;
    body.active = true;
    body.role = "Teacher"
    const fatherinfo = {
        name: body.fatherInfo.name,
        phone: body.fatherInfo.phone,
        occupation: body.fatherInfo.occupation,
        email: body.fatherInfo.email,
        password: body.fatherInfo.password,
        income: body.fatherInfo.income,
        motherTongue: body.fatherInfo.motherTongue,
        bloodGroup: body.fatherInfo.bloodGroup,
        docType: body.fatherInfo.docType
    }
    const motherinfo = {
        name: body.motherInfo.name,
        phone: body.motherInfo.phone,
        occupation: body.motherInfo.occupation,
        email: body.motherInfo.email,
        password: body.motherInfo.password,
        income: body.motherInfo.income,
        motherTongue: body.motherInfo.motherTongue,
        bloodGroup: body.motherInfo.bloodGroup,
        docType: body.motherInfo.docType,
        // address: body.motherInfo.address
    }


    const professionalDetails = {
        totalExperince: body.ProfessionalDetails.totalExperince,
        acadmicQualification: body.ProfessionalDetails.acadmicQualification,
        specilityIn: body.ProfessionalDetails.specilityIn,
        classId: body.ProfessionalDetails.classId,
        className: body.ProfessionalDetails.className,
        certificate: body.ProfessionalDetails.certificate,
        hightsQualification: body.ProfessionalDetails.hightsQualification,
        lastSalary: body.ProfessionalDetails.lastSalary,
        currentCTC: body.ProfessionalDetails.currentCTC,
        previousOrg: body.ProfessionalDetails.previousOrg,
        previousOrgNumber: body.ProfessionalDetails.previousOrgNumber,

    }


    // return professionalDetails
    // const schoolDeatils = {
    //   // schooleName: body.SchoolDetails.schooleName,
    //   schoolId: body.school,
    //   principaleName: body.SchoolDetails.principaleName,
    //   schoolContactNum: body.SchoolDetails.schoolContactNum,
    //   schollAddress: body.SchoolDetails.schollAddress,
    // }

    let result = await User.findOne({ email: body.email });
    if (result) throw msg.duplicateEmail;
    let ciphertext = CryptoJS.AES.encrypt(
        PASSWORD_FOR_TEACHER,
        process.env.secret_key
    ).toString();
    body.password = ciphertext;

    if (files.profileImage) body.profileImage = files.profileImage[0].key
    // if (files.profile) body.profile = files.profile[0].key

    if (files.certificate) body.certificate = files.certificate[0].key
    if (files.documents) body.documents = files.documents[0].key



    if (files['tenthMarksheetURL']) {
        body['document']['tenthMarksheetURL'] = files['tenthMarksheetURL'][0].key;
    }
    if (files['twelthMarksheetURL']) {
        body['document']['twelthMarksheetURL'] = files['twelthMarksheetURL'][0].key;
    } if (files['studentIdentityDocURL']) {
        body['document']['studentIdentityDocURL'] = files['studentIdentityDocURL'][0].key;
    } if (files['birthCertificateURL']) {
        body['document']['birthCertificateURL'] = files['birthCertificateURL'][0].key;
    } if (files['medicalCertificateURL']) {
        body['document']['medicalCertificateURL'] = files['medicalCertificateURL'][0].key;
    } if (files['admitcardURL']) {
        body['document']['admitcardURL'] = files['admitcardURL'][0].key;
    } if (files['migrationCertificateURL']) {
        body['document']['migrationCertificateURL'] = files['migrationCertificateURL'][0].key;
    } if (files['reportCardURL']) {
        body['document']['reportCardURL'] = files['reportCardURL'][0].key;
    } if (files['extraCurricularCertifcateURL']) {
        body['document']['extraCurricularCertifcateURL'] = files['extraCurricularCertifcateURL'][0].key;
    } if (files['profileImageURL']) {
        body['document']['profileImageURL'] = files['profileImageURL'][0].key;
    }





    body.fatherInfo = fatherinfo
    body.motherInfo = motherinfo
    // body.document = documents
    body.ProfessionalDetails = professionalDetails
    // body.SchoolDetails = schoolDeatils
    let r = new User(body);

    let res = await r.save();
    if (!res) throw msg.NotCreated;


    // Notify with Email 
    let text = 'Welcome To S2S Please Login Your Account id: ' + res.email + ' Password: ' + PASSWORD_FOR_TEACHER + ' Thankyou.'
    let dataformail = {
        toEmail: body.email,
        password: PASSWORD_FOR_TEACHER,
        text: text
    }
    // console.log('test',text);
    let responseOfMail = await sendEmail(dataformail);
    return {
        personalDetails: res
    }
}



let updateUserProfile = async (user, body) => {
    if (user.roleId == 1 || user.roleId == 2) {
        let foundUser = await User.findByIdAndUpdate({ _id: user._id }, { $set: body }, { new: true })
        if (!foundUser) throw msg.NotExist

        let schoolObj = {
            schoolName: body.schoolName,
            phone: body.schoolPhoneNo,
            email: body.schoolEmail,
            regNumber: body.schoolRegNumber,
            active: body.schoolActiveStatus,
            address: body.schoolAddress,
            board: body.schoolBoard,
            department: body.schoolDepartment,
            website: body.website,
            registeredBy: body.schoolRegisteredBy,
            images: body.schoolImages
        }
        let data = await School.findOneAndUpdate({ registeredBy: foundUser._id }, { $set: schoolObj }, { new: true })
        if (!data) throw msg.NotExist

        return { msg: msg.success, user: foundUser, schoolData: data }

    } else {
        let user1 = await User.findOneAndUpdate({ _id: user._id }, { $set: body }, { new: true })
        if (!user1) throw msg.NotExist;

        return { msg: msg.success, user: user1 }
    }
}

const uploadTeacherDoc = async (user, body, files, id) => {
    if (user.roleId > 3 && user.roleId < 1) throw msg.actionForbidden;
    if (!id) throw msg.idrequired;
    let data = {}
    var f = Object.keys(files).map((a) => { return [a, files[a][0].key] });
    f.forEach(a => {
        if (a[0] == "profile") {
            data.profile = a[1];
        } else if (a[0] == "certificate") {
            data.certificate = a[1];
        }
        else if (a[0] == "document") {
            data.document = a[1]
        }
    });

    if (data.document) {
        let document = {};
        document.docNumber = body.docNumber
        document.type = body.docType
        document.link = data.document
        delete body.docNumber
        delete body.docType;
        body.document = document
    }
    if (data.certificate) body.certificate = data.certificate
    if (data.profile) body.profile = data.profile;
    let res = await User.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!res) throw msg.invalidId;
    return {
        result: res
    }

}


const updateTeacher = async (user, roleId, id, body) => {
    if (roleId > 3 && roleId < 1) throw msg.actionForbidden;
    if (!id) throw msg.idrequired;
    let res = await User.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!res) throw msg.teacherNotFound;
    return {
        result: res
    }
}


const homeVariable1 = async (roleId, query) => {
    if (!roleId == 2) throw msg.actionForbidden;
    let a = [];
    let total = await User.count();

    let per = await User.count({ roleId: 0, class: query.id });
    // return
    let Primary = await User.count({ roleId: 0, class: query.id });
    let Heigher_Secondary = await User.count({ roleId: 0, class: query.id });
    let Senior_Secondary = await User.count({ roleId: 0, class: query.id });
    // let per = await User.count({ roleId: 0, department: 'Pre' });

    // let Primary = await User.count({ roleId: 0, department: 'Primary' });
    // let Heigher_Secondary = await User.count({ roleId: 0, department: 'Heigher Secondary' });
    // let Senior_Secondary = await User.count({ roleId: 0, department: 'Senior Secondary' });


    return {
        'total': total,
        'Per': per,
        'Primary': Primary,
        'Heigher_Secondary': Heigher_Secondary,
        'Senior_Secondary': Senior_Secondary
    }
}



// const homeVariable = async (roleId, query) => {
//   if (!roleId == 2) throw msg.actionForbidden;
//   let a = [];
//   var per = []
//   var Primary = []
//   var Secondary = []
//   var Heigher_Secondary = []
//   var Senior_Secondary = []

//   let total = await User.find({ roleId: 0 }).populate('class', 'name');
//   for (let iterator of total) {
//     console.log("class-----", iterator)
//     if (iterator.class['name'] == '1' || iterator.class['name'] == '2' || iterator.class['name'] == '3' || iterator.class['name'] == '4' || iterator.class['name'] == '5') {
//       Primary.push(iterator)
//     }
//     // for (let i of iterator.class) {
//     //   console.log("i---------", i)
//     // }
//   }
//   // return total
//   // per = await User.count({ roleId: 0, class: query.id });//ukg,lkg
//   // // return
//   // Primary = await User.count({ roleId: 0, class: query.id });//1-5//Secondary
//   // Secondary = await User.count({ roleId: 0, class: query.id });//6-8//Secondary


//   // Heigher_Secondary = await User.count({ roleId: 0, class: query.id });//9-10
//   // Senior_Secondary = await User.count({ roleId: 0, class: query.id });//11-12
//   // let per = await User.count({ roleId: 0, department: 'Pre' });

//   // let Primary = await User.count({ roleId: 0, department: 'Primary' });
//   // let Heigher_Secondary = await User.count({ roleId: 0, department: 'Heigher Secondary' });
//   // let Senior_Secondary = await User.count({ roleId: 0, department: 'Senior Secondary' });


//   return {
//     'total': total,
//     'Per': per,
//     'Primary': Primary.length,
//     'Heigher_Secondary': Heigher_Secondary,
//     'Senior_Secondary': Senior_Secondary
//   }
// }


const homeVariable = async (user, roleId, query) => {
    // console.log("user---------", user)
    let total = await User.find({ roleId: 0, school: user.school }).populate('class');
    // console.log("total=======", total.class)
    let Pree_Primary = []
    let Primary = [];
    let Secondary = [];
    let Heigher_Secondary = [];
    let Senior_Secondary = [];//"UKG", "LKG", 'Pre-Nursery', 'Nursery', 'KG'

    for (let iterator of total) {
        // console.log("iterator--------------", iterator.class)
        if (iterator.class && iterator.class.name) {


            if (
                iterator.class.name === 'UKG' ||
                iterator.class.name === 'LKG' ||
                iterator.class.name === 'Pre-Nursery' ||
                iterator.class.name === 'Nursery' ||
                iterator.class.name === 'KG'
            ) {
                Pree_Primary.push(iterator);
            }
            if (
                iterator.class.name === '1' ||
                iterator.class.name === '2' ||
                iterator.class.name === '3' ||
                iterator.class.name === '4' ||
                iterator.class.name === '5'
            ) {
                Primary.push(iterator);
            }
            if (
                iterator.class.name === '6' ||
                iterator.class.name === '7' ||
                iterator.class.name === '8'
            ) {
                Secondary.push(iterator);
            }
            if (
                iterator.class.name === '9' ||
                iterator.class.name === '10'
            ) {
                Heigher_Secondary.push(iterator);
            }
            if (
                iterator.class.name === '11' ||
                iterator.class.name === '12'
            ) {
                Senior_Secondary.push(iterator);
            }
        }
    }

    return {
        totalStudents: total.length,
        Pree_PrimaryStudent: Pree_Primary.length,
        PrimaryStudents: Primary.length,
        SecondaryStudents: Secondary.length,
        Heigher_SecondaryStudents: Heigher_Secondary.length,
        Senior_SecondaryStudents: Senior_Secondary.length,
    };
};


const getClassTeacher = async (query, user) => {
    const foundClass = await Class.find({ class: query.class });
    if (!foundClass) throw msg.classNotExist;

}

const getTeacher1 = async (query, user) => {
    if (query.id) {
        let id = query.id

        const foundTeacher = await User.findOne({ _id: query.id, school: user.school });
        // const foundTeacher = await User.findById(query.id);

        if (!foundTeacher) throw msg.teacherNotFound;
        return foundTeacher;
    }
    else {
        let school = await School.findOne({ registeredBy: user._id });

        const foundTeachers = await User.find({ school: school._id });
        if (!foundTeachers) throw msg.teacherNotFound;
        return foundTeachers;
    }
}


const getTeacher = async (query, user) => {

    // if (user.school) {

    if (query.id) {
        let id = query.id
        var foundSchool = await School.findOne({ _id: user.school });
        console.log("foundSchool---------", foundSchool)
        if (foundSchool.length == 0) throw msg.school
        // for (var iterator of foundSchool) {
        // if (iterator) {
        const foundTeacher = await User.findOne({ _id: query.id, school: foundSchool._id, roleId: 3 }).populate("school").populate("class");
        console.log("----", foundTeacher.class && foundTeacher.section);
        if (foundTeacher.class && foundTeacher.section) {
            for (let i of foundTeacher.class.section) {
                //foundTeacher.section.toString() == i._id.toString()
                if (foundTeacher.section.toString() == i._id.toString()) {
                    foundTeacher.section = i;

                }
            }
        }
        if (!foundTeacher) throw msg.teacherNotFoundForThisSchool;
        return foundTeacher;
        // }

        // }
        // const foundTeacher = await User.findById(query.id);


    }
    else {
        let school = await School.findOne({ registeredBy: user._id });

        const foundTeachers = await User.find({ school: school._id });
        if (!foundTeachers) throw msg.teacherNotFound;
        return foundTeachers;
    }
    // } else throw msg.school
}


// const getTeacher = async (query, user) => {

//   // if (user.school) {

//   if (query.id) {
//     let id = query.id
//     var foundSchool = await School.find({ _id: user.school });
//     console.log("foundSchool---------", foundSchool)
//     if (foundSchool.length == 0) throw msg.school
//     for (var iterator of foundSchool) {
//       // if (iterator) {
//       const foundTeacher = await User.findOne({ _id: query.id, school: iterator._id });
//       if (!foundTeacher) throw msg.teacherNotFoundForThisSchool;
//       return foundTeacher;
//       // }

//     }
//     // const foundTeacher = await User.findById(query.id);


//   }
//   else {
//     let school = await School.findOne({ registeredBy: user._id });

//     const foundTeachers = await User.find({ school: school._id });
//     if (!foundTeachers) throw msg.teacherNotFound;
//     return foundTeachers;
//   }
//   // } else throw msg.school
// }





const getSectionById = async (query, user) => {
    const { sectionid } = query;
    if (!sectionid) throw msg.sectionIdRequired;
    const foundClass = await Class.findOne({ 'section._id': sectionid });
    if (!foundClass) throw msg.sectionNotFound;
    const filterdSection = foundClass.section.filter((oneSection) => {
        if (oneSection._id == sectionid);
        return oneSection;
    })
    return filterdSection[0];
}

const updatepassword = async (body) => {
    if (!body.password) throw msg.passwordRequired;
    const user = await User.findOneAndUpdate({ email: body.email }, { $set: { password: CryptoJS.AES.encrypt(body.password, process.env.secret_key).toString() } });
    if (!user) msg.userNotFound;
    return { message: msg.success }
}

const approveLeave = async (body, user) => {
    const { leaveId, date, status } = body;
    const newDate = new Date(date);
    if (status === 'Accepted') {
        var updatedTeacher = await Attendance.findOneAndUpdate({ 'leaveApplication._id': leaveId }, {
            '$set': {
                'leaveApplication.$.status': status
            }
        }, { new: true });
        updatedTeacher = await Attendance.findOneAndUpdate({ _id: updatedTeacher._id }, {
            $push: {
                status: {
                    status: "Leave",
                    day: newDate
                }
            }
        }, { new: true })

    }
    else {
        updatedTeacher = await Attendance.findOneAndUpdate({ 'leaveApplication._id': leaveId }, {
            '$set': {
                'leaveApplication.$.status': status
            }
        }, { new: true });
    }

    if (updatedTeacher) return updatedTeacher;
    else throw "Attendance not found"
}



const getAttendanceOfAllTeachers = async (query, user) => {

    if (!query.date) {
        previous = moment(new Date()).startOf('day');
        next = moment(new Date()).add(1, 'days').startOf('day');
    }
    else {
        previous = moment(new Date(query.date)).startOf('day');
        next = moment(new Date(query.date)).add(1, 'days').startOf('day');
    }
    const school = await School.findOne({ registeredBy: user._id });
    const foundTeachers = await Attendance.find({ schoolId: school._id }, { leaveApplication: 0 }).populate({ path: 'teacherId', select: 'name email' }).sort({ 'createdAt': -1 });
    const allTeachersList = await User.find({ school: school._id, roleId: 3, role: "Teacher" }).populate({ path: '_id', select: 'name email' }).sort({ 'createdAt': -1 });

    // return {allTeachersList}
    const result = foundTeachers.filter((o) => {
        if (o.teacherId) return true
    })


    const filteredTeachers = result.filter((o) => {
        for (const iterator of o.status) {
            if (new Date(iterator.day) < next && new Date(iterator.day) >= previous) {
                o.status = iterator;
                return true;
            }
        }
        return false;
    })


    var presentCount = 0;
    var absentCount = 0;
    var leaveCount = 0;
    var notMarked = 0;
    var notMarkedTeacherList = []
    var presentTeacherList = []
    var absentTeacherList = []
    var leaveTeacherList = []

    for (const o of filteredTeachers) {
        console.log("o.status[0].status == 'Present'========>>", o.status[0].status == 'Present')
        if (o.status[0].status == 'Present') {
            presentTeacherList.push(o)
            presentCount++;
        }
        else if (o.status[0].status == 'Absent') {
            absentTeacherList.push(o)
            absentCount++;
        }
        else if (o.status[0].status == 'Leave') {
            leaveTeacherList.push(o)
            leaveCount++;
        }
        else if (o.status[0].status == 'Not Marked') {
            // console.log("o=========>>", o)
            notMarkedTeacherList.push(o)
            notMarked++;
        }



    }
    const foundAllTeachers = await Attendance.find({ schoolId: school._id, });
    const totalTeachers = foundAllTeachers.filter((o) => {
        if (o.teacherId) return true
    })
    return {
        totalTeachers: allTeachersList.length,
        presentPercentage: presentCount * 100 / totalTeachers.length,
        presentCount: presentCount,
        absentCount: absentCount,
        leaveCount: leaveCount,
        notMarked: notMarked,//allTeachersList.length - filteredTeachers.length,
        presentTeacherList: presentTeacherList,
        notMarkedTeacherList: notMarkedTeacherList,
        result: filteredTeachers,
    };
}


// its for who took leave-------------
const teachersOnLeave233 = async (user) => {
    try {
        // Find the school associated with the user
        const initialLeaveBalances = {
            'Maternity Leave': 77,
            'Casual Leave': 11,
            'Compensatory Off': 10,
            'Marriage Leave': 55,
            'Short Leave': 2,
            'Others': 2,
        };
        const school = await School.findOne({ registeredBy: user._id });

        // Find all attendance records for teachers in the school
        const foundTeachers = await Attendance.find({ schoolId: school._id, teacherId: { $exists: true } })
            .populate({ path: 'teacherId', select: '_id firstName lastName email' })
            .lean();

        // Initialize an object to store leaves grouped by teacher
        const leavesByTeacher = {};

        foundTeachers.forEach((teacher) => {
            if (teacher.teacherId && teacher.teacherId._id && teacher.leaveApplication.length > 0) {
                const teacherId = teacher.teacherId._id;

                // Check if the teacher already has an entry in the leavesByTeacher object
                if (!leavesByTeacher[teacherId]) {
                    leavesByTeacher[teacherId] = {
                        teacher: teacher.teacherId,
                        leaves: [],
                        totalAvailableLeave: teacher.totalNumberOfAvliableLeave || 0,
                        totalNumberOfLeave: teacher.totalNumberOfLeave || 0,
                    };
                }

                // Push each leave of the teacher into the leaves array
                teacher.leaveApplication.forEach((leave) => {
                    leavesByTeacher[teacherId].leaves.push({
                        ...leave,
                        teacherId: teacher.teacherId,
                    });
                });
            }
        });

        // Filter out teachers who haven't taken any leave
        const teachersWithLeaves = Object.values(leavesByTeacher).filter((teacher) => teacher.leaves.length > 0);

        // Return an object containing the total number of teachers and the leaves grouped by teacher
        return {
            numberOfTeachers: teachersWithLeaves.length,
            leavesByTeacher: teachersWithLeaves,
        };
    } catch (error) {
        console.error('Error fetching teachers on leave:', error);
        throw error; // Propagate the error to the caller
    }
};


const teachersOnLeave66 = async (user) => {
    try {
        // Find the school associated with the user
        const initialLeaveBalances1 = {
            'Maternity Leave': 77,
            'Casual Leave': 11,
            'Compensatory Off': 10,
            'Marriage Leave': 55,
            'Short Leave': 2,
            'Others': 2,
        };
        const initialLeaveBalances = {
            'Maternity Leave': 77,
            'Casual Leave': 11,
            'Compensatory Off': 10,
            'Marriage Leave': 55,
            'Short Leave': 2,
            'Others': 2,
        };
        const school = await School.findOne({ registeredBy: user._id });

        // Find all attendance records for teachers in the school
        const foundTeachers = await Attendance.find({ schoolId: school._id, teacherId: { $exists: true } })
            .populate({ path: 'teacherId', select: '_id firstName lastName email' })
            .lean();

        // Initialize an object to store leaves grouped by teacher
        const leavesByTeacher = {};

        foundTeachers.forEach((teacher) => {
            if (teacher.teacherId && teacher.teacherId._id && teacher.leaveApplication.length > 0) {
                const teacherId = teacher.teacherId._id;

                // Check if the teacher already has an entry in the leavesByTeacher object
                if (!leavesByTeacher[teacherId]) {
                    leavesByTeacher[teacherId] = {
                        teacher: teacher.teacherId,
                        leaves: [],
                        totalAvailableLeave: teacher.totalNumberOfAvliableLeave || 0,
                        totalNumberOfLeave: teacher.totalNumberOfLeave || 0,
                        updatedInitialLeaveBalances: { ...initialLeaveBalances }, // Initialize with original balances
                    };
                }

                // Push each leave of the teacher into the leaves array
                teacher.leaveApplication.forEach((leave) => {
                    leavesByTeacher[teacherId].leaves.push({
                        ...leave,
                        teacherId: teacher.teacherId,
                    });

                    // Update the initialLeaveBalances object based on the leave taken
                    if (initialLeaveBalances.hasOwnProperty(leave.leaveType)) {
                        initialLeaveBalances[leave.leaveType]--;
                        // Update the leave balances for this teacher
                        leavesByTeacher[teacherId].updatedInitialLeaveBalances[leave.leaveType]--;
                    }
                });
            }
        });

        // Filter out teachers who haven't taken any leave
        const teachersWithLeaves = Object.values(leavesByTeacher).filter((teacher) => teacher.leaves.length > 0);

        // Return an object containing the total number of teachers, leaves grouped by teacher, and updated initialLeaveBalances
        return {
            numberOfTeachers: teachersWithLeaves.length,
            yearlyLeaveList: initialLeaveBalances1,
            teachersOnLeaveList: teachersWithLeaves,
        };
    } catch (error) {
        console.error('Error fetching teachers on leave:', error);
        throw error; // Propagate the error to the caller
    }
};

const teachersOnLeaveff = async (query, user) => {

    const customQuery = {};
    // if (query.classId) customQuery.classId = query.classId;
    // if (query.sectionId) customQuery.sectionId = query.sectionId;

    const foundStudent = await User.find({ roleId: 3 });
    if (foundStudent.length == 0) throw "teacher not found";
    if (!query.date) {
        previous = moment(new Date()).startOf('day');
        next = moment(new Date()).add(1, 'days').startOf('day');
    }
    else {
        previous = moment(new Date(query.date)).startOf('day');
        next = moment(new Date(query.date)).add(1, 'days').startOf('day');
    }

    const foundAttendance = await Attendance.find({ "userId": { $in: foundStudent } }, { status: 1 }).populate({ path: 'userId', select: '_id firstName lastName' });
    const filteredStudents = foundAttendance.filter((o) => {
        for (const iterator of o.status) {
            if (new Date(iterator.day) < next && new Date(iterator.day) >= previous) {
                o.status = iterator;
                return true;
            }
        }
        return false;
    })

    const leaveStudents = filteredStudents.filter((o) => { if (o.status[0].status === 'Leave') return true })

    // const absentStudents = filteredStudents.filter((o) => { if (o.status[0].status === 'Absent') return true })
    // const persentStudents = filteredStudents.filter((o) => { if (o.status[0].status === 'Present') return true })



    // const sortedAbsentStudents = absentStudents.sort(function (a, b) {
    //   var keyA = new Date(a.status[0].day),
    //     keyB = new Date(b.status[0].day);
    //   // Compare the 2 dates
    //   if (keyA < keyB) return 1;
    //   if (keyA > keyB) return -1;
    //   return 0;
    // });


    // const sortedPresentStudents = persentStudents.sort(function (a, b) {
    //   var keyA = new Date(a.status[0].day),
    //     keyB = new Date(b.status[0].day);
    //   // Compare the 2 dates
    //   if (keyA < keyB) return 1;
    //   if (keyA > keyB) return -1;
    //   return 0;
    // })

    const sortedLeaveStudents = leaveStudents.sort(function (a, b) {
        var keyA = new Date(a.status[0].day),
            keyB = new Date(b.status[0].day);
        // Compare the 2 dates
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
    });
    // const presentStudentCount = filteredStudents.length - (absentStudents.length + leaveStudents.length);
    return {
        numberOfTeachers: sortedLeaveStudents.length,
        // yearlyLeaveList: initialLeaveBalances1,
        teachersOnLeaveList: sortedLeaveStudents,
        // presentCount: presentStudentCount,
        // absentCount: absentStudents.length,
        // leaveCount: leaveStudents.length,
        // notMarked: foundAttendance.length - filteredStudents.length,
        // presentPercentage: Math.floor(presentStudentCount * 100 / foundAttendance.length),
        // presentStudentList: sortedPresentStudents,
        // absentStudents: sortedAbsentStudents,
        // leaveStudents: sortedLeaveStudents,
        // totalStudents: foundAttendance.length
    };
}

const teachersOnLeave = async (query, user) => {
    const initialLeaveBalances1 = {
        'Maternity Leave': 77,
        'Casual Leave': 11,
        'Compensatory Off': 10,
        'Marriage Leave': 55,
        'Short Leave': 2,
        'Others': 2,
    };
    const initialLeaveBalances = {
        'Maternity Leave': 77,
        'Casual Leave': 11,
        'Compensatory Off': 10,
        'Marriage Leave': 55,
        'Short Leave': 2,
        'Others': 2,
    };
    try {
        const moment = require('moment'); // Ensure moment.js is included
        const previous = query.date ? moment(query.date).startOf('day') : moment().startOf('day');
        const next = query.date ? moment(query.date).add(1, 'days').startOf('day') : moment().add(1, 'days').startOf('day');

        // Find all teachers
        const foundTeachers = await User.find({ roleId: 3 });
        if (foundTeachers.length === 0) throw "Teacher not found";

        // Find attendance records for teachers
        const foundAttendance = await Attendance.find({ "teacherId": { $in: foundTeachers } }, { status: 1 })
            .populate({ path: 'teacherId', select: '_id firstName lastName' })
            .lean();

        // Filter attendance records for the given date range
        const filteredTeachers = foundAttendance.filter((attendance) => {
            return attendance.status.some((record) => {
                const recordDate = new Date(record.day);
                console.log("recordDate========..", recordDate)
                return recordDate >= previous && recordDate < next && record.status === 'Leave';
            });
        });

        // Sort teachers on leave by date
        const sortedLeaveTeachers = filteredTeachers.sort((a, b) => {
            const dateA = new Date(a.status.find(record => record.status === 'Leave').day);
            const dateB = new Date(b.status.find(record => record.status === 'Leave').day);
            return dateB - dateA;
        });

        return {
            numberOfTeachers: sortedLeaveTeachers.length,
            yearlyLeaveList: initialLeaveBalances1,

            teachersOnLeaveList: sortedLeaveTeachers,
        };
    } catch (error) {
        console.error('Error fetching teachers on leave:', error);
        throw error; // Propagate the error to the caller
    }
};







const searchAttendanceOfStudents = async (body, user) => {

    const school = await School.findOne({ registeredBy: user._id });
    if (body.firstname == 'null') delete body.firstname
    if (body.lastname == 'null') delete body.lastname
    if (body.classId == 'null') delete body.classId
    if (body.section == 'null') delete body.section
    if (body.classId) {
        body.class = body.classId;
        delete body.classId;
    }
    // console.log(body);

    const foundStudents = await User.find({ school: school._id }, 'firstname lastname class section email').lean();
    const filteredResult = foundStudents.filter((student) => {
        let isValid = true;

        for (key in body) {
            if (student[key]) {
                if (key == 'firstname' || key == 'lastname') {
                    isValid = isValid && student[key].toLowerCase() == body[key].toLowerCase();
                    continue;
                }
                isValid = isValid && student[key] == body[key];
            }
            else {
                isValid = isValid && false
            }

        }
        return isValid;
    });
    return {
        count: filteredResult.length,
        result: filteredResult
    };
}

const getAttendanceOfStudent = async (query, user) => {
    const foundStudent = await Attendance.findOne({ userId: query.id }).populate({ path: "userId", select: 'firstname lastname email' }).lean();
    if (!foundStudent) throw msg.NotExist;

    const status = foundStudent.status;
    const leaveDates = status.filter((o) => {
        if (o.status === 'Leave') return true
    })
    const sortedLeaves = leaveDates.sort(function (a, b) {
        var keyA = new Date(a.day),
            keyB = new Date(b.day);
        // Compare the 2 dates
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
    });

    const absentDates = status.filter((o) => {
        if (o.status === 'Absent') return true
    })

    const sortedAbsents = absentDates.sort(function (a, b) {
        var keyA = new Date(a.day),
            keyB = new Date(b.day);
        // Compare the 2 dates
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
    });
    presentDays = status.length - (leaveDates.length + absentDates.length);
    return {
        student: foundStudent.userId,
        totalDays: status.length,
        presentDays: presentDays,
        absentDays: absentDates.length,
        leaveDays: leaveDates.length,
        presentPercentage: Math.floor(presentDays * 100 / status.length),
        leaveDates: sortedLeaves,
        absentDates: sortedAbsents,
    }
}

const getAttendanceOfClassAndSection = async (query, user) => {

    const customQuery = {};
    if (query.classId) customQuery.classId = query.classId;
    if (query.sectionId) customQuery.sectionId = query.sectionId;

    const foundStudent = await User.find(customQuery, '_id');
    if (foundStudent.length == 0) throw msg.studentNotFound;
    if (!query.date) {
        previous = moment(new Date()).startOf('day');
        next = moment(new Date()).add(1, 'days').startOf('day');
    }
    else {
        previous = moment(new Date(query.date)).startOf('day');
        next = moment(new Date(query.date)).add(1, 'days').startOf('day');
    }

    const foundAttendance = await Attendance.find({ "userId": { $in: foundStudent } }, { status: 1 }).populate({ path: 'userId', select: '_id firstName lastName' });
    const filteredStudents = foundAttendance.filter((o) => {
        for (const iterator of o.status) {
            if (new Date(iterator.day) < next && new Date(iterator.day) >= previous) {
                o.status = iterator;
                return true;
            }
        }
        return false;
    })

    const leaveStudents = filteredStudents.filter((o) => { if (o.status[0].status === 'Leave') return true })

    const absentStudents = filteredStudents.filter((o) => { if (o.status[0].status === 'Absent') return true })
    const persentStudents = filteredStudents.filter((o) => { if (o.status[0].status === 'Present') return true })



    const sortedAbsentStudents = absentStudents.sort(function (a, b) {
        var keyA = new Date(a.status[0].day),
            keyB = new Date(b.status[0].day);
        // Compare the 2 dates
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
    });


    const sortedPresentStudents = persentStudents.sort(function (a, b) {
        var keyA = new Date(a.status[0].day),
            keyB = new Date(b.status[0].day);
        // Compare the 2 dates
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
    })

    const sortedLeaveStudents = leaveStudents.sort(function (a, b) {
        var keyA = new Date(a.status[0].day),
            keyB = new Date(b.status[0].day);
        // Compare the 2 dates
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
    });
    const presentStudentCount = filteredStudents.length - (absentStudents.length + leaveStudents.length);
    return {

        presentCount: presentStudentCount,
        absentCount: absentStudents.length,
        leaveCount: leaveStudents.length,
        notMarked: foundAttendance.length - filteredStudents.length,
        presentPercentage: Math.floor(presentStudentCount * 100 / foundAttendance.length),
        presentStudentList: sortedPresentStudents,
        absentStudents: sortedAbsentStudents,
        leaveStudents: sortedLeaveStudents,
        totalStudents: foundAttendance.length
    };
}




const getLeaveById = async (query, user) => {
    const foundLeave = await Attendance.findOne({ 'leaveApplication._id': query.id }, { 'leaveApplication.$': 1 });
    if (!foundLeave) throw msg.NotExist;
    return foundLeave;

}

const getAttendanceByDate = async (date, user) => {
    const query = {};
    const studentAttendance = await getAttendanceOfClassAndSection(query, 'user')
    const teacherAttendance = await getAttendanceOfAllTeachers(query, user)

    delete studentAttendance.leaveStudents
    delete studentAttendance.absentStudents
    delete teacherAttendance.result
    return {
        student: studentAttendance,
        teacher: teacherAttendance
    };

}


// const uplodImage=async(user,files,body,id)=>{
//   const uplode= await User.findByIdAndUpdate({_id:id})

//   if(files.profile) body.profile=files.profile[0].location
//   let data =await User.findOneAndUpdate(id,{$set:body},{new:true})
//   return {
//     result:data
//   }
// }

const uplodImage = async (user, files, body) => {
    // if (files.profileImage) body = { profileImage: files.profile[0].location }
    // if (files.tenthMarksheetURL) body = { profileImage: files.tenthMarksheetURL[0].location }
    if (files.profileImage) body.profileImage = files.profileImage[0].key

    if (user.roleId == 3) {
        const updatedUser = await User.findByIdAndUpdate(user._id, body, { new: true });
        // console.log(updatedUser)
        if (!updatedUser) throw msg.userNotFound;
        return updatedUser;
    } else { throw msg.actionForbidden }
}


const getteacherShortDeatils = async (id, user) => {
    console.log(id)
    const data = await User.findById({ _id: id }, "profileImage name ").lean();
    // let res=await Class.find({"section.classTeacher":id},{"section.$":1,"name":1})
    // console.log(res)

    // data.class=res
    return {
        result: data
    }

}

const teacherDeatils = async (id, user) => {
    if (!id) throw "requiredId"
    const res = await User.findById({ _id: id })
    let ciphertext = CryptoJS.AES.decrypt(res.password, process.env.secret_key).toString(CryptoJS.enc.Utf8);

    console.log("*******", ciphertext)
    // let res=await Class.find({"section.classTeacher":id},{"section.$":1,"name":1})
    // deatils.class=res

    return {
        result: res
    }

}

const uploadAttachment = async (files) => {
    {
        if (!files || !files.attachment) throw "attachment required";
        var filesKeys = files.attachment.map(a => {
            return { key: a.key }
        })
        return filesKeys;
    }
}

const myProfile = async (user) => {
    let foundUser = await User.findById(user._id)
    let data = await School.findOne({ registeredBy: foundUser._id }).populate('registeredBy')

    return {
        msg: msg.success,
        user: foundUser,
        schoolData: data
    }
}


const userAllReadyExits = async (user, body) => {
    let data = await User.findOne({ email: body.email })
    if (data) throw msg.userExist
    else {
        return {
            msg: msg.success
        }
    }
}


const employeesManagementHomeVariable1 = async (user, body) => {
    console.log("school=========", user.school)
    let data = await User.find({ school: user.school, roleId: { $ne: 0 } });
    //1 for superadmin, 2 for admin, 3 for teacher, 0 for student,4-Teaching-Assistant', '5-Principal', 
    // '6-Accountant', '7-Head-Teacher', ' 8-Sports-Coach', '9-School-Bus-Driver',
    // '10-Special-Education-Teacher', '11-Registrar', '12-Athletic-Director', '13-Vice-Principal',
    // '14-Crossing-Guard', '15-RECEPTIONIST'
    // enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    let teacher = await User.find({ school: user.school, roleId: 3 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    let Principal = await User.find({ school: user.school, roleId: 5 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    let Sports_Coach = await User.find({ school: user.school, roleId: 8 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    let Special_Education_Teacher = await User.find({ school: user.school, roleId: 10 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");//
    let Head_Teacher = await User.find({ school: user.school, roleId: 7 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");//
    let Teaching_Assistant = await User.find({ school: user.school, roleId: 4 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");//Teaching-Assistant
    let Athletic_Director = await User.find({ school: user.school, roleId: 12 }, "firstName lastName email phone address profile role roleId designation experience createdAt ")
    let Vice_Principal = await User.find({ school: user.school, roleId: 13 }, "firstName lastName email phone address profile role roleId designation experience createdAt ")

    const allUsers = teacher.concat(
        Principal,
        Sports_Coach,
        Special_Education_Teacher,
        Head_Teacher,
        Teaching_Assistant,
        Athletic_Director,
        Vice_Principal
    );

    // Get the length of the concatenated array
    const totalUsers = allUsers.length;
    const total = data.length
    console.log("Total Users:", totalUsers);


    return {
        msg: msg.success,
        totalEmployees: data.length,
        totalAccademicEmployees: totalUsers,
        totalNonAccademicEmployees: total - totalUsers,
        presentEmployees: 0,
        absentEmployees: 0
        // totalEmployees: data,
        // AccademicEmployees: allUsers,
        // NonAccademicEmployees: 0

    };
};

const employeesManagementHomeVariable = async (user, body) => {
    console.log("school=========", user.school);
    let data = await User.find({ school: user.school, roleId: { $ne: 0 } });
    let teacher = await User.find({ school: user.school, roleId: 3 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    let Teaching_Assistant = await User.find({ school: user.school, roleId: 4 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    let Principal = await User.find({ school: user.school, roleId: 5 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    let Accountant = await User.find({ school: user.school, roleId: 6 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");//
    let Head_Teacher = await User.find({ school: user.school, roleId: 7 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");//
    let Sports_Coach = await User.find({ school: user.school, roleId: 8 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    // let School_Bus_Driver = await User.find({ school: user.school, roleId: 9 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");//Teaching-Assistant
    // let Registrar = await User.find({ school: user.school, roleId: 11 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");//Teaching-Assistant
    // let School_Bus_Driver = await User.find({ school: user.school, roleId: 9 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");//Teaching-Assistant
    let Special_Education_Teacher = await User.find({ school: user.school, roleId: 10 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");//
    let Athletic_Director = await User.find({ school: user.school, roleId: 12 }, "firstName lastName email phone address profile role roleId designation experience createdAt ")
    let Vice_Principal = await User.find({ school: user.school, roleId: 13 }, "firstName lastName email phone address profile role roleId designation experience createdAt ")

    const allUsers = teacher.concat(
        Principal,
        Sports_Coach,
        Special_Education_Teacher,
        Head_Teacher,
        Teaching_Assistant,
        Athletic_Director,
        Vice_Principal,
        Accountant
    );
    const totalUsers = allUsers.length;
    const total = data.length
    console.log("Total Users:", totalUsers);

    let RECEPTIONIST = await User.find({ school: user.school, roleId: 15 })//, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    let admin = await User.find({ school: user.school, roleId: 1 })//, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    let superadmin = await User.find({ school: user.school, roleId: 2 })//, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    let School_Bus_Driver = await User.find({ school: user.school, roleId: 9 })//, "firstName lastName email phone address profile role roleId designation experience createdAt ");//
    let Registrar = await User.find({ school: user.school, roleId: 11 })//, "firstName lastName email phone address profile role roleId designation experience createdAt ");//
    let Crossing_Guard = await User.find({ school: user.school, roleId: 14 })//, "firstName lastName email phone address profile role roleId designation experience createdAt ");//Teaching-Assistant
    // let Athletic_Director = await User.find({ school: user.school, roleId: 12 }, "firstName lastName email phone address profile role roleId designation experience createdAt ")
    // let Vice_Principal = await User.find({ school: user.school, roleId: 13 }, "firstName lastName email phone address profile role roleId designation experience createdAt ")

    // Get the length of the concatenated array

    const nonUsers = RECEPTIONIST.concat(
        admin,
        superadmin,
        School_Bus_Driver,
        Registrar,
        Crossing_Guard,
    );
    // ... your existing code ...

    let presentEmployees = 0;
    let absentEmployees = 0;

    // Loop through each user to calculate present and absent employees
    // for (const iteratee of allUsers) {
    //   console.log("iteratee==============", iteratee)
    //   // const attendance = await Attendance.findOne({ teacherId: user._id });
    //   const attendance = await Attendance.findOne({
    //     $or: [{ teacherId: iteratee._id }, { employeeId: iteratee._id }]
    //   });

    //   if (attendance) {
    //     const currentMonth = new Date().getMonth();
    //     const currentYear = new Date().getFullYear();

    //     const presentCount = attendance.status.filter((entry) => {
    //       const entryDate = new Date(entry.day);
    //       return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear && entry.status === "Present";
    //     }).length;

    //     const absentCount = attendance.status.filter((entry) => {
    //       const entryDate = new Date(entry.day);
    //       return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear && entry.status === "Absent";
    //     }).length;

    //     presentEmployees += presentCount;
    //     absentEmployees += absentCount;
    //   }
    // }
    const combinedUsers = allUsers.concat(nonUsers);
    for (const iteratee of combinedUsers) {
        const attendance = await Attendance.findOne({
            $or: [{ teacherId: iteratee._id }, { employeeId: iteratee._id }]
        });

        if (attendance) {
            const currentDate = new Date();
            currentDate.setUTCHours(0, 0, 0, 0); // Set time to midnight (00:00:00) in UTC

            const isPresent = attendance.status.some((entry) => {
                const entryDate = new Date(entry.day);
                entryDate.setUTCHours(0, 0, 0, 0);
                const isSameDate = entryDate.toISOString().slice(0, 10) === currentDate.toISOString().slice(0, 10);
                return isSameDate && entry.status === "Present";
            });

            const isAbsent = attendance.status.some((entry) => {
                const entryDate = new Date(entry.day);
                entryDate.setUTCHours(0, 0, 0, 0);
                const isSameDate = entryDate.toISOString().slice(0, 10) === currentDate.toISOString().slice(0, 10);
                return isSameDate && entry.status === "Absent";
            });

            // Count employees for the current day
            if (isPresent) {
                presentEmployees++;
            }
            if (isAbsent) {
                absentEmployees++;
            }
        }
    }

    return {
        msg: msg.success,
        totalEmployees: data.length,
        totalAccademicEmployees: totalUsers,
        totalNonAccademicEmployees: total - totalUsers,
        presentEmployees: presentEmployees,
        absentEmployees: absentEmployees,
    };
};

const employeesManagementList = async (user, body) => {
    console.log("school=========", user.school)
    let data = await User.find({ school: user.school, roleId: { $ne: 0 } });
    //1 for superadmin, 2 for admin, 3 for teacher, 0 for student,4-Teaching-Assistant', '5-Principal', 
    // '6-Accountant', '7-Head-Teacher', ' 8-Sports-Coach', '9-School-Bus-Driver',
    // '10-Special-Education-Teacher', '11-Registrar', '12-Athletic-Director', '13-Vice-Principal',
    // '14-Crossing-Guard', '15-RECEPTIONIST'
    // enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    let teacher = await User.find({ school: user.school, roleId: 3 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    let Principal = await User.find({ school: user.school, roleId: 5 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    let Sports_Coach = await User.find({ school: user.school, roleId: 8 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    let Special_Education_Teacher = await User.find({ school: user.school, roleId: 10 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");//
    let Head_Teacher = await User.find({ school: user.school, roleId: 7 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");//
    let Teaching_Assistant = await User.find({ school: user.school, roleId: 4 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");//Teaching-Assistant
    let Athletic_Director = await User.find({ school: user.school, roleId: 12 }, "firstName lastName email phone address profile role roleId designation experience createdAt ")
    let Vice_Principal = await User.find({ school: user.school, roleId: 13 }, "firstName lastName email phone address profile role roleId designation experience createdAt ")




    let RECEPTIONIST = await User.find({ school: user.school, roleId: 15 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    let admin = await User.find({ school: user.school, roleId: 1 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    let superadmin = await User.find({ school: user.school, roleId: 2 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");
    let School_Bus_Driver = await User.find({ school: user.school, roleId: 9 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");//
    let Registrar = await User.find({ school: user.school, roleId: 11 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");//
    let Crossing_Guard = await User.find({ school: user.school, roleId: 14 }, "firstName lastName email phone address profile role roleId designation experience createdAt ");//Teaching-Assistant
    // let Athletic_Director = await User.find({ school: user.school, roleId: 12 }, "firstName lastName email phone address profile role roleId designation experience createdAt ")
    // let Vice_Principal = await User.find({ school: user.school, roleId: 13 }, "firstName lastName email phone address profile role roleId designation experience createdAt ")


    const allUsers = teacher.concat(
        Principal,
        Sports_Coach,
        Special_Education_Teacher,
        Head_Teacher,
        Teaching_Assistant,
        Athletic_Director,
        Vice_Principal
    );

    // Get the length of the concatenated array
    const totalUsers = allUsers.length;
    const total = data.length
    console.log("Total Users:", totalUsers);



    const nonUsers = RECEPTIONIST.concat(
        admin,
        superadmin,
        School_Bus_Driver,
        Registrar,
        Crossing_Guard,

    );

    // Get the length of the concatenated array
    const totalNonUsers = allUsers.length;
    const total1 = data.length
    console.log("Total Users:", totalUsers);


    return {
        msg: msg.success,
        result: {
            totalEmployees: data.length,
            totalAccademicEmployees: totalUsers,
            totalNonAccademicEmployees: total - totalUsers,
            totalEmployeeslist: data,

            AccademicEmployees: allUsers,
            NonAccademicEmployees: nonUsers
        }
    };
};



const mongoose = require('mongoose');
const searchAcademicEmployees = async (user, data) => {
    // enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],

    const roleIdList = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];


    let obj;
    const numericId = parseInt(data.key); // Convert input to number

    if (!isNaN(numericId)) {
        obj = numericId;
        console.log("obj-----------", obj);
        console.log('The value is a valid number.');
    } else {
        console.log('The value is not a valid number.');
    }

    let ress = await User.find({
        $or: [
            { roleId: { $in: roleIdList }, school: user.school, "firstName": { $regex: data.key, $options: "i" } },
            { roleId: { $in: roleIdList }, school: user.school, "phone": { $regex: data.key, $options: "i" } },
            { roleId: { $in: roleIdList }, school: user.school, "email": { $regex: data.key, $options: "i" } },
            { roleId: { $in: roleIdList }, school: user.school, "lastName": { $regex: data.key, $options: "i" } },
            { roleId: { $in: roleIdList }, school: user.school, "_id": obj },
            { roleId: { $in: roleIdList }, school: user.school, "lastName": { $regex: data.key, $options: "i" } },
            { roleId: { $in: roleIdList }, school: user.school, "designation": { $regex: data.key, $options: "i" } },
        ]
    }
    )
    if (!ress.length) {
        throw msg.NotExist;
    } else {
        const results = [...ress];
        let totalCount = await User.countDocuments({ $in: roleIdList });
        return {
            msg: msg.success,
            count: totalCount,
            result: results
        };
    }
};

// const mongoose = require('mongoose');
//1 for superadmin, 2 for admin, 3 for teacher, 0 for student,4-Teaching-Assistant', '5-Principal', 
// '6-Accountant', '7-Head-Teacher', ' 8-Sports-Coach', '9-School-Bus-Driver',
// '10-Special-Education-Teacher', '11-Registrar', '12-Athletic-Director', '13-Vice-Principal',
// '14-Crossing-Guard', '15-RECEPTIONIST'

const searchNonAcademicEmployeesByAdmin = async (user, data) => {
    const roleIdList = [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59];


    let obj;
    const numericId = parseInt(data.key); // Convert input to number

    if (!isNaN(numericId)) {
        obj = numericId;
        console.log("obj-----------", obj);
        console.log('The value is a valid number.');
    } else {
        console.log('The value is not a valid number.');
    }

    let ress = await User.find({
        $or: [
            { roleId: { $in: roleIdList }, school: user.school, "firstName": { $regex: data.key, $options: "i" } },
            { roleId: { $in: roleIdList }, school: user.school, "phone": { $regex: data.key, $options: "i" } },
            { roleId: { $in: roleIdList }, school: user.school, "email": { $regex: data.key, $options: "i" } },
            { roleId: { $in: roleIdList }, school: user.school, "lastName": { $regex: data.key, $options: "i" } },
            { roleId: { $in: roleIdList }, school: user.school, "_id": obj },
            { roleId: { $in: roleIdList }, school: user.school, "designation": { $regex: data.key, $options: "i" } },
        ]
    })

    if (!ress.length) {
        throw msg.NotExist;
    } else {
        const results = [...ress];
        let totalCount = await User.countDocuments({ $in: roleIdList });
        return {
            msg: msg.success,
            count: totalCount,
            result: results
        };
    }
};


const markEmployeeAttendanceByAdmin = async (user, body) => {
    console.log('user===================', user);
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0); // Set time to midnight (00:00:00) in UTC
    console.log("currentDate-------", currentDate)

    let attendance = await Attendance.findOne({
        employeeId: body.employeeId
    });

    if (!attendance) {
        // Create a new attendance record
        const attendanceBody = {
            employeeId: body.employeeId,
            schoolId: user.school,
            classId: user.class,
            sectionId: user.section,
            status: []
        };
        attendance = new Attendance(attendanceBody);
    }

    // Check if there is an applied and accepted leave on the current day
    const appliedLeave = attendance.leaveApplication.find(
        (leave) =>
            leave.date.getTime() === currentDate.getTime() &&
            (leave.status === 'Applied' || leave.status === 'Accepted')
    );

    if (appliedLeave) {
        throw "You cannot mark attendance because you have applied for leave.";
    }

    // Check if attendance is already marked for the current day
    const alreadyMarked = attendance.status.find(
        (status) => status.day.getTime() === currentDate.getTime()
    );

    if (alreadyMarked) {
        if (alreadyMarked.status === 'Not Marked') {
            // Update the status for the already marked attendance entry
            alreadyMarked.status = body.status;
            const updatedAttendance = await attendance.save();
            if (!updatedAttendance) throw msg.notSaved;
            updatedAttendance.status = alreadyMarked;
            delete updatedAttendance.leaveApplication;
            return updatedAttendance;
        } else if (alreadyMarked.status === 'Absent') {
            // Update the status for the already marked attendance entry
            alreadyMarked.status = body.status;
            const updatedAttendance = await attendance.save();
            if (!updatedAttendance) throw msg.notSaved;
            updatedAttendance.status = alreadyMarked;
            delete updatedAttendance.leaveApplication;
            return updatedAttendance;
        }
        else if (alreadyMarked.status === 'Leave') {
            // Update the status for the already marked attendance entry
            alreadyMarked.status = body.status;
            const updatedAttendance = await attendance.save();
            if (!updatedAttendance) throw msg.notSaved;
            updatedAttendance.status = alreadyMarked;
            delete updatedAttendance.leaveApplication;
            return updatedAttendance;
        }
        else if (alreadyMarked.status === 'Present') {
            // Update the status for the already marked attendance entry
            alreadyMarked.status = body.status;
            const updatedAttendance = await attendance.save();
            if (!updatedAttendance) throw msg.notSaved;
            updatedAttendance.status = alreadyMarked;
            delete updatedAttendance.leaveApplication;
            return updatedAttendance;
        }
        else {
            throw "Attendance is already marked for the current day.";
        }
    }

    const pushValue = {
        day: currentDate,
        status: body.status
    };
    console.log("pushValue-----------", pushValue)
    attendance.status.push(pushValue);
    const updatedAttendance = await attendance.save();

    if (!updatedAttendance) throw msg.notSaved;

    updatedAttendance.status = updatedAttendance.status[updatedAttendance.status.length - 1];
    delete updatedAttendance.leaveApplication;

    return updatedAttendance;
};


///-----------------------EMPLOYEE MANAGEMENT------------------------------//

const registerEmployee = async (user, body, files) => {
    if (user.roleId > 3 && user.roleId < 1) throw msg.actionForbidden;
    let data = {}
    if (body.roleId == 1 || body.roleId == 2) throw "you have not authorized to add these roles"


    body.document = {};

    delete body.docNumber
    delete body.docType;

    if (!body.email) throw msg.emailRequired;
    let school = await School.findOne({ registeredBy: user._id });
    if (!school) throw msg.noshoolregisterd;

    const professionalDetails = {
        totalExperince: body.ProfessionalDetails.totalExperince,
        lastSalary: body.ProfessionalDetails.lastSalary,
        currentCTC: body.ProfessionalDetails.currentCTC,
        previousOrg: body.ProfessionalDetails.previousOrg,
    }

    const fatherinfo = {
        name: body.fatherInfo.name,
        phone: body.fatherInfo.phone,
        occupation: body.fatherInfo.occupation,
        email: body.fatherInfo.email,
        password: body.fatherInfo.password,
        income: body.fatherInfo.income,
        motherTongue: body.fatherInfo.motherTongue,
        bloodGroup: body.fatherInfo.bloodGroup,
        docType: body.fatherInfo.docType
    }
    const spouseinfo = {
        name: body.spouseInfo.name,
        phone: body.spouseInfo.phone,
        occupation: body.spouseInfo.occupation,
        email: body.spouseInfo.email,
        password: body.spouseInfo.password,
        income: body.spouseInfo.income,
        motherTongue: body.spouseInfo.motherTongue,
        bloodGroup: body.spouseInfo.bloodGroup,
        docType: body.spouseInfo.docType
    }
    const motherinfo = {
        name: body.motherInfo.name,
        phone: body.motherInfo.phone,
        occupation: body.motherInfo.occupation,
        email: body.motherInfo.email,
        password: body.motherInfo.password,
        income: body.motherInfo.income,
        motherTongue: body.motherInfo.motherTongue,
        bloodGroup: body.motherInfo.bloodGroup,
        docType: body.motherInfo.docType,
        // address: body.motherInfo.address
    }

    let result = await User.findOne({ email: body.email });
    if (result) throw msg.duplicateEmail;
    let ciphertext = CryptoJS.AES.encrypt(
    /*PASSWORD_FOR_TEACHER*/'Demo@1234',
        process.env.secret_key
    ).toString();
    body.password = ciphertext;

    if (files.profileImage) body.profileImage = files.profileImage[0].key
    // if (files.profile) body.profile = files.profile[0].key

    if (files.certificate) body.certificate = files.certificate[0].key
    if (files.documents) body.documents = files.documents[0].key



    if (files['tenthMarksheetURL']) {
        body['document']['tenthMarksheetURL'] = files['tenthMarksheetURL'][0].key;
    }
    if (files['twelthMarksheetURL']) {
        body['document']['twelthMarksheetURL'] = files['twelthMarksheetURL'][0].key;
    } if (files['studentIdentityDocURL']) {
        body['document']['studentIdentityDocURL'] = files['studentIdentityDocURL'][0].key;
    } if (files['birthCertificateURL']) {
        body['document']['birthCertificateURL'] = files['birthCertificateURL'][0].key;
    } if (files['medicalCertificateURL']) {
        body['document']['medicalCertificateURL'] = files['medicalCertificateURL'][0].key;
    } if (files['admitcardURL']) {
        body['document']['admitcardURL'] = files['admitcardURL'][0].key;
    } if (files['migrationCertificateURL']) {
        body['document']['migrationCertificateURL'] = files['migrationCertificateURL'][0].key;
    } if (files['reportCardURL']) {
        body['document']['reportCardURL'] = files['reportCardURL'][0].key;
    } if (files['extraCurricularCertifcateURL']) {
        body['document']['extraCurricularCertifcateURL'] = files['extraCurricularCertifcateURL'][0].key;
    } if (files['profileImageURL']) {
        body['document']['profileImageURL'] = files['profileImageURL'][0].key;
    }

    body.firstName = body.firstName
    body.lastName = body.lastName
    body.gender = body.gender
    body.email = body.email
    body.roleId = body.roleId

    body.DOB = body.DOB
    body.phone = body.phone
    body.designation = body.designation
    body.maritalStatus = body.maritalStatus

    body.healthIssues = body.healthIssues
    body.physicalDisable = body.physicalDisable
    body.roleId = body.roleId
    body.bloodGroup = body.bloodGroup

    body.school = school._id
    body.active = body.active
    body.qualification = body.qualification
    body.experience = body.experience
    body.employmentType = body.employmentType
    body.active = body.active
    body.role = body.role || 'Receptionist'
    body.professionalDetails = professionalDetails
    body.fatherInfo = fatherinfo
    body.motherInfo = motherinfo
    body.spouseInfo = spouseinfo

    let employeeInfo = new User(body);

    let res = await employeeInfo.save();
    if (!res) throw msg.NotCreated;

    return {
        result: res
    }
}

let loginEmployee = async (body) => {
    console.log(body)
    if (!body.email) throw msg.invalidEmail;
    if (!body.password) throw msg.passwordRequired;
    let res = await User.findOne({ email: body.email });
    // console.log("res=======>>", res)
    if (!res) throw msg.userNotFound;
    if (res.roleId < 15) throw "you are not Authorised to login."
    let ciphertext = CryptoJS.AES.decrypt(res.password, process.env.secret_key).toString(CryptoJS.enc.Utf8);
    console.log("ciphertext", ciphertext);
    if (ciphertext == body.password) {



        if (body.rememberMe === true) {
            let dd = body.rememberMe
            console.log("dd----------", dd)
            let rememberData = await User.findOneAndUpdate({ email: body.email }, { $set: { rememberMe: body.rememberMe } }, { new: true })
            console.log("rememberData----------", rememberData)
            // Set a long-lived cookie or store the user's ID in local storage for future logins
            // Example: Set a cookie with the user's ID
            // setCookie('rememberedUserID', res.id, { expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) });
            return {
                res: rememberData,
                token: await generateAuthToken(res),
                message: msg.success
            }
        } else {
            let dd = body.rememberMe
            let rememberData = await User.findOneAndUpdate({ email: body.email }, { $set: { rememberMe: dd } }, { new: true })
            return {
                res: rememberData,
                token: await generateAuthToken(res),
                message: msg.success
            }
        }

        // return {
        //   res: res,
        //   token: await generateAuthToken(res),
        //   message: msg.success
        // }
    }
    throw msg.incorrectPassword;
}

const getNonAcademicEmployeeList = async (user, body, query) => {
    if (user.roleId > 3 && user.roleId < 1) throw msg.actionForbidden;

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const sortKey = query.sortKey || 'name';
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;

    let nonAcademicStaffList = await User.aggregate([
        { $match: { roleId: { $gte: 33 } } },
        { $sort: { [sortKey]: sortOrder } }
    ]).skip(skip).limit(limit);

    if (!nonAcademicStaffList) throw "No Record Found";

    // Query for getting the total count
    let totalCount = await User.countDocuments({ roleId: { $gte: 33, $lte: 59 } });

    return {
        count: totalCount,
        result: nonAcademicStaffList
    }
}

const getAcademicEmployeeList = async (user, body, query) => {
    if (user.roleId > 3 && user.roleId < 1) throw msg.actionForbidden;
    const page = parseInt(query.page)
    const limit = 10;
    const skip = (page - 1) * limit;
    const sortKey = query.sortKey || 'name';
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;

    // Query for getting the paginated results
    let nonAcademicStaffList = await User.aggregate([
        { $match: { roleId: { $gt: 2, $lt: 33 } } },
        { $sort: { [sortKey]: sortOrder } },
    ]).skip(skip).limit(limit);

    if (!nonAcademicStaffList) throw "No Record Found";

    // Query for getting the total count
    let totalCount = await User.countDocuments({ roleId: { $gt: 2, $lt: 33 } });

    return {
        count: totalCount,
        result: nonAcademicStaffList
    }
}



//GetTotalEmployee
//GetTotalAcademicEmployee
//GetTotalNonAcademicEmployee
const getEmployeeCounts = async (user, body, query) => {
    try {
        if (user.roleId > 3 && user.roleId < 1) throw msg.actionForbidden;

        // const page = parseInt(query.page, 10) || 1;
        // const limit = parseInt(query.limit, 10) || 10;
        // const skip = (page - 1) * limit;

        const sortKey = query.sortKey || 'firstName';
        const sortOrder = query.sortOrder === 'desc' ? -1 : 1;

        let academicEmployees = await User.aggregate([
            { $match: { roleId: { $gte: 3, $lt: 33 } } },
            { $sort: { [sortKey]: sortOrder } },
            // {$skip: skip}, 
            // {$limit: limit}
        ]);

        let nonAcademicEmployees = await User.aggregate([
            { $match: { roleId: { $gte: 33, $lte: 59 } } },
            { $sort: { [sortKey]: sortOrder } },
            // {$skip: skip}, 
            // {$limit: limit}
        ]);

        const totalCounts = academicEmployees.length + nonAcademicEmployees.length

        const result = {

            academicEmployees: academicEmployees.length,
            nonacademicEmployees: nonAcademicEmployees.length,
            totalEmployees: totalCounts
        }


        return result

    }
    catch (err) {
        console.error(err)

        return {
            err
        }
    }
}

//GetAcademicAndNonAcademicList Not in Use
const getEmployeeList = async (user, body, query) => {
    try {
        if (user.roleId > 3 && user.roleId < 1) throw msg.actionForbidden;

        const page = parseInt(query.page, 10) || 1;
        const limit = parseInt(query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const sortKey = query.sortKey || 'firstName';
        const sortOrder = query.sortOrder === 'desc' ? -1 : 1;


        let academicEmployees = await User.aggregate([
            { $match: { roleId: { $gte: 3, $lt: 33 } } },
            { $sort: { [sortKey]: sortOrder } },
            // {$skip: skip}, 
            // {$limit: limit}
        ]).skip(skip).limit(limit);;

        let nonAcademicEmployees = await User.aggregate([
            { $match: { roleId: { $gte: 33, $lte: 59 } } },
            { $sort: { [sortKey]: sortOrder } },
            // {$skip: skip}, 
            // {$limit: limit}
        ]).skip(skip).limit(limit);

        let response = {
            academicEmployees: academicEmployees,
            nonAcademicEmployees: nonAcademicEmployees
        };

        return {
            result: response
        }
    }
    catch (err) {
        console.error(err)

        return {
            err
        }
    }
}

const searchEmployeesByAdmin = async (user, data) => {
    try {
        let ress = await User.find({
            $or: [
                { roleId: { $gte: 3, $lt: 59 }, school: user.school, "firstName": { $regex: data.key, $options: "i" } },
                { roleId: { $gte: 3, $lt: 59 }, school: user.school, "phone": { $regex: data.key, $options: "i" } },
                { roleId: { $gte: 3, $lt: 59 }, school: user.school, "email": { $regex: data.key, $options: "i" } },
                { roleId: { $gte: 3, $lt: 59 }, school: user.school, "address.state": { $regex: data.key, $options: "i" } },
                { roleId: { $gte: 3, $lt: 59 }, school: user.school, "fatherInfo.email": { $regex: data.key, $options: "i" } },
                { roleId: { $gte: 3, $lt: 59 }, school: user.school, "fatherInfo.phone": { $regex: data.key, $options: "i" } },
                { roleId: { $gte: 3, $lt: 59 }, school: user.school, "motherInfo.email": { $regex: data.key, $options: "i" } },
                { roleId: { $gte: 3, $lt: 59 }, school: user.school, "motherInfo.phone": { $regex: data.key, $options: "i" } },
            ]
        })

        if (!ress.length) {

            throw msg.NotExist;
        } else {
            const results = [...ress]
            return {
                msg: msg.success,
                count: results.length,
                result: results
            }
        }
    }
    catch (err) {
        return err
    }
}

const getSalaryManagementInfo = async (user, body, query) => {
    try {
        console.log("school-------", user.school);
        if (user.roleId < 1 || user.roleId > 3) throw msg.actionForbidden;

        let Data = await User.aggregate([
            { $match: { roleId: { $gte: 1, $lte: 59 }, school: mongoose.Types.ObjectId(user.school) } },
            {
                $group: {
                    _id: null,
                    sumOfCTC: { $sum: "$currentCTC" },
                    totalEmployees: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,

                }
            }
        ]);

        const paymentDate = 1;
        const paymentMonth = new Date().getMonth() + 1;
        const paymentYear = new Date().getFullYear();

        Data[0].paymentDate = `${paymentDate}/${paymentMonth}/${paymentYear}`





        return { Data: Data };
    } catch (err) {
        console.log(err);
        return err;
    }
};


const getAttendanceOfAllNonAcademicStaff = async (query, user) => {

    if (!query.date) {
        previous = moment(new Date()).startOf('day');
        next = moment(new Date()).add(1, 'days').startOf('day');
    }
    else {
        previous = moment(new Date(query.date)).startOf('day');
        next = moment(new Date(query.date)).add(1, 'days').startOf('day');
    }

    const school = await School.findOne({ registeredBy: user._id });

    const foundSupportStaff = await Attendance.find({ schoolId: school._id }, { leaveApplication: 0 }).populate({ path: 'supportStaff', select: 'name email' }).sort({ 'createdAt': -1 });

    // return 'Working'
    const allsupportStaffList = await User.find({ school: school._id, roleId: { $gte: 33, $lte: 59 } /*,role : "Teacher"*/ }).populate({ path: '_id', select: 'name email' }).sort({ 'createdAt': -1 });

    // return {allsupportStaffList}
    const result = foundSupportStaff.filter((o) => {
        if (o.supportStaff) return true
    })


    const filteredsupportStaff = result.filter((o) => {
        for (const iterator of o.status) {
            if (new Date(iterator.day) < next && new Date(iterator.day) >= previous) {
                o.status = iterator;
                return true;
            }
        }
        return false;
    })


    var presentCount = 0;
    var absentCount = 0;
    var leaveCount = 0;
    var notMarked = 0;
    for (const o of filteredsupportStaff) {
        if (o.status[0].status == 'Present') { presentCount++; }
        else if (o.status[0].status == 'Absent') { absentCount++; }
        else if (o.status[0].status == 'Leave') { leaveCount++; }
        else { notMarked++; }

    }
    const foundAllsupportStaff = await Attendance.find({ schoolId: school._id, });
    const totalsupportStaff = foundAllsupportStaff.filter((o) => {
        if (o.supportStaff) return true
    })
    return {
        presentCount: presentCount,
        absentCount: absentCount,
        leaveCount: leaveCount,
        notMarked: allsupportStaffList.length - filteredsupportStaff.length,
        presentPercentage: presentCount * 100 / totalsupportStaff.length,
        totalsupportStaff: allsupportStaffList.length,
        result: filteredsupportStaff,
    };
}

const getallsupportstaff = async (user, body, query) => {
    const { page } = query;
    const skip = (page - 1) * 10;
    const limit = 10;

    try {
        const totalSupportStaff = await User.countDocuments({ roleId: { $gte: 33, $lte: 59 } });
        const supportStaff = await User.find({ roleId: { $gte: 33, $lte: 59 } }).skip(skip).limit(limit);

        if (supportStaff.length === 0) {
            const data = {
                total: 0,
                count: 0,
                result: []
            }
            return data
        }

        return {
            total: totalSupportStaff,
            count: supportStaff.length,
            result: supportStaff
        };
    } catch (error) {
        throw error;
    }
};

const getTodayPresentSupportStaffList = async (user, body, query) => {
    const { page } = query
    const limit = 10
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const skip = (page - 1) * limit;

    try {
        const presentTeachers = await Attendance.aggregate([
            {
                $match: {
                    schoolId: mongoose.Types.ObjectId(user.school)
                    , supportStaff: { $exists: true }
                }
            },
            { $unwind: '$status' },
            { $match: { 'status.day': { $gte: today } } },
            { $match: { 'status.status': 'Present' } },
            { $skip: skip },
            { $limit: limit }
        ]);
        return { msg: 'success', data: presentTeachers, count: presentTeachers.length };
    } catch (error) {
        console.error('Error getting present teachers:', error);
        return { msg: 'error', error };
    }
};

const getTodayAbsentSupportStaffList = async (user, body, query) => {
    const { page } = query
    const limit = 10
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const skip = (page - 1) * limit;

    try {
        const absentTeachers = await Attendance.aggregate([
            {
                $match: {
                    schoolId: mongoose.Types.ObjectId(user.school)
                    , supportStaff: { $exists: true }
                }
            },
            { $unwind: '$status' },
            { $match: { 'status.day': { $gte: today } } },
            { $match: { 'status.status': 'Absent' } },
            { $skip: skip },
            { $limit: limit }
        ]);
        return { msg: 'success', data: absentTeachers, count: absentTeachers.length };
    } catch (error) {
        console.error('Error getting absent teachers:', error);
        return { msg: 'error', error };
    }
};

const getTodayLeaveSupportStaffList = async (user, body) => {
    // Assuming 'db' is your database connection and 'teachers' is your collection
    // return { user }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const OnLeave = await Attendance.aggregate([
            { $match: { schoolId: mongoose.Types.ObjectId(user.school) } },
            // { $unwind: '$leaveApplication' },
            { $match: { 'leaveApplication.status': 'Applied' } },
            // {
            //   $group: {
            //     _id: teachedId, // or some grouping criteria if needed
            //     // totalApplied: { $sum: 1 },
            //     // data: { $push: '$$ROOT' }
            //   }
            // }
        ]);


        return { msg: 'success', data: OnLeave };
    } catch (error) {
        console.error('Error getting present teachers:', error);
        return { msg: 'error', error };
    }
};

const getTodayNotMarkedSupportList1 = async (user, body, query) => {
    try {
        const { page } = query
        const pageSize = 10
        let allTeachers = await User.find({ roleId: { $gte: 33, $lte: 59 } });
        if (allTeachers.length == 0) throw msg.teacherNotFound;

        const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format

        const notMarkedAttendanceToday = await Attendance.aggregate([
            {
                $match: {
                    schoolId: mongoose.Types.ObjectId(user.school)
                    , supportStaff: { $exists: true }
                }
            },
            { $unwind: '$status' },
            { $match: { 'status.day': { $ne: today } } },
            { $group: { _id: '$supportStaff', statuses: { $push: '$status' } } },
        ]);

        const currentDate = today;
        const notMarkedOne = [];
        const notMarkedOnesupportStaff = [];

        notMarkedAttendanceToday.forEach((item) => {
            const hasMarked = item.statuses.some((res) => {
                const dayAsString = new Date(res.day).toISOString().split('T')[0];
                return dayAsString === currentDate;
            });
            if (!hasMarked) {
                notMarkedOne.push(item._id);
            }
        });

        const skip = (page - 1) * pageSize;
        const paginatedTeachers = allTeachers.slice(skip, skip + pageSize);

        paginatedTeachers.forEach((teacher) => {
            if (notMarkedOne.includes(teacher._id)) {
                notMarkedOnesupportStaff.push(teacher);
            }
        });

        return { notMarkedOnesupportStaff };
    } catch (error) {
        console.error('Error getting not marked teachers:', error);
        return { msg: 'error', error };
    }
};

const getTodayNotMarkedSupportList = async (user, body, query) => {
    try {
        const { page } = query;
        const pageSize = 10;
        let allTeachers = await User.find({ roleId: { $gte: 33, $lte: 59 } });
        if (allTeachers.length === 0) throw new Error("Teacher not found");

        const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format

        const notMarkedAttendanceToday = await Attendance.aggregate([
            {
                $match: {
                    schoolId: mongoose.Types.ObjectId(user.school),
                    supportStaff: { $exists: true }
                }
            },
            { $unwind: '$status' },
            { $match: { 'status.day': { $ne: today } } },
            { $group: { _id: '$supportStaff', statuses: { $push: '$status' } } },
        ]);

        const currentDate = today;
        const notMarkedOne = [];
        const notMarkedOnesupportStaff = [];

        notMarkedAttendanceToday.forEach((item) => {
            const hasMarked = item.statuses.some((res) => {
                const dayAsString = new Date(res.day).toISOString().split('T')[0];
                return dayAsString === currentDate;
            });
            if (!hasMarked) {
                notMarkedOne.push(item._id);
            }
        });

        let paginatedTeachers = [];
        if (page) {
            const skip = (page - 1) * pageSize;
            paginatedTeachers = allTeachers.slice(skip, skip + pageSize);
        } else {
            paginatedTeachers = allTeachers;
        }

        paginatedTeachers.forEach((teacher) => {
            if (notMarkedOne.includes(teacher._id)) {
                notMarkedOnesupportStaff.push(teacher);
            }
        });

        return { msg: "ok", count: notMarkedOnesupportStaff.length, notMarkedOnesupportStaff };
    } catch (error) {
        console.error('Error getting not marked teachers:', error);
        return { msg: 'error', error };
    }
};


const facultyRoleslist = async (user, body, query) => {
    try {
        const rolesObject = {
            0: "Student",
            1: "Admin",
            2: "Principal",
            3: "Teacher",
            4: "Vice-Principal",
            5: "Teaching-Assistant",
            6: "Head-Teacher",
            7: "Sports-Coach",
        };

        return rolesObject

    } catch (err) {
        return err
    }
}
const supportStaffRoleslist = async (user, body, query) => {
    try {
        const rolesObject = {
            33: "Receptionist",
            34: "Bus Driver",
            35: "Cafeteria Worker",
            36: "Data Entry Clerk",
            37: "Health Aide",
        };



        return rolesObject

    } catch (err) {
        return err
    }
}


module.exports = {
    emailVerify, sendOTP, register, login, homeVariable, registerTeacher,
    updateAccount, updateTeacher, getClassTeacher, getTeacher, getSectionById,
    uploadTeacherDoc, sendOTPForForgotPassword, updatepassword,
    approveLeave, getAttendanceOfAllTeachers, teachersOnLeave,
    searchAttendanceOfStudents, getAttendanceOfStudent,
    getAttendanceOfClassAndSection, getLeaveById, getAttendanceByDate,
    uplodImage, getteacherShortDeatils, teacherDeatils,
    uploadAttachment, myProfile, updateUserProfile, userAllReadyExits,

    // school management -------for employees
    registerEmployee,  //Done
    loginEmployee,    //Done
    getNonAcademicEmployeeList,
    getAcademicEmployeeList,
    getEmployeeCounts,

    employeesManagementHomeVariable,
    searchAcademicEmployees,
    searchNonAcademicEmployeesByAdmin,
    employeesManagementList,
    markEmployeeAttendanceByAdmin,
    getEmployeeList,
    searchEmployeesByAdmin,


    //EmployeMangement
    getSalaryManagementInfo,


    //Attendance Management
    getAttendanceOfAllNonAcademicStaff,
    getallsupportstaff,
    getTodayPresentSupportStaffList,
    getTodayAbsentSupportStaffList,
    getTodayLeaveSupportStaffList,
    getTodayNotMarkedSupportList,


    //Roles List

    facultyRoleslist,
    supportStaffRoleslist
};