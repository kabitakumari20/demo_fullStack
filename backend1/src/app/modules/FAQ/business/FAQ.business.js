const { FAQ } = require('../model/FAQ.model');
const { msg } = require("../../../../config/message");
var moment = require('moment');
const fs = require('fs');
const xlsx = require('xlsx');
const { User } = require('../../user/model/user.model')
var mongoose = require('mongoose');
const { Translate } = require('@google-cloud/translate').v2;

const projectId = 'idyllic-creek-406510'; // Replace with your actual project ID
const apiKey = "AIzaSyBw7lUNtV2a7nnUEmUQ2JLlnCAOfTz2lj0"//"AIzaSyCJbAIEZjz9KHGe8m43OzbS1FsU2DL1qz0"//'AIzaSyAFqiWa9KxA7G_bMQNXVu9tMdpBXvpqNgk'; // Replace with your actual API key

const translate = new Translate({ projectId, key: apiKey });
const { result } = require('lodash');
//post FAQ 
var postFAQ = async (data, user) => {
    // APPLY CONDITION ONLY FOR ADMIN and superAdmin
    data.userId = user._id;
    let Faq = new FAQ(data);
    let res = await Faq.save();
    if (!res) throw msg.NotCreated;
    return {
        result: res,
        message: msg.success
    }

};

//Get FAQ (All)
var getFAQ1 = async (user) => {
    let res = await FAQ.find()//.populate('userId', { firstName: 1 });
    // if (roleId == 0) {
    //     let res1 = await FAQ.find({ 'answer': { $exists: true, $ne: null } });
    //     if (!res1) throw msg.NotExist;
    //     return res1;
    // }
    if (!res) throw msg.NotExist;
    return {
        msg: msg.success,
        count: res.length,
        result: res

    }
}

// const getFAQList = async (user) => {
//     let data = await FAQ.find()
//     if (!data) throw msg.notExist
//     return {
//         msg: msg.success,
//         count: data.length,
//         result: data
//     }
// }

// const generateExcelFile = (data) => {
//     console.log("data============>>", data)
//     // Create a new workbook and add a worksheet
//     const wb = xlsx.utils.book_new();
//     const ws = xlsx.utils.json_to_sheet(data);

//     // Add the worksheet to the workbook
//     xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');

//     // Write the workbook to a file
//     const excelFilename = 'output.xlsx';
//     xlsx.writeFile(wb, excelFilename);

//     console.log(`Excel file "${excelFilename}" created successfully.`);
// };

// ...

const generateExcelFile = (data) => {
    // Create a new workbook and add a worksheet
    const wb = xlsx.utils.book_new();

    // Map your data to include only the fields you want in the Excel file
    const excelData = data.map(item => ({
        Question: item.question,
        Answer: item.answer,
        Subject: item.subject,
        Status: item.status,
        UserId: item.userId,
        IsExpanded: item.isExpanded,
    }));

    // Add the worksheet to the workbook
    const ws = xlsx.utils.json_to_sheet(excelData, { header: Object.keys(excelData[0]) });
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Write the workbook to a file
    const excelFilename = 'output1.xls';
    xlsx.writeFile(wb, excelFilename);

    console.log(`Excel file "${excelFilename}" created successfully.`);
};

// const getFAQList = async (query) => {
//     try {
//         // Fetch data from your database (replace this with your actual data fetching logic for the Donation model)
//         let data = await FAQ.find();

//         // Check if data is undefined or has no length
//         if (!data || data.length === undefined) {
//             throw { error: "Data is undefined or has no length", body: "Something went wrong, please try again...", status: 400 };
//         }

//         // Extract the target language from the query parameters ///////
//         const targetLanguage = query.target || 'en'; // Default to 'en' if not provided

//         console.log("Incoming Query:", query);
//         console.log("Target Language:", targetLanguage);

