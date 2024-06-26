const { mongoose, Schema } = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
var connection = mongoose.createConnection(process.env.MONGODB_URI);
const jwt = require("jsonwebtoken");
const { msg } = require("../../../../config/message");


const { generateId } = require("../../../util/generateId");
const { stringify } = require("querystring");
// const secret = process.env.secret_token;
let secret = "yrtuytytystyfytdsyy"

autoIncrement.initialize(connection);
const AddressSchema = new mongoose.Schema(
  {
    typeOfAddress: {
      type: String,
      enum: ["Present", "Permanent", "Temporary"],
      default: "Permanent",
    },
    addressline1: String,
    addressline: String,
    addressline2: String,
    landmark: String,
    city: String,
    state: String,
    pincode: Number,
    country: String,
  },
  { _id: false }
);

// const fatherSchema = new mongoose.Schema(
//   {
//     name: String,
//     password: String,
//     phone: String,
//     email: {
//       type: String,
//       // unique: true
//     },
//     otp: {
//       type: String,
//       // default: 0,
//     },
//     otp2: {
//       type: String,
//       // default: 0,
//     },
//     isEmailVerified: {
//       default: false,
//       type: Boolean,
//     },
//     walletAmount: {
//       type: Number,
//       default: 0
//     },
//     occupation: String,
//     docType: String,
//     docNo: String,
//     doc: String,
//     income: String,
//     motherTongue: String,
//     bloodGroup: String,
//     profile: {
//       type: String,
//       // default: "event/event/1691477541429.jpg"
//     },
//   },
//   { _id: false }
// );

// const motherSchema = new mongoose.Schema(
//   {
//     name: String,
//     password: String,
//     lastname: String,
//     phone: String,
//     email: {
//       type: String,
//       // unique: true
//     },
//     otp: {
//       type: String,
//       // default: 0,
//     },
//     otp2: {
//       type: String,
//       // default: 0,
//     },
//     isEmailVerified: {
//       default: false,
//       type: Boolean,
//     },
//     walletAmount: {
//       type: Number,
//       default: 0
//     },
//     occupation: String,
//     docType: String,
//     docNo: String,
//     doc: String,
//     income: String,
//     motherTongue: String,
//     bloodGroup: String,
//     // address: [AddressSchema],
//     profile: {
//       type: String,
//       // default: "event/event/1691477541429.jpg"
//     },
//   },
//   { _id: false }
// );

// const documentSchema = new mongoose.Schema(
//   {
//     tenthMarksheetURL: String,
//     twelthMarksheetURL: String,
//     // studentIdentityDocType: String,
//     studentIdentityDocURL: String,
//     birthCertificateURL: String,
//     medicalCertificateURL: String,
//     admitcardURL: String,
//     migrationCertificateURL: String,
//     reportCardURL: String,
//     extraCurricularCertifcateURL: String,
//     // profileImageURL: String
//   },
//   { _id: false }
// );

const ProfessionalSchema = new mongoose.Schema(
  {
    totalExperince: String,
    acadmicQualification: [],
    specilityIn: String,
    // classId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Class',
    // },
    className: String,
    // specilityIn: String,
    certificate: String,
    hightsQualification: String,
  },
  { _id: false }
);

// const SchoolDetailsSchema = new mongoose.Schema({
//   // schooleName: String,/
//   schoolId: String,
//   // principaleName: String,
//   // schoolContactNum: String,
//   // schollAddress: []
// }, { _id: false })

const roleIdEnum = {
  Student: 0,
  //  Academic Staff
  "Admin": 1,
  "Principal": 2,
  "Teacher": 3,
};

