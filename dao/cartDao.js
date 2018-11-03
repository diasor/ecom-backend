const { each, isEmpty } = require('lodash');
const { Cart } = require('../models/cart');
const { Product, Types } = require('../models/product');
const { buildProduct } = require('./productDao');

/******************************************************
  Cart's Data Access Object:
    handles all the necessary database interaction
    concerning the shopping cart.
******************************************************/
function getCart (getFullCart, callback) {
  // returns the cart's information and items
  Cart.findOneAndUpdate({}, { expire: new Date()}, { upsert: true, new: true, setDefaultsOnInsert: true }, (error, cartDocument) => {
    if (error) return callback(`Error retrieving cart: ${error}`);
    if (getFullCart === 'true') {
      buildFullCart(cartDocument, (errorMessage, fullCart) => {
        if (errorMessage) return callback(`Failed to load a full cart! => ${errorMessage}`);
        return callback(undefined, fullCart);
      });
    } else return callback(undefined, cartDocument);
  });
};

function insertUpdateItem (cartId, productId, productAmount, callback) {
  // inserts or updates an item within the cart
  let productItem = {product_id: productId, amount: productAmount};
  Cart.findOneAndUpdate(
    { _id: cartId, 'items.product_id': productId },
    { $set: { 'items.$.amount' : productAmount }, expire: new Date() },
    { new: true },
    (error, cartDocument) => {
      if (isEmpty(cartDocument)) {
        // if the cart wasn't found with the item, then an insertion is in order
        Cart.findOneAndUpdate(
          { _id: cartId },
          { $push: {items: productItem}, expire: new Date()},
          { new: true },
          (error, cartDocument) => {
            if (error) return callback(`Failed to push a new item in the cart! => ${error}`);
            if (isEmpty(cartDocument)) return callback(`Failed to push a new item in the cart! => ${error}`);
            return callback(undefined, cartDocument);
          });
      } else return callback(undefined, cartDocument);
    });
};

function removeItemFromCart (cartId, productId, getFullCart, callback) {
  // removes an item from the cart
  Cart.findOneAndUpdate(
    { _id: cartId },
    { $pull: {items: { product_id: productId } }, expire: new Date() },
    { new: true },
    (error, cartDocument) => {
      if (error) return callback(`Error removing the product from the cart: ${productId}. ERROR: ${error}`);
      if ((cartDocument.items.length == 0) || (getFullCart === 'false')) return callback(undefined, cartDocument);

      buildFullCart(cartDocument, (errorMessage, fullCart) => {
        if (errorMessage) return callback(`Failed to load a full cart! => ${errorMessage}`)
        return callback(undefined, fullCart);
      });
    });
};

// functions to form the proper response format
function buildFullCart (cart, callback) {
  let fullCart = {
    _id: cart._id,
    expire: cart.expire,
    full: 'true',
    items: [],
  };

  let idCollection = [];
  each(cart.items, (item) => {
    idCollection.push(Types.ObjectId(item.product_id));
  });
  getProductsInCart(idCollection)
    .then(productList => {
      if (isEmpty(productList)) return callback(undefined, []);
      each(productList, (product) => {
        let fullProduct = buildFullProduct(product, cart.items);
        fullCart.items.push(fullProduct);
      });
      return callback(undefined, fullCart);
    })
    .catch(error => {
      fullCart._id = '';
      fullCart.error = error;
      return callback(fullCart);
    });
};

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

// Basic Data Access Object operations
async function getProductsInCart (idCollection) {
  return await Product.find({'_id': { $in: idCollection } });
};

module.exports = {
  buildFullCart,
  buildFullProduct,
  getCart,
  insertUpdateItem,
  removeItemFromCart,
};
