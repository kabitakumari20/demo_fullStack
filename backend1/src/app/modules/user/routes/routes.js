let express = require('express');
let router = express.Router(),
    {
        sendOTP,
        emailVerify,
        register,
        getAdminList, login,
        registerStudentByAdmin,
        getStudentList,
        getStudentById,
        updateStudentById,
        deleteStudentById,
        searchStudentByAdmin
    } = require("../controller/controller");


const { authenticate, teacherAuthenticate } = require('../../../middlewares/jwt.middleware');
const { wrapAsync } = require("../../../helpers/router.helper");
// const { upload } = require("../../../util/multer-s3");




//Routes is Working Added By manvi.
router.post('/sendotp', wrapAsync(sendOTP));
router.post('/emailVerify', wrapAsync(emailVerify));
router.post('/register', wrapAsync(register));
router.post('/login', wrapAsync(login));
router.get("/getAdminList", wrapAsync(getAdminList))

// student routes 

router.post('/registerStudentByAdmin', authenticate, wrapAsync(registerStudentByAdmin));
router.get("/getStudentList", authenticate, wrapAsync(getStudentList))
router.get("/getStudentById/:id", authenticate, wrapAsync(getStudentById))
router.put("/updateStudentById/:id", authenticate, wrapAsync(updateStudentById))
router.delete("/deleteStudentById/:id", authenticate, wrapAsync(deleteStudentById))//
router.post("/searchStudentByAdmin", authenticate, wrapAsync(searchStudentByAdmin))//




module.exports = router;

