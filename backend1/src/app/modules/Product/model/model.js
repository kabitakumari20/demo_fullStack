const mongoose = require("mongoose")
const { User } = require("../../user/model/user.model")
// const { Categories } = require("../../Category/models/category.model")
const ProductSchema = new mongoose.Schema({
    productName: {
        type: String,
        unique: true,
    },
   
    size: {
        type: String,
        // enum: ["Medium", "Large", "Small", "XL", "XXL", "XXXL"]//Size S, M, L, XL, XXL, XXXL Shirts - Privee Paris
        enum: ["S", "M", "L", "XL", "XXL", "XXXL"]
    },
    colour: {
        type: String,
        enum: ["GREEN","RED","YELLOW","PINK","ASK-BLUE","ORANGE","GREEN","BLACK",]
    },
    productId: Number,
    deliveryTime: {
        type: String
    },
    salesCount: {
        type: Number,
        default: 0, // Initialize sales count to 0
    },
    price: String,
    description: String,
    rewordPrice: String,
    quantity: String,
    image: [String],
    video: [String],
    review: {
        type: String,
        enum: ["good", "bad", "ok-ok", "very good", "very bad"],
        default: "good"
    },

    websiteLink: String,


}, {
    timestamps: true,
    versionKey: false
})
const Product = mongoose.model("Product", ProductSchema)
Product.syncIndexes()
module.exports = { Product }