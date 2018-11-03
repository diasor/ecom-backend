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
  Cart.findOneAndUpdate({}, { expire: new Date()}, { upsert: true, new: true, setDefaultsOnInsert: true })
    .then(cart => {
      if (getFullCart === 'true') {
        buildFullCart(cart, (errorMessage, fullCart) => {
          if (errorMessage) {
            callback(`Failed to load a full cart! => ${errorMessage}`);
          }
          callback(undefined, fullCart);
        });
      } else callback(undefined, cart);
    })
    .catch(error => callback(`Failed to get or create a cart! => ${error}. Bad Request.`));
};

function insertUpdateItem (cartId, productId, productAmount, callback) {
  let productItem = {product_id: productId, amount: productAmount};
  Cart.findOneAndUpdate(
    { _id: cartId, 'items.product_id': productId },
    { $set: { 'items.$.amount' : productAmount } },
    { new: true },
    (error, cartDocument) => {
      if (error) return callback(`Failed to update the item in the cart! => ${error}`);
      if (isEmpty(cartDocument)) {
        Cart.findOneAndUpdate(
          { _id: cartId },
          { $push: {items: productItem} },
          { new: true },
          (error, cartDocument) => {
            if (error) {
              responseSent = true;
              callback(`Failed to push a new item in the cart! => ${error}`);
            } else if (isEmpty(cartDocument)) {
              responseSent = true;
              callback(`Failed to push a new item in the cart! => ${error}`);
            } else {
              responseSent = true;
              callback(undefined, cartDocument);
            }
          });
      } else if (!responseSent) {
          callback(undefined, cartDocument);
        }
    });
};

function removeItem (cartId, productId, getFullCart, callback) {
  findOneAndUpdate(cartId, productId, false, true)
    .then(cart => {
      if ((cart.items.length == 0) || (getFullCart === 'false')) {
        callback(undefined, cart);
      } else {
        buildFullCart(cart, (errorMessage, fullCart) => {
          if (errorMessage) {
            callback(`Failed to load a full cart! => ${errorMessage}`);
          } else {
            callback(undefined, fullCart);
          }
        });
      }
    })
    .catch(error => callback(`Failed to delete the item from the cart! => ${error}`));
};

// functions to form the proper response format
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

async function findOneAndUpdate (cartId, productId, getCart, removeItem) {
  if (getCart)
    return await Cart.findOneAndUpdate({}, { expire: new Date()}, { upsert: true, new: true, setDefaultsOnInsert: true });

  if (removeItem)
    return await Cart.findOneAndUpdate({ _id: cartId }, { $pull: {items: { product_id: productId } } }, { new: true });
};

module.exports = {
  buildFullCart,
  buildFullProduct,
  getCart,
  insertUpdateItem,
  removeItem,
};
