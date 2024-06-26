const { postFAQ, getFAQList, updateFAQ, updateFAQById, deleteFAQ, getFAQById, howMuchEarn, getFaqFilterd,
    getFAQAdmin, getFaqForAdmin, getCount, searchApiFaq } = require('../business/FAQ.business');

exports.postFAQ = async req => await postFAQ(req.body, req.user);

// exports.getFAQList = async req => await getFAQList(req.user);
exports.getFAQList = async req => await getFAQList(req.user, req.query);


exports.getFAQAdmin = async req => await getFAQAdmin(req.user);

exports.getFAQById = async req => await getFAQById(req.params.id);

exports.howMuchEarn = async req => await howMuchEarn(req.body);

exports.updateFAQ = async req => await updateFAQ(req.params.id, req.user, req.body);
exports.updateFAQById = async req => await updateFAQById(req.params.id, req.user, req.body);//


exports.deleteFAQ = async req => await deleteFAQ(req.query.id, req.user);

exports.getFaqFilterd = async req => await getFaqFilterd(req.user.roleId, req.query.id);

exports.getFaqForAdmin = async req => await getFaqForAdmin(req.query.id);

exports.getCount = async req => await getCount(req.user);

exports.searchApiFaq = async req => await searchApiFaq(req.user.roleId, req.query.id);