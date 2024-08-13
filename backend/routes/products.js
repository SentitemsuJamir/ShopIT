import express from "express";
import {createProductReview, deleteProduct, deleteReview, getProducDetails, getProductReview, getProducts, newProducts, updateProduct} from "../controllers/productControllers.js"
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
const router = express.Router();

router.route("/products").get(getProducts);
router.route("/admin/products").post(isAuthenticatedUser, authorizeRoles("admin"),newProducts);
router.route("/products/:id").get(getProducDetails);
router.route("/admin//products/:id").put(isAuthenticatedUser, authorizeRoles("admin"),updateProduct);
router.route("/admin//products/:id").delete(isAuthenticatedUser, authorizeRoles("admin"),deleteProduct);


router.route("/reviews").put(isAuthenticatedUser, createProductReview)
.get(isAuthenticatedUser, getProductReview);


router.route("/admin/reviews").delete(isAuthenticatedUser, authorizeRoles("admin"),deleteReview)
export default router;