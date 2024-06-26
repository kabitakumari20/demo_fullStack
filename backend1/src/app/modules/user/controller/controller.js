const { query } = require("express");

let { register, getAdminList, login } = require("../services/admin")
let { registerStudentByAdmin,
    getStudentList,
    getStudentById,
    updateStudentById,
    deleteStudentById,
    searchStudentByAdmin } = require("../services/student")

// 
// student routs 
exports.registerStudentByAdmin = async req => await registerStudentByAdmin(req.user, req.body);
exports.register = async req => await register(req.body);
exports.login = async (req) => await login(req.body)
exports.getStudentList = async req => await getStudentList();
exports.getStudentById = async req => await getStudentById(req.user, req.params.id)
exports.updateStudentById = async req => await updateStudentById(req.user, req.params.id, req.body)
exports.deleteStudentById = async (req) => await deleteStudentById(req.user, req.params.id)
exports.getAdminList = async req => await getAdminList();//
exports.searchStudentByAdmin = async req => await searchStudentByAdmin(req.body);//