//         // Translate values of specified fields in the 'data' array
//         data = await Promise.all(data.map(async (entry) => {
//             // entry.organizationName = await translateField(entry.organizationName, targetLanguage);
//             // entry.description = await translateField(entry.description, targetLanguage);
//             // entry.title = await translateField(entry.title, targetLanguage);
//             entry.question = await translateField(entry.question, targetLanguage);
//             entry.answer = await translateField(entry.answer, targetLanguage);
//             entry.subject = await translateField(entry.subject, targetLanguage);

//             return entry;
//         }));

//         // Return the response
//         // return { donations: data, translatedResponse: { language: targetLanguage } };
//         return {
//             msg: msg.success,
//             count: data.length,
//             result: data
//         }
//     } catch (error) {
//         // Handle errors and return an error response
//         console.error("Error:", error);
//         return { error: error.error, body: error.body, status: error.status || 500 };
//     }
// };

// const translateField = async (value, targetLanguage) => {
//     try {
//         if (!value || typeof value !== 'string') {
//             return value; // Return the original value if it's not a string or is empty
//         }

//         // Log the original value
//         console.log("Original Value:", value);

//         // If the target language is 'en', return the original text without translation
//         if (targetLanguage.toLowerCase() === 'en') {
//             return value;
//         }

//         // Translate the text to the target language
//         const [translation] = await translate.translate(value, targetLanguage);

//         // Log the translation
//         console.log("Translation:", translation);

//         return translation;
//     } catch (error) {
//         console.error('Translation error:', error.message);
//         console.error('Error details:', error);
//         throw new Error('Translation failed.');
//     }
// };

// // Example usage
// const query = { target: 'zh-cn' }; // Set the target language in the query
// getFAQList(query)
//     .then(response => console.log(response))
//     .catch(error => console.error(error));



// const getFAQList = async (user, query) => {
//     console.log("query===========>>", query)
//     try {
//         let data = await FAQ.find();

//         if (!data || data.length === undefined) {
//             throw { error: "Data is undefined or has no length", body: "Something went wrong, please try again...", status: 400 };
//         }

//         const targetLanguage = query.target || 'en';

//         console.log("Incoming Query:", query);
//         console.log("Target Language:", targetLanguage);

//         data = await Promise.all(data.map(async (entry) => {
//             entry.question = await translateField(entry.question, targetLanguage);
//             entry.answer = await translateField(entry.answer, targetLanguage);
//             // entry.subject = await translateField(entry.subject, targetLanguage);

//             return entry;
//         }));

//         // return {
//         return {
//             msg: msg.success,
//             count: data.length,
//             result: data
//         };
//         // }
//     } catch (error) {
//         console.error("Error:", error);
//         return { error: error.error, body: error.body, status: error.status || 500 };
//     }
// };

// const translateField = async (value, targetLanguage) => {
//     try {
//         if (!value || typeof value !== 'string') {
//             return value;
//         }

//         console.log("Original Value:", value);

//         if (targetLanguage.toLowerCase() === 'en') {
//             return value;
//         }

//         const translation = await translate(value, { to: targetLanguage });

//         console.log("Translation:", translation.text);

//         return translation.text;
//     } catch (error) {
//         console.error('Translation error:', error.message);
//         console.error('Error details:', error);
//         throw new Error('Translation failed.');
//     }
// };

// // Example usage
// const query = { target: 'zh-cn' };
// getFAQList(query)
//     .then(response => console.log(response))
//     .catch(error => console.error(error));




const getFAQList = async (user, query) => {
    try {
        let data = await FAQ.find();

        if (!data || data.length === undefined) {
            throw { error: "Data is undefined or has no length", body: "Something went wrong, please try again...", status: 400 };
        }

        const targetLanguage = query.target || 'en';

        console.log("Incoming Query:", query);
        console.log("Target Language:", targetLanguage);

        data = await Promise.all(data.map(async (entry) => {
            entry.question = await translateField(entry.question, targetLanguage);
            entry.answer = await translateField(entry.answer, targetLanguage);
            entry.subject = await translateField(entry.subject, targetLanguage);

            return entry;
        }));

        return {
            msg: msg.success,
            count: data.length,
            result: data
        }
    } catch (error) {
        console.error("Error:", error);
        return { error: error.error, body: error.body, status: error.status || 500 };
    }
};

