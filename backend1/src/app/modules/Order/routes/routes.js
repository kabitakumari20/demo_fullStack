let express = require("express");
const {
    msg
} = require("../../../../config/message");
let router = express.Router()
const {
    AdminAuthenticate,
    authenticate
} = require("../../../middlewares/jwt.middleware");
const {
    wrapAsync
} = require("../../../helpers/router.helper");

const {
    PBKDF2
} = require("crypto-js");

const { uploadAttachement,
    addOrder, buyUserCountOfEachProduct,
    getOrderById, myOrderHistory, cancleOrder,
    updateOrderById, myOredrStauts,
    getRecentOrderHistoryByUserId,
    deleteOrderById, approveOrderById,
    getOrderHistoryByUserId, topPurchasedUser,
    receivedOrder, searchOrder,
    getOrderList } = require("../controller/controller")
// router.post("/uploadAttachement", upload("clover/Order").fields([{ name: 'attachment', maxCount: 100 }]), wrapAsync(uploadAttachement));//
router.get("/buyUserCountOfEachProduct/:id", wrapAsync(buyUserCountOfEachProduct))
router.post("/addOrder", wrapAsync(addOrder));
router.get("/getOrderById/:id", authenticate, wrapAsync(getOrderById));
router.put("/updateOrderById",  wrapAsync(updateOrderById));
router.delete("/deleteOrderById/:id", wrapAsync(deleteOrderById));
router.get("/getOrderList", wrapAsync(getOrderList));
router.get("/myOrderHistory", authenticate, wrapAsync(myOrderHistory));
router.get("/getOrderHistoryByUserId/:id", authenticate, wrapAsync(getOrderHistoryByUserId));
router.get("/getRecentOrderHistoryByUserId/:id", authenticate, wrapAsync(getRecentOrderHistoryByUserId));
router.put("/approveOrderById/:id", authenticate, wrapAsync(approveOrderById))
router.post("/searchOrder", authenticate, wrapAsync(searchOrder))
router.post("/myOredrStauts/:id", authenticate, wrapAsync(myOredrStauts));//
router.put("/cancleOrder/:id", authenticate, wrapAsync(cancleOrder))
router.post("/receivedOrder", authenticate, wrapAsync(receivedOrder))
router.post("/topPurchasedUser", authenticate, wrapAsync(topPurchasedUser))



module.exports = router;