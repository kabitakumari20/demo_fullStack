// const business = require("../business/business");

const { uploadAttachement, getHotSellingProducts,
    searchProducts, homePage, filterProductByCategories,
    addProduct, getProducatById, hotSellingProducts, deleteImagesFromProductBulk,
    updateProducatById, filterProduct, deleteImagesFromProduct,
    deleteProducatById, getTopSellingProductsByCategory,
    getProductList, productHomeVariable } = require("../business/business")



exports.addProduct = async (req, res) => await addProduct(req.user, req.body, req.files);
exports.getProducatById = async (req) => await getProducatById(req.user, req.params.id);
exports.updateProducatById = async (req) => await updateProducatById(req.user, req.params.id, req.body);
exports.deleteProducatById = async (req) => await deleteProducatById(req.user, req.params.id);
// exports.getProducatList = async (req) => await getProducatList(req.user);//
exports.getProductList = async (req) => await getProductList();//

// exports.uploadAttachement = async req => await uploadAttachement(req.user, req.files)
exports.uploadAttachement = async req => await uploadAttachement(req.user, req.files)
exports.productHomeVariable = async (req) => await productHomeVariable(req.user)
exports.searchProducts = async (req) => await searchProducts(req.user, req.body)
exports.filterProduct = async req => await filterProduct(req.user, req.body)
exports.homePage = async req => await homePage(req.user)
exports.getTopSellingProductsByCategory = async req => await getTopSellingProductsByCategory(req.user, req.body)
exports.getHotSellingProducts = async req => await getHotSellingProducts(req.user, req.query)
exports.filterProductByCategories = async req => await filterProductByCategories(req.user, req.body, req.query)
exports.hotSellingProducts = async req => await hotSellingProducts(req.user)
exports.deleteImagesFromProduct = async req => await deleteImagesFromProduct(req.params.id, req.query, req.user)
exports.deleteImagesFromProductBulk = async req => await deleteImagesFromProductBulk(req.params.id, req.body, req.user)

