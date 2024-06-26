const { msg } = require("../../../../config/message");
const { Product } = require("../../Product/model/model");
const moment = require('moment');
const mongoose = require("mongoose");
const { User } = require("../../user/model/user.model");
// const { Categories } = require("../../Category/models/category.model");
const { result } = require("lodash");
const { Order } = require("../../Order/model/model")


const uploadAttachement = async (user, files) => {
    console.log("its working ---")
    console.log('files-------------', files)
    if (!files || !files.attachment) throw "attachment required";
    var f = files.attachment.map(a => {
        return { key: a.key }
    })
    // console.log("fffffffffff", files)
    return f;
}
function generateRandom10DigitUnique() {
    let uniqueNumber = '';

    while (uniqueNumber.length < 8) {
        const digit = Math.floor(Math.random() * 8).toString();
        if (!uniqueNumber.includes(digit)) {
            uniqueNumber += digit;
        }
    }

    return uniqueNumber;
}

const addProduct = async (user, body, files) => {
    //productId
    let product = generateRandom10DigitUnique()
    body.productId = product

    if (user.roleId == 1) {
        let data = new Product(body)
        if (!data) throw msg.NotCreated
        let res = await data.save()
        if (!res) throw msg.notSaved
        return {
            msg: msg.success,
            result: res
        }
    } else throw msg.actionForbidden
}

const getProducatById = async (user, id) => {
    // let data1 = await User.findOne({ _id: user._id })
    // if (!data1) throw "user not found"
    let data = await Product.findById(id).populate("categoriesId")
    if (!data) throw msg.notAvailable
    return {
        msg: msg.success,
        result: data
    }
}

const updateProducatById = async (user, id, body) => {
    if (user.roleId == 1) {

        let data = await Product.findByIdAndUpdate(id, { $set: body }, { new: true })
        if (!data) throw msg.notAvailable
        return {
            msg: "data updateed successfully....",
            result: data
        }
    } else throw msg.actionForbidden
}

const deleteProducatById = async (user, id) => {
    if (user.roleId == 1) {

        let data = await Product.findByIdAndDelete(id)
        if (!data) throw msg.notAvailable
        return {
            msg: "data deleted successfully ...",
            result: data
        }
    } else throw msg.actionForbidden
}


const getProductList = async () => {
    let data = await Product.find();
    if (!data) return {
        msg: "Product not found",
        count: 0,
        result: []
    }
    return {
        msg: msg.success,
        count: data.length,
        result: data
    }

};


const filterProductByCategories = async (user, body, query) => {
    try {
        let obj;
        let data;

        // Fetch data based on the provided filters
        if (body.categoryId && body.subCategoriesId && body.subSubCategoriesId) {
            obj = {
                categoriesId: body.categoryId,
                subCategoriesId: body.subCategoriesId,
                subSubCategoriesId: body.subSubCategoriesId
            };
            data = await Product.find(obj).populate("categoriesId");
        } else if (body.categoryId && body.subCategoriesId) {
            obj = { categoriesId: body.categoryId, subCategoriesId: body.subCategoriesId };
            data = await Product.find(obj).populate("categoriesId");
        } else if (body.categoriesId) {
            obj = { categoriesId: body.categoriesId };
            data = await Product.find(obj).populate("categoriesId");
        } else {
            data = await Product.find().populate("categoriesId");
        }

        // Check if data is undefined or has no length
        if (!data || data.length === undefined) {
            throw { error: "Data is undefined or has no length", body: "Something went wrong, please try again...", status: 400 };
        }

        // Extract the target language from the query parameters
        const targetLanguage = query.target || 'zh-cn'; // Default to 'zh-cn' if not provided

        // Define a helper function to translate a single field
        const translateFieldAsync = async (field) => {
            try {
                const translation = await translateField(field, targetLanguage);
                return translation;
            } catch (error) {
                console.error(`Error translating ${field}: ${error}`);
                return null; // or handle the error appropriately
            }
        };

        // Translate values of specified fields in the 'data' array
        await Promise.all(data.map(async (entry) => {
            // Translate all fields concurrently
            const translations = await Promise.all([
                translateFieldAsync(entry.productName),
                translateFieldAsync(entry.description),
                translateFieldAsync(entry.deliveryTime),
                translateFieldAsync(entry.productId),
                translateFieldAsync(entry.quantity),
                translateFieldAsync(entry.price),
                translateFieldAsync(entry.review),

                translateFieldAsync(entry.categoriesId.name),
                translateFieldAsync(entry.categoriesId.description),
            ]);

            // Create a new object with the desired structure
            const modifiedEntry = {
                ...entry._doc,
                productName: translations[0],
                description: translations[1],
                deliveryTime: translations[2],
                productId: translations[3],
                quantity: translations[4],
                price: translations[5],
                review: translations[6],

                categoriesId: {
                    ...entry.categoriesId._doc,
                    name: translations[7],
                    description: translations[8],
                },
            };

            // Replace the original entry with the modified one
            data[data.indexOf(entry)] = modifiedEntry;
        }));

        // Return the modified array
        return {
            msg: msg.success,
            count: data.length,
            result: data
        };
    } catch (error) {
        // Handle errors and return an error response
        console.error("Error:", error);
        return { error: error.error, body: error.body, status: error.status || 500 };
    }
};

