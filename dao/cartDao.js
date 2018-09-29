const { each, isEmpty } = require('lodash');
const { Cart } = require('../models/cart');
const { Product, Types } = require('../models/product');
const { buildProduct } = require('./product');

function buildFullCart (cart, callback) {
  let fullCart = {};
  fullCart._id = cart._id;
  fullCart.expire = cart.expire;
  fullCart.full = 'true';
  fullCart.items = [];
  let idCollection = [];
  each(cart.items, (item) => {
    idCollection.push(Types.ObjectId(item.product_id));
  });
  getProductsInCart(idCollection)
    .then(productList => {
      if (isEmpty(productList)) {
        callback(undefined, []);
      }
      each(productList, (product) => {
        let fullProduct = buildFullProduct(product, cart.items);
        fullCart.items.push(fullProduct);
      });
      callback(undefined, fullCart);
    })
    .catch(error => {
      fullCart._id = '';
      fullCart.error = error;
      callback(fullCart);
    });
};

async function getProductsInCart (idCollection) {
  return await Product.find({'_id': { $in: idCollection } });
}

function buildFullProduct (product, items) {
  let productAmount = 0;
  each(items, (elem) => {
    if (elem.product_id == product._id) {
       productAmount = elem.amount;
       return;
    }
  });

  let fullProduct = buildProduct(product);
  fullProduct.amount = productAmount;
  return fullProduct;
};

module.exports = {
  buildFullCart,
  buildFullProduct,
};
