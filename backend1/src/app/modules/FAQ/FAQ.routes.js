const express = require('express');
const router = express.Router();
const { postFAQ, getFAQList, updateFAQ, updateFAQById, deleteFAQ, getFAQById, howMuchEarn, getFaqFilterd,
    getFaqForAdmin, getCount, searchApiFaq } = require('./controller/FAQ.controller');
const { authenticate } = require("./../../middlewares/jwt.middleware");

const { wrapAsync } = require("./../../helpers/router.helper");

router.post('/postFAQ', authenticate, wrapAsync(postFAQ));
router.get('/getFAQById/:id', wrapAsync(getFAQById));
router.get('/getFAQList', authenticate, wrapAsync(getFAQList));
// router.get('/getFAQ/admin',authenticate, wrapAsync(getFAQAdmin));
router.put('/updateFAQ/:id', authenticate, wrapAsync(updateFAQ));//
router.put('/updateFAQById/:id', authenticate, wrapAsync(updateFAQById));//updateFAQById

router.delete('/deleteFAQ', authenticate, wrapAsync(deleteFAQ));
router.post('/howMuchEarn', wrapAsync(howMuchEarn));
router.get('/getFaqFilterd', authenticate, wrapAsync(getFaqFilterd));
router.get('/getFaqForUser/admin', wrapAsync(getFaqForAdmin));
router.get('/getcount', authenticate, wrapAsync(getCount));
router.get('/searchApiFaq', authenticate, wrapAsync(searchApiFaq));
module.exports = router;
