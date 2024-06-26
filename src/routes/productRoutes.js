import express from "express";

// importing controller function
import {
  createProduct,
  deleteProduct,
  editProduct,
  getProductList,
  searchProduct,
  getProductDetails
} from "../controllers/productController.js";

// importing the verification function
import verifyAdmin from "../middlewares/verification/verifyAdmin.js";
import verifyAdminAndModerator from "../middlewares/verification/verifyAdminAndModerator.js";
import { uploadImage } from "../utils/uploadImage/uploadImage.js";
import { multerUpload } from "../middlewares/multer/multerConfig.js";
// Create a new router instance
const router = express.Router();
router
  .route("/create")
  .post(multerUpload.array("photos"), createProduct);

router.route("/list").get(getProductList);
router.route("/:id").get(getProductDetails);
// delete and update product
router
  .route("/action/:id")
  .delete(deleteProduct)
  .put(editProduct);

// search product with product id
router.route("/search").get(verifyAdminAndModerator, searchProduct);
// Export the router object so that it can be used in other modules
export default router;
