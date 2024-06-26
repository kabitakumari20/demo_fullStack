const user_route = require("./src/app/modules/user/routes/routes");
const product_route = require("./src/app/modules/Product/routes/routes");
const order_routes = require("./src/app/modules/Order/routes/routes")

module.exports = [
    {
        path: "/api/user",
        handler: user_route
    }, {
        path: "/api/product",
        handler: product_route
    },
    {
        path: "/api/order",
        handler: order_routes
    },
]