const productHomeVariable = async (user) => {
    //   try {
    // Get all products from the database
    if (user.roleId == 1) {

        const allProducts = await Product.find();

        if (!allProducts || allProducts.length === 0) {
            throw new Error('No products available.');
        }

        // Calculate the current date
        const currentDate = moment();

        // Calculate start dates for different time intervals
        const startDateWeek = currentDate.clone().subtract(1, 'week');
        const startDateMonth = currentDate.clone().subtract(1, 'month');
        const startDateThreeMonths = currentDate.clone().subtract(3, 'months');
        const startDateSixMonths = currentDate.clone().subtract(6, 'months');
        const startDateOneYear = currentDate.clone().subtract(1, 'year');

        // Filter products based on their creation date within each time interval
        const newProductsWeek = allProducts.filter((product) => moment(product.createdAt).isAfter(startDateWeek));
        const newProductsMonth = allProducts.filter((product) => moment(product.createdAt).isAfter(startDateMonth));
        const newProductsThreeMonths = allProducts.filter((product) => moment(product.createdAt).isAfter(startDateThreeMonths));
        const newProductsSixMonths = allProducts.filter((product) => moment(product.createdAt).isAfter(startDateSixMonths));
        const newProductsOneYear = allProducts.filter((product) => moment(product.createdAt).isAfter(startDateOneYear));

        // Prepare the data for the graph
        const graphData = {
            week: newProductsWeek.length,
            month: newProductsMonth.length,
            threeMonths: newProductsThreeMonths.length,
            sixMonths: newProductsSixMonths.length,
            oneYear: newProductsOneYear.length,
        };

        return {
            msg: 'Success',
            totalProduct: allProducts.length,
            newProduct: graphData,
        };
    } else throw msg.actionForbidden
    //   } catch (error) {
    //     throw error;
    //   }
};

const filterProduct = async (user, body) => {
    console.log("body===========", body);
    let key = body.key;

    const isValidObjectId = mongoose.Types.ObjectId.isValid(key);

    let products = [];

    try {
        // If the provided key is a valid ObjectId, search by ID
        if (isValidObjectId) {
            const productById = await Product.findById(key);

            if (productById) {
                products.push(productById);
                return {
                    msg: msg.success,
                    count: products.length,
                    result: products
                };
            } else {
                throw new Error('Product not found.');
            }
        } else {
            // Search by product name using a case-insensitive regex
            let data = await Product.find({ producatName: { $regex: key, $options: "i" } });

            if (!data || data.length === 0) {
                throw new Error('Product not found.');
            }

            console.log('Data found:', data);
            return {
                msg: msg.success,
                count: data.length,
                result: data
            };
        }
    } catch (error) {
        console.error('Error:', error.message);
        throw new Error('Something went wrong while searching for the product.');
    }
}

const getHotSellingProducts = async (user, query) => {
    try {
        // Fetch data from your database (replace this with your actual data fetching logic for the Donation model)
        let data = await Product.find();

        // Check if data is undefined or has no length
        if (!data || data.length === undefined) {
            throw { error: "Data is undefined or has no length", body: "Something went wrong, please try again...", status: 400 };
        }

        // Extract the target language from the query parameters
        const targetLanguage = query.target || 'en'; // Default to 'en' if not provided

        console.log("Incoming Query:", query);
        console.log("Target Language:", targetLanguage);

        // Define a helper function to translate a single field
        const translateFieldAsync = async (field) => {
            try {
                const translation = await translateField(field, targetLanguage);
                console.log(`Translation for ${field}: ${translation}`);
                return translation;
            } catch (error) {
                console.error(`Error translating ${field}: ${error}`);
                return null; // or handle the error appropriately
            }
        };

        // Translate values of specified fields in the 'data' array
        await Promise.all(data.map(async (entry) => {
            // Translate all fields concurrently
            const translations = await Promise.all([
                translateFieldAsync(entry.productName),
                translateFieldAsync(entry.description),
                translateFieldAsync(entry.deliveryTime),
                translateFieldAsync(entry.productId),
                translateFieldAsync(entry.quantity),
                translateFieldAsync(entry.price),
            ]);

            console.log("Translations:", translations);

            // Create a new object with the desired structure
            const modifiedEntry = {
                ...entry._doc,
                productName: translations[0],
                description: translations[1],
                deliveryTime: translations[2],
                productId: translations[3],
                quantity: translations[4],
                price: translations[5],
                salesCount: {
                    _id: "",
                    totalOrders: entry.salesCount || 0, // Assuming salesCount is the original value
                },
            };

            // Replace the original entry with the modified one
            data[data.indexOf(entry)] = modifiedEntry;
        }));

        // Return the modified array
        return {
            count: data.length,
            result: data
        };
    } catch (error) {
        // Handle errors and recount:turn an error response
        console.error("Error:", error);
        return { error: error.error, body: error.body, status: error.status || 500 };
    }
};