const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    studentId: String,
    gender: {
      type: String,
      // enum: ["male", "female", "other"],
      //required-Bhavnesh
    },
    DOB: {
      type: String, //Date of birth
    },
    phone: {
      type: String,
    },

    otp: {
      type: String,
      default: 0,
    },
    otp2: {
      type: String,
      default: 0,
    },
    walletAmount: {
      type: Number,
      default: 0
    },
    birthCertificate: String,
    migrationCertificate: String,
    extraCurricularCertificate: String,
    reportCard: String,
    admitCard: String,
    profileImages: {
      type: String,
      default: "parent/Profile/1704881215000.png",
    },
    profileImage: String,
    isPhoneVerified: {
      default: false,
      type: Boolean,
    },
    createdBy: {
      type: Number,
      ref: "User"
    },
    assingdBy: {
      type: Number,
      ref: "User"
    },
    // phone: {
    //   type: String,
    //   index: true,
    //   required: true,
    //   unique: true,
    // },
    isEmailVerified: {
      default: false,
      type: Boolean,
    },
    email: {
      type: String,
      index: true,
      required: true,
      unique: true,
    },
    previousOrg: {
      type: String,
    },
    previousOrgNumber: {
      type: String,
    },
    previousOrgDur: {
      fromDate: String,
      toDate: String,
    },
    lastSalary: {
      type: Number,
    },
    currentCTC: {
      type: Number,
    },
    addressline: String,
    city: String,
    state: String,
    country: String,
    admissionNumber: String,
    busNumber: String,
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transportBusDeatils",
      // default: 0
    },
    schoolName: String,
    password: {
      type: String,
    },
    address: [AddressSchema],
    active: {
      type: Boolean,
      default: false,
    },
    deaeration: {
      type: String,
    },
    department: {
      type: Array,
      // enum:["Pre",
      // "Primary",
      // "Secondary",
      // "Heigher Secondary",
      // "Senior Secondary"]
      default: [
        "Pre",
        "Primary",
        "Secondary",
        "Heigher Secondary",
        "Senior Secondary",
      ],
    },
    latePanchIng: {
      type: String,
    },
    onTimePanchIng: {
      type: String,
    },
    delayTime: {
      type: String,
    },
    workingHours: {
      type: String,
    },
    rememberMe: {
      type: Boolean,
      default: false,
    },
    previousOrg: {
      type: String,
    },

    previousOrgDur: {
      fromDate: String,
      toDate: String,
    },
    documents: String,
    designation: {
      type: String,
      enum: [
        "Student",
        "Admin",
        "Principal",
        "Teacher",

      ],
      // default: "Teacher"
    },
    maritalStatus: {
      type: String,
      enum: ["married", "unmarried"],
    },
    category: {
      type: String,
      enum: ["General", "SC", "ST", "OBC"],
    },
    nationality: String,
    addressline2: String,
    healthIssues: String,
    physicalDisable: {
      type: String,
      default: false,
    },
    armyPerson: {
      type: String,
      // enum: ["yes", "no"]
    },
    scholar: {
      type: String,
      // enum: ["yes", "no"]
    },
    povertyLine: {
      type: String,
    },
    active: {
      type: Boolean,
      default: false,
    },
    teachingExperience: {
      type: String,
    },
    employementType: {
      type: String,
    },

    // profile: {
    //   type: String,
    //   // default: "S2S/Banners/1687851876483.png",
    // },
    // tenthMarksheetURL: { type: String },
    roleId: {
      type: Number,

      enum: [
        0, 1, 2, 3,],
      default: 0,
    },
    otpDate: {
      type: Date,
    },
    otpDate2: {
      type: Date,
    },
    bloodGroup: {
      type: String,
    },
    // document: documentSchema,
    // lastLogin: Date,
    socialId: { type: String },
    EmergencyContactNumber: Number,
    zipCode: String,
    blockedByAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "Student",
      enum: [
        "Student",
        "Admin",
        "Principal",
        "Teacher",
        "Vice-Principal",
        "Teaching-Assistant",
        "Head-Teacher",
        "Sports-Coach",
        "School-Bus-Driver",
        "Special-Education-Teacher",
        "Registrar",
        "Athletic-Director",
        "Crossing-Guard",
        "Academic Coach",
        "Academic Dean",
        "Career Counselor",
        "Curriculum Coordinator",
        "Educational Specialist",
        "Foreign Language Teacher",
        "Instructional Designer",
        "Math Specialist",
        "Professional",
        "Reading Specialist",
        "Research and Development Specialist",
        "School Counselor",
        "School Librarian",
        "School Psychologist",
        "Special Education Specialist",
        "Speech-Language Pathologist",
        "Sport Coach",
        "Teacher Aide",
        "Testing and Assessment Coordinator",
        "Receptionist",
        "Budget Analyst",
        "Administrative Assistant",
        "Bus Driver",
        "Cafeteria Worker",
        "Community Outreach Coordinator",
        "Custodian",
        "Data Entry Clerk",
        "Guidance Counselor",
        "Health Aide",
        "IT Technician",
        "Janitor",
        "Kitchen Staff",
        "Librarian",
        "Library Assistant",
        "Maintenance Worker",
        "Principal's Secretary",
        "Public Relations Coordinator",
        "Record Clerk",
        "School Nurse",
        "School Resource Officer",
        "Security Guard",
        "Social Worker",
        "Technology Support Specialist",
        "Transportation Coordinator",
        "Accountant",
        "Psychologist"
      ]
    },
    registerdBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    section: {
      type: {},
    },
    className: {
      type: String,
    },
    sectionName: {
      type: String,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    }, //subjectId
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
    },
    qualification: String,
    certificate: String,
    roleNo: Number,
    experience: String,
    employmentType: String,
    // designation: String,
    ProfessionalDetails: [ProfessionalSchema],
    // SchoolDetails: SchoolDetailsSchema,
    // --------Saurabh---------for banner
    // images: {
    //   type: Array,
    // },
    // spouseInfo: spouseSchema,
    // fatherInfo: fatherSchema,
    // motherInfo: motherSchema,
    guardianName: String,
    guardianNo: String,
    gurdianEmergencyNo: String,
    admissionDate: {
      type: Date,
      default: new Date(),
    },
    isMigratedStudent: {
      type: String,
      // default: false,   //Using same Model in EmployeManagement for Adding Teacher and Non-Academic Staff
    },
    studentIdentityDocType: String,
    studentIdentityDocData: String,

    studentIdentityDocNo: {
      type: String,
      unique: true,
      sparse: true,
    },
    migratedSchoolName: String,
    lastClass: String,
    boardRollNo: String,
    emailconscent: {
      type: Boolean,
      // default: false,   //Using same Model in EmployeManagement for Adding Teacher and Non-Academic Staff
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,

        ref: "User",
      },
    ],
    // lastActivityTime:Date
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.statics.findByToken = function (token, res) {
  var user = this;
  var decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (e) {
    throw e.message || "Unauthorised request";
  }
  return User.findOne({
    _id: decoded._id,
  })
    .then((user) => {
      if (!user) {
        return Promise.reject({ message: msg.unauthorisedRequest });
      } else {
        return Promise.resolve(user);
      }
    })
    .catch((e) => {
      throw msg.unauthorisedRequest;
    });
};

UserSchema.pre("save", async function (next) {
  if (this.roleId == 0) {
    var studentId = generateId();
    let studentIdexist = await User.find({ studentId: studentId });
    if (studentIdexist) {
      studentId = generateId();
    }
    this.studentId = studentId;
    next();
    if (this.password) {
      this.password = CryptoJS.AES.encrypt(
        this.password,
        secret
      ).toString();
      next();
    } else {
      next();
    }
  } else {
    next();
  }
});

const User = new mongoose.model("User", UserSchema);
User.syncIndexes();

module.exports = { User };
