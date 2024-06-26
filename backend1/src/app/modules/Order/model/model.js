const mongoose = require("mongoose")
const { User } = require("../../user/model/user.model")
const { Product } = require("../../Product/model/model")
const OrderSchema = new mongoose.Schema({
    userId: {
        type: Number,
        ref: User
    },
    orderId: {
        type: Number
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Product
    },
    orderDate: Date,
    receivedDate: Date,
    orderAddress: String,
    rewordAmount: Number,
   
    email: String,
    productName: String,
    receiverName: String,
    receiverPhoneNo: String,
   
    isClimed: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["Delivered", "Pending", "Cancled", "Return", "preparing-for-shift"],
    },
    approveStatus: String,
    deliveryStatus: {
        type: String,
        enum: ["Ordered", "Claim-Confirmed", 'Order-Dispatch', 'Order-shipped', 'Out-Of-Delivery', 'Order-Delivered', 'Cancelled'],
    },
    ProductAmout: String,
    totalAmount: String,
    
},
    {
        timestamps: true,
        versionKey: false
    }
)
const Order = mongoose.model("Order", OrderSchema)
Order.syncIndexes()
module.exports = { Order }