const translateField = async (value, targetLanguage) => {
    try {
        if (!value || typeof value !== 'string') {
            return value;
        }

        console.log("Original Value:", value);

        if (targetLanguage.toLowerCase() === 'en') {
            return value;
        }

        const [translation] = await translate.translate(value, targetLanguage);

        console.log("Translation:", translation);

        return translation;
    } catch (error) {
        console.error('Translation error:', error.message);
        console.error('Error details:', error);
        throw ('Translation failed.');
    }
};

// Example usage
// const query = { target: 'zh-cn' }; // You can change this to test different scenarios
// getFAQList(query)
//     .then(response => console.log(response))
//     .catch(error => console.error(error));














const getFAQList1 = async (user, query) => {
    console.log("query==========>>", query)
    try {
        // Fetch FAQ data from the database
        let data = await FAQ.find();

        // Check if the target language is provided in the request body
        const target = query && query.target ? query.target : 'en'; // Default to 'en' if not provided

        // Translate the FAQ data if the target language is not 'en'
        if (target !== 'en') {
            await translateFAQ(data, target);
        }

        // Return the translated FAQ data
        // generateExcelFile(data)
        return {
            msg: msg.success,
            count: data.length,
            result: data
        };
    } catch (error) {
        console.error('Error in getFAQList1:', error.message);
        return {
            msg: msg.error,
            error: error.message
        };
    }
};

async function translateFAQ(data, target) {
    // The target language
    // const target = 'zh-CN'; // No need to hardcode, as it's now taken from the request body

    try {
        for (const item of data) {
            const translatedQuestion = await translateText(item.question, target);
            const translatedAnswer = await translateText(item.answer, target);
            const subject1 = await translateText(item.subject, target);
            const translatedUserIdString = await translateText(item.userId.toString(), target);

            // Update the FAQ item with translated text
            item.question = translatedQuestion;
            item.answer = translatedAnswer;
            item.subject = subject1;

            // Convert the translated userId back to a number
            item.userId = parseInt(translatedUserIdString, 10);
        }

        // Log the updated FAQ items
        console.log(`Translated FAQ items to ${target}:`, data);
    } catch (error) {
        console.error('Error in translateFAQ:', error.message);
        throw ('Translation failed.');
    }
}

async function translateText(text, target) {
    try {
        // Implement your translation logic here
        // For example, you can use the Google Translate API
        if (target === 'en') {
            // If the target language is 'en', return the original text without translation
            return text;
        } else {
            const [translation] = await translate.translate(text, target);
            console.log(`Text: ${text}`);
            console.log(`Translation: ${translation}`);
            return translation;
        }
    } catch (error) {
        console.error('Translation error:', error.message);
        throw ('Translation failed.');
    }
}


var getFaqFilterd = async (roleId, id) => {
    console.log(roleId, id, "searchin")
    if (roleId < 1 && roleId > 5) throw msg.actionForbid;
    if (id == 2) {
        var sixmonthCard = await FAQ.find({
            createdAt: {
                $gte: moment().subtract(6, 'months'),
                $lt: moment().format('YYYY-MM-DD h:m')
            }
        }).populate('userId', { firstName: 1 })
        return {
            'sixmonthFAQ': sixmonthCard
        }
    }
    if (id == 1) {
        var monthCard = await FAQ.find({
            createdAt: {
                $gte: moment().subtract(1, 'months'),
                $lt: moment().format('YYYY-MM-DD h:m')
            }
        }).populate('userId', { firstName: 1 })
        return {
            'thismonthFAQ': monthCard
        }
    }
    if (id == 3) {
        var yearcard = await FAQ.find({
            createdAt: {
                $gte: moment().subtract(1, "year"),
                $lt: moment().format('YYYY-MM-DD h:m')
            }
        }).populate('userId', { firstName: 1 })
        return {
            'thisyearFAQ': yearcard
        }
    }
    if (id == 0) {
        var allCard = await FAQ.find().populate('userId', { firstName: 1 });
        return {
            'allFAQ': allCard,
        }
    }

}


var getFAQById = async (Id) => {
    // console.log("finding the error")
    if (!Id) throw msg.invalidId;
    let res = await FAQ.findOne({ _id: Id }).populate("userId", 'email username');
    if (!res) throw msg.NotExist;
    return res;

};

//Update FAQ 

const updateFAQById = async (id, user, body) => {
    let data = await FAQ.findByIdAndUpdate(id, { $set: body }, { new: true })
    if (!data) throw msg.notExist
    return {
        msg: msg.success,
        result: data
    }
}


const updateFAQ = async (id, user, body) => {
    // if (query == "null" || query == "undefined") { throw msg.invalidId };
    if (!id) throw "required id ..."
    if (user.roleId > 0 && user.roleId <= 3) {
        if (body.answer) { body.status = "Answered" }
        // if(body.an)
        let res = await FAQ.findByIdAndUpdate(id, { $set: body }, { new: true });
        console.log("res--------------", res)
        if (!res) throw msg.NotExist;
        return {
            msg: msg.success,
            result: res
        };
    } else {
        throw msg.actionForbidden;
    }
};

//Delete FAQ
var deleteFAQ = async (id, { roleId }) => {
    if (id == "null" || id == "undefined") { throw msg.invalidId };
    if (roleId > 0 && roleId <= 5) {
        let res = await FAQ.findByIdAndDelete(id);
        if (!res) throw msg.NotExist;
        return { message: msg.success };
    } else {
        throw msg.actionForbidden;
    }
};


var getFAQAdmin = async ({ roleId }, id) => {
    let result = await FAQ.find({ 'answer': { $exists: false } });
    if (result.length < 1) throw 'No FAQ Questions Exist';
    return result;
}

var getFaqForAdmin = async (id) => {
    if (!id) throw 'User id is Required';
    let result = await FAQ.find({ userId: id });
    if (!result) throw 'No Faq Exist'
    return result;
}

var getCount = async (id) => {
    let totalQuestions = await FAQ.count();
    let answerdQuestions = await FAQ.count({ status: 'Answered' });
    let pandingQuestions = await FAQ.count({ status: 'Pending' });
    return {
        'totalQuestions': totalQuestions,
        'answerdQuestions': answerdQuestions,
        'pandingQuestions': pandingQuestions
    }
}

var howMuchEarn = async (data) => {
    try {
        let interest = data.earning
        let time = data.noOfDays
        let rate = 0.2 / 100
        let principal;
        principal = interest / (rate * time)
        // console.log("working" + principal)

        return { principalAmount: principal };
    }
    catch (error) {
        console.log(error)
        return error;
    }

};



var searchApiFaq = async (roleId, id) => {
    console.log(roleId, id, "aaa")
    if (roleId < 1 && roleId > 5)
        throw msg.unauthorisedRequest;
    if (!id)
        throw msg.invalidId
    const data1 = new RegExp(('^' + id), "i")
    const d1 = await FAQ.find().populate('userId', { _id: 1, firstName: 1 })
    const data3 = []
    for (i in d1) {
        // console.log(data[i].userId,"aaa")
        let d = data1.test(d1[i].userId.firstName)
        if (d == true)
            data3.push(d1[i])
    }
    if (data3.length == 0)
        throw 'No Faq '
    return {
        "data": data3
    }
}
module.exports = {
    postFAQ, getFAQList, updateFAQById, updateFAQ, deleteFAQ, getFAQById, howMuchEarn, getFaqFilterd, getFAQAdmin,
    getFaqForAdmin, getCount, searchApiFaq
};
