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
  addProduct, filterProduct,
  getProducatById, homePage, filterProductByCategories,
  updateProducatById, getHotSellingProducts,
  deleteProducatById, getTopSellingProductsByCategory,
  productHomeVariable, hotSellingProducts,
  searchProducts, deleteImagesFromProduct, deleteImagesFromProductBulk,
  getProductList } = require("../controller/controller")

router.post("/addProduct", authenticate, wrapAsync(addProduct));
router.get("/getProducatById/:id", authenticate, wrapAsync(getProducatById));
router.put("/updateProducatById/:id", authenticate, wrapAsync(updateProducatById));
router.delete("/deleteProducatById/:id", authenticate, wrapAsync(deleteProducatById));
router.get("/getProductList", wrapAsync(getProductList));
router.get("/productHomeVariable", authenticate, wrapAsync(productHomeVariable));
// router.post("/uploadAttachement", upload("clover/Producat").fields([{ name: 'attachment', maxCount: 100 }]), wrapAsync(uploadAttachement));//
router.post("/searchProducts", authenticate, wrapAsync(searchProducts))
// router.post("/uploadAttachement", upload("clover/product").fields([{ name: 'attachment', maxCount: 100 }]), wrapAsync(uploadAttachement));//
router.post("/filterProduct", authenticate, wrapAsync(filterProduct))
router.get("/homePage", authenticate, wrapAsync(homePage))
router.get("/getHotSellingProducts", authenticate, wrapAsync(getHotSellingProducts))
router.post("/getTopSellingProductsByCategory", authenticate, wrapAsync(getTopSellingProductsByCategory))
router.post("/filterProductByCategories", authenticate, wrapAsync(filterProductByCategories))
router.get("/hotSellingProducts", authenticate, wrapAsync(hotSellingProducts))
router.delete("/deleteImagesFromProduct/:id", authenticate, wrapAsync(deleteImagesFromProduct))//
router.put("/deleteImagesFromProductBulk/:id", authenticate, wrapAsync(deleteImagesFromProductBulk))//

module.exports = router;