const getTopSellingProductsByCategory = async (user, body) => {
    console.log("user-------------", user._id);
    console.log("body-------------->", body);

    const categoryId = body.categoriesId; // Use "categoriesId" from the request body

    // Aggregate sales data to count how many times each product has been ordered by the user
    const salesData = await Order.aggregate([
        // {
        //     $match: {
        //         userId: user._id, // Filter by user ID
        //     },
        // },
        {
            $group: {
                _id: "$productId",
                totalOrders: { $sum: 1 },
            },
        },
    ]);

    // Sort products by totalOrders in descending order
    salesData.sort((a, b) => b.totalOrders - a.totalOrders);

    // Get the top 10 selling product IDs
    const topSellingProductIds = salesData.slice(0, 10).map(entry => entry._id);

    console.log("categoryId-------------->", categoryId);
    console.log("topSellingProductIds--->", topSellingProductIds);

    // Retrieve the product details for the top-selling products in the specified category
    const topSellingProducts = await Product.aggregate([
        {
            $match: {
                _id: { $in: topSellingProductIds },
                categoriesId: categoryId, // Use "categoriesId" from the request body
            },
        },
        {
            $project: {
                _id: 1,
                productName: 1,
                categoriesId: 1,
                price: 1,
                description: 1,
                quantity: 1,
                image: 1,
                video: 1,
                review: 1,
                websiteLink: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);

    // Create a map to store the order counts for each product
    const orderCounts = new Map();

    // Populate the order counts map based on the salesData
    salesData.forEach(entry => {
        orderCounts.set(entry._id, entry.totalOrders);
    });

    // Add order counts to the top-selling products
    topSellingProducts.forEach(product => {
        product.orderCount = orderCounts.get(product._id) || 0;
    });

    return {
        // msg: msg.success,
        count: topSellingProducts.length,
        result: topSellingProducts,
    };
};




const hotSellingProducts = async (user) => {
    const hotSellingProducts = await Order.aggregate([
        {
            $group: {
                _id: "$productId",
                totalOrders: { $sum: 1 },
            },
        },
        {
            $sort: { totalOrders: -1 }, // Sort products by total orders in descending order
        },
        {
            $lookup: {
                from: "products", // The name of the Product collection
                localField: "_id",
                foreignField: "_id",
                as: "productDetails",
            },
        },
        {
            $unwind: "$productDetails", // Convert the productDetails array to separate documents
        },
        {
            $project: {
                _id: "$_id",
                totalOrders: 1,
                productDetails: {
                    _id: 1,
                    productName: 1, // Add other product fields you want to include
                    price: 1,
                    description: 1,
                    quantity: 1,
                    image: 1,
                    video: 1,
                    review: 1,
                    websiteLink: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        },
    ]);

    return {
        msg: msg.success,
        result: hotSellingProducts,
    };
};



const deleteImagesFromProduct = async (id, query, user) => {
    try {
        const image = query.image; // Get the image you want to delete from the request body
        console.log('image============>>', image);

        if (!image) {
            throw 'Image must be provided in the request body.';
        }

        // Find the product by ID
        const product = await Product.findById(id);

        if (!product) {
            throw 'Product not found.';
        }

        // Check if the image exists in the 'product.image' array
        const imageIndex = product.image.indexOf(image);

        if (imageIndex === -1) {
            throw 'Image not found in the product.';
        }

        // Remove the specified image from the product
        product.image.splice(imageIndex, 1);
        await product.save();

        return {
            message: 'Image deleted from product successfully',
            result: product,
        };
    } catch (error) {
        console.error('Error deleting image from product:', error);
        // Handle the error as needed, e.g., return an error response
        return {
            error: error,
        };
    }
};



const deleteImagesFromProductBulk = async (id, body, user) => {
    try {
        if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
            throw 'Images must be provided in the request body as a non-empty array.';
        }

        // Find the product by ID
        const product = await Product.findById(id);

        if (!product) {
            throw 'Product not found.';
        }

        // Remove all specified images from the product's image array
        body.images.forEach((image) => {
            const imageIndex = product.image.indexOf(image);
            if (imageIndex !== -1) {
                product.image.splice(imageIndex, 1);
            }
        });

        // Save the updated product document with removed images
        await product.save();

        return {
            message: 'Images deleted from the product in bulk successfully',
            result: product,
        };
    } catch (error) {
        console.error('Error deleting images from the product in bulk:', error);
        // Handle the error as needed, e.g., return an error response
        return {
            error: error,
        };
    }
};







module.exports = {
    uploadAttachement, filterProductByCategories,
    addProduct, filterProduct, deleteImagesFromProduct,
    getProducatById, getHotSellingProducts,
    updateProducatById, getTopSellingProductsByCategory,
    deleteProducatById, hotSellingProducts,
    getProductList, deleteImagesFromProductBulk,
    productHomeVariable,
    // searchProducts
}