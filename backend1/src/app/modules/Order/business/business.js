const { msg } = require("../../../../config/message");
const { Order } = require("../../Order/model/model")
const mongoose = require("mongoose");
const { Product } = require("../../Product/model/model");
const { User } = require("../../user/model/user.model");

const uploadAttachement = async (user, files) => {
    if (!files || !files.attachment) throw "attachment required";
    var f = files.attachment.map(a => {
        return { key: a.key }
    })
    return f;
}




const addOrder = async (body, files) => {

    console.log("body========>>", body)
    function generateRandomNumber() {
        const min = 1000000;
        const max = 9999999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const random10DigitNumber = generateRandomNumber();
    let res;
    let data1 = await Product.findOne({ _id: body.productId });
    console.log("data1------------>>", data1)

    if (!data1) throw "Product not exits"


    body.deliveryStatus = "Ordered";
    body.isClimed = true
    body.ProductAmount = data1.price
    // body.cryptoAmount = data1.price - bal
    body.totalAmount = data1.price
    body.approveStatus = "Approve-Payments"
    body.orderId = random10DigitNumber

    body.productName = data1.productName

    const data = new Order(body);
    if (!data) throw msg.NotCreated;
    const createdOrder = await data.save();
    console.log("createdOrder=======>>", createdOrder)
    if (!createdOrder) throw msg.notSaved;
    res = createdOrder;
    console.log("res===>>", res)
    return {
        msg: "ok",
        result: res
    }




}
const getOrderList = async () => {
    let data = await Order.find()
    if (!data) throw msg.notAvailable
    return {
        msg: msg.success,
        count: data.length,
        result: data
    }
}


const getOrderById = async (user, id) => {
    console.log("id---------->>", id)
    // let totalBalance = 0

    let data = await Order.findById(id)
        .populate("userId", "username email")
        .populate("productId")

    if (!data) throw msg.notAvailable
    console.log("data=============>>", data)
    // let total = data.productId.price * productId.quantity
    const product = data.productId;
    console.log("product------------>>", product)
    const totalAmount = product.price * product.quantity;
    return {
        msg: msg.success,
        // totalBalance: total,
        result: data
    }
}
const updateOrderById = async (id, body) => {
    console.log("id--------->>", id)
    let data = await Order.findOneAndUpdate({ _id: id }, { $set: body }, { new: true })
    if (!data) throw msg.notAvailable
    return {
        msg: msg.success,
        result: data
    }
}
const deleteOrderById = async (id) => {
    console.log("id=======>>", id)
    let data = await Order.findByIdAndDelete(id)
    if (!data) throw msg.notAvailable
    return {
        msg: msg.success,
        result: data
    }
}





const myOrderHistory = async (user, query) => {
    const { page = 1 } = query
    let limit = 10
    const skip = (page - 1) * limit;

    let data = await Order.find({ userId: user.id }).populate("productId").sort({ createdAt: -1 });

    if (!data || data.length === undefined) {
        throw { error: "Data is undefined or has no length", body: "Something went wrong, please try again...", status: 400 };
    }
    return {
        msg: msg.success,
        count: data.length,
        result: data
    }
};

const getOrderHistoryByUserId = async (id, user, query) => {
    const statusValues = ["Ordered", "Claim-Confirmed", "Order-Dispatch", "Order-Shipped", "Out-Of-Delivery", "Order-Delivered", "Cancelled"];
    let data = await Order.find({ userId: id, deliveryStatus: { $in: statusValues } })
        .populate({
            path: "productId",
            populate: {
                path: "categoriesId",
            }
        })
    if (!data || data.length === undefined) {
        throw { error: "Data is undefined or has no length", body: "Something went wrong, please try again...", status: 400 };
    }
    let totalBalance = 0;
    for (const order of data) {
        if (order.productId && order.productId.price) {
            totalBalance += order.productId.price;
        }
    }
    return {
        msg: "Success",
        balance: totalBalance,
        count: data.length,
        result: data
    };
};


const getRecentOrderHistoryByUserId = async (id, user) => {

    const desiredStatuses = ["Ordered", "Claim-Confirmed", 'Order-Dispatch', 'Order-shipped', 'Out-Of-Delivery', 'Order-Delivered', 'Cancelled']
    let data = await Order.findOne({ userId: id, deliveryStatus: { $in: desiredStatuses } })
        .populate({
            path: "productId",
            populate: {
                path: "categoriesId",
                select: "name"
            }
        })
        .sort({ createdAt: -1 });
    if (!data || data.length === 0) {
        throw new Error("No delivered orders found for this user");
    }
    return {
        msg: "Success",
        result: data
    };
};


const myOredrStauts = async (id, user, query) => {
    try {
        let orderData = await Order.findById(id).populate("productId");
        if (!orderData) {
            throw "Order not found";
        }
        let totalWalletAmount = user.walletBalance;
        let balance = 0;
        if (totalWalletAmount > orderData.productId.price) {
            balance = totalWalletAmount - orderData.productId.price;
        } else {
            balance = orderData.productId.price - totalWalletAmount
            balance = 0
        }
        let beforeDeductAmount = Number(totalWalletAmount) + Number(orderData.cloverAmount);
        return {
            msg: msg.success,
            totalWalletAmount: dd.walletAmount,
            leftBalance: balance,
            cryptoAmount: orderData.cryptoAmount || "0",
            productPrice: orderData.productId.price,
            address: translatedOrderData.orderAddress,
            deliveryStatus: translatedOrderData.deliveryStatus,
            result: translatedOrderData,
        };
    } catch (error) {
        console.error('Error in myOrderStatus:', error);
        throw error;
    }
};





const cancleOrder = async (body, orderId, user) => {
    try {
        console.log("user=============>", user._id);
        let obj = { isClimed: false, deliveryStatus: "Cancelled" };

        // Retrieve the order using the provided orderId
        let order = await Order.findById(orderId);

        if (!order) {
            throw "Order not found";
        }

        if (order.deliveryStatus === 'Cancelled') {
            throw "Your order has already been canceled";
        }

        let data1 = await Product.findById(order.productId);

        // Add cloverAmount to user.walletBalance if it exists and is greater than 0
        if (order.cloverAmount && parseFloat(order.cloverAmount) > 0) {
            // Update the user's wallet balance
            // user.walletBalance = (parseFloat(user.walletBalance) + parseFloat(order.cloverAmount)).toFixed(2);

            // Create a new transaction for the user
            let transactionData = {
                userId: user._id,
                amount: parseFloat(order.cloverAmount),
                type: 'credit',
                source: "Refund",
                stepsAmount: false,
            };

            let transaction = new WalletTransaction(transactionData);

            if (!transaction) {
                throw "Transaction not created";
            }

            // Save the transaction
            await transaction.save();
        }

        // Update the order status
        let updateData = await Order.findOneAndUpdate({ _id: orderId }, { $set: obj }, { new: true });
        console.log("updateData==========>>", updateData);

        console.log("user.walletBalance============>>", user.walletBalance);
        user.walletBalance = Number(user.walletBalance) + Number(updateData.cloverAmount)
        await user.save()
        return {
            msg: "Order Cancelled successfully",
            totalWalletAmount: user.walletBalance,
            result: updateData,
        };
    } catch (error) {
        console.error(error);
        throw error; // You can handle or format the error as needed
    }
};




const buyUserCountOfEachProduct = async (productId) => {
    // try {
    const pipeline = [
        {
            $match: {
                productId: mongoose.Types.ObjectId(productId),
            },
        },
        {
            $group: {
                _id: '$productId', // Group by productId
                count: { $sum: 1 },
            },
        },
        {
            $lookup: {
                from: 'products', // Replace 'products' with the actual collection name for products
                localField: '_id',
                foreignField: '_id',
                as: 'productInfo',
            },
        },
    ];

    const result = await Order.aggregate(pipeline);

    if (result.length > 0) {
        // const productCount = {
        //     product: result[0].productInfo[0], // Assuming there is only one product
        //     userCount: result[0].count,
        // };

        return {
            msg: msg.success,
            userCount: result[0].count,
            product: result[0].productInfo[0], // Assuming there is only one product
            // msg: msg.success,
            // productCount: productCount,
        };
    } else {
        return {
            msg: msg.success,
            userCount: 0,
            product: null,

        };
    }
    // } catch (error) {
    //     throw error;
    // }
};


let receivedOrder = async (user, query, body) => {
    // app.put('/api/orders/:id/received', async (req, res) => {
    // try {
    console.log("body===========>>", body)
    const orderId = query.orderId;
    console.log("orderId---------->>", orderId)
    const receivedDate = body.receivedDate;
    console.log("receivedDate=============>>", receivedDate)

    const updatedOrder = await Order.findOneAndUpdate(orderId,
        { $set: { receivedDate: receivedDate } },
        { new: true });

    if (!updatedOrder) throw "Order not found"

    return {
        msg: msg.success,
        result: updatedOrder
    }

}





const approveOrderById = async (user, id, body) => {
    try {
        // Check if the user has admin privileges. You should implement this logic.
        if (user.roleId !== 1) {
            throw new Error("Access denied.");
        }

        // Find the order by ID
        let order = await Order.findById(id);

        if (!order) {
            throw new Error("Order not found.");
        }
        if (body.deliveryStatus == "Claim-Confirmed") {
            body.approveStatus = "Approved"
            body.isClimed = true
            order = await Order.findByIdAndUpdate(id, { $set: body }, { new: true });
        } else {
            body.approveStatus = "Decline"
            body.deliveryStatus = "Cancelled"
            body.isClimed = false
            order = await Order.findByIdAndUpdate(id, { $set: body }, { new: true });
        }
        return {
            msg: "Order approved successfully",
            result: order,
        };
    } catch (error) {
        throw error; // Handle errors appropriately in your application
    }
};



// working without email and productName
const searchOrder = async (user, data) => {
    const searchCriteria = {};
    try {

        if (data.key) {
            searchCriteria.$or = [];
            if (!isNaN(data.key)) {
                // If 'key' is a number, assume it's an order ID or user ID
                searchCriteria.$or.push({ "orderId": parseInt(data.key) });
                searchCriteria.$or.push({ "userId": parseInt(data.key) });
            } else {
                // Otherwise, search for product name, approval status, and delivery status
                searchCriteria.$or.push({ "approveStatus": { $regex: data.key, $options: "i" } });
                searchCriteria.$or.push({ "deliveryStatus": { $regex: data.key, $options: "i" } });
                searchCriteria.$or.push({ "productName": { $regex: data.key, $options: "i" } });
                searchCriteria.$or.push({ "email": { $regex: data.key, $options: "i" } });
            }
        }

        const populateFields = [
            { path: "userId", select: "email" },
            { path: "productId", select: "productName" }
        ];

        const orders = await Order.find(searchCriteria)
            .populate(populateFields)
            .lean();
        if (orders.length === 0) {
            return {
                msg: msg.NotExist,
                count: 0,
                result: []
            };
        } else {
            return {
                msg: msg.success,
                count: orders.length,
                result: orders
            };
        }
    } catch (error) {
        throw error;
    }
};



const topPurchasedUser = async (user, body, query) => {
    const { timeDuration } = body;
    console.log("query=========>>",)
    const targetLanguage = query && query.target ? query.target.toLowerCase() : 'en';
    console.log("targetLanguage===>>", targetLanguage)
    const timeDurations = body.timeDuration.toLowerCase();
    console.log("timeDurations=======>>", timeDurations)
    const currentDate = new Date();
    let durationInMilliseconds;

    if (timeDuration === "Month") {
        durationInMilliseconds = 30 * 24 * 60 * 60 * 1000;
    } else if (timeDuration === "Week") {
        durationInMilliseconds = 7 * 24 * 60 * 60 * 1000;
    } else if (timeDuration === "Day") {
        durationInMilliseconds = 24 * 60 * 60 * 1000;
    } else {
        return {
            error: "Invalid time duration",
            status: 400,
            body: "Invalid time duration specified.",
        };
    }

    try {
        const orders = await Order.find({
            createdAt: { $gte: new Date(currentDate - durationInMilliseconds) }
        }).populate({
            path: 'userId',
            select: 'username email phone profileImage',
        }).exec();

        await Promise.all(orders.map(async (entry) => {
            // Translate only the 'username' field
            if (entry.userId && entry.userId.username) {
                entry.userId.username = await translateField(entry.userId.username, targetLanguage);
            }
            return entry;
        }));

        if (orders.length > 0) {
            const uniqueTopPurchasedUsers = new Map();

            orders.forEach((order) => {
                const userId = order.userId ? order.userId._id : "";

                if (userId !== null) {
                    const totalAmount = parseInt(order.totalAmount) || 0;

                    if (uniqueTopPurchasedUsers.has(userId)) {
                        const existingData = uniqueTopPurchasedUsers.get(userId);
                        existingData.totalAmountPurchased += totalAmount;
                    } else {
                        uniqueTopPurchasedUsers.set(userId, {
                            userId: order.userId,
                            totalAmountPurchased: totalAmount,
                        });
                    }
                }
            });

            const topPurchasedUsers = Array.from(uniqueTopPurchasedUsers.values());

            // Filter out entries with null user IDs
            const filteredTopPurchasedUsers = topPurchasedUsers.filter((user) => user.userId !== null);

            filteredTopPurchasedUsers.sort((a, b) => b.totalAmountPurchased - a.totalAmountPurchased);

            if (filteredTopPurchasedUsers.length > 0) {
                return {
                    countOfUser: filteredTopPurchasedUsers.length,
                    result: filteredTopPurchasedUsers
                };
            } else {
                console.log('No purchases found during the specified time period.');
                return {
                    countOfUser: 0,
                    result: []
                };
            }
        } else {
            console.log('No purchases found during the specified time period.');
            return {
                countOfUser: 0,
                result: []
            };
        }
    } catch (error) {
        return {
            error: 'Internal server error',
            status: 500,
            body: 'Internal server error, please try again later.',
        };
    }
};


module.exports = {
    uploadAttachement, buyUserCountOfEachProduct,
    addOrder, getOrderById, approveOrderById,
    updateOrderById, getOrderHistoryByUserId,
    deleteOrderById, getRecentOrderHistoryByUserId,
    getOrderList, cancleOrder, searchOrder, topPurchasedUser,//
    myOrderHistory, myOredrStauts, receivedOrder
}