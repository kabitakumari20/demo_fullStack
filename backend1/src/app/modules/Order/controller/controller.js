const { uploadAttachement,
    addOrder,
    getOrderById,
    updateOrderById, topPurchasedUser,
    buyUserCountOfEachProduct,
    deleteOrderById, cancleOrder,
    getOrderHistoryByUserId,
    getOrderList, myOredrStauts,
    getRecentOrderHistoryByUserId,
    myOrderHistory, approveOrderById,
    receivedOrder,
    searchOrder
} = require("../business/business")

exports.buyUserCountOfEachProduct = async (req) => await buyUserCountOfEachProduct(req.params.id)
exports.addOrder = async (req) => await addOrder(req.body);
exports.getOrderById = async (req) => await getOrderById(req.user, req.params.id);
exports.updateOrderById = async (req) => await updateOrderById(req.query.id, req.body);
exports.deleteOrderById = async (req) => await deleteOrderById(req.params.id);
exports.getOrderList = async (req) => await getOrderList();
exports.uploadAttachement = async req => await uploadAttachement(req.user, req.files)
exports.myOrderHistory = async req => await myOrderHistory(req.user, req.query)//
exports.getOrderHistoryByUserId = async req => await getOrderHistoryByUserId(req.params.id, req.user, req.query)//
exports.getRecentOrderHistoryByUserId = async req => await getRecentOrderHistoryByUserId(req.params.id, req.user)//
exports.approveOrderById = async req => await approveOrderById(req.user, req.params.id, req.body)
exports.searchOrder = async req => await searchOrder(req.user, req.body)
exports.myOredrStauts = async req => await myOredrStauts(req.params.id, req.user, req.query)//
exports.cancleOrder = async req => await cancleOrder(req.body, req.params.id, req.user);
exports.receivedOrder = async req => await receivedOrder(req.user, req.query, req.body)
exports.topPurchasedUser = async req => await topPurchasedUser(req.user, req.body, req.query)

