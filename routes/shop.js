const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);
// isAuth,
router.post('/cart', isAuth, shopController.postCart);
// isAuth,
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);
// isAuth,
router.post('/create-order', isAuth, shopController.postOrder);
// isAuth,
router.get('/orders', isAuth, shopController.getOrders);
// 
module.exports = router;
