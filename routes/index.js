var express = require('express');
var router = express.Router();

const { productController } = require('../api/controllers/product.js');
const { manufacturerController } = require('../api/controllers/manufacturer.js');
const { cartController } = require('../api/controllers/cart.js');

// manufacturers
router.get('/manufacturers', manufacturerController.all);
router.post('/manufacturers', manufacturerController.create);
router.get('/manufacturers/:id', manufacturerController.byId);
router.put('/manufacturers/:id', manufacturerController.update);
router.delete('/manufacturers/:id', manufacturerController.remove);

// products
router.get('/products', productController.all);
router.get('/products/:id', productController.byId);
router.post('/products', productController.createUpdate);
router.delete('/products/:id', productController.remove);

// cart
router.get('/cart/:getFullCart', cartController.get);
router.post('/cart/:id', cartController.createUpdateItem);
router.post('/cart/', cartController.removeItem);

module.exports = router;
