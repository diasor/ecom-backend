const { isEmpty, each } = require('lodash');
const fs = require('fs');
const path = require('path');
const { Product } = require('../models/product');

/******************************************************
  Product's Data Access Object:
    handles all the necessary database interaction
    concerning the products.
******************************************************/
function getAll (callback) {
  // returns all products
  Product.find({})
    .populate('manufacturer')
    .exec((error, products) => {
      if (error) callback(`Failed to get product. => ${error}. Bad Request.`);
      productsResults = [];
      each(products, (item) => {
        const productItem = buildProduct(item);
        productsResults.push(productItem);
      });
      callback(undefined, productsResults);
    });
};

function productById (id, callback) {
  // returns a single product identified by the parameter id
  Product.findOne({_id: id}, (error, productDocument) => {
    if (error) callback(`Failed to get product by id. => ${error}. Bad Request.`);
    const fullProduct = buildProduct(productDocument);
    callback(undefined, fullProduct);
  });
};

function buildProduct (itemResult) {
  const currentPath = process.cwd();
  const uploadDir = `${currentPath}/public/images/productImages/`;
  productItem = {
    product_id: itemResult._id,
    name: itemResult.name,
    price: itemResult.price,
    description: itemResult.description,
    imageName: itemResult.imageName,
    manufacturer: {
      id: itemResult.manufacturer._id,
      name: itemResult.manufacturer.name,
    },
    image: '',
  };
  if (!isEmpty(itemResult.imageName)) {
    let fileName = `${uploadDir}${itemResult.imageName}`;
    try {
      productItem.image =  fs.readFileSync(fileName).toString('base64');
    } catch (err)  {
      productItem.image =  '';
      console.log('Error reading an image ', err);
    }
  }
  return productItem;
};

function deleteImage (imageName) {
  fs.unlink(imageName, (err) => {
    if(err && err.code == 'ENOENT') {
      // file doens't exist
      console.log("File doesn't exist, won't remove it.");
    } else if (err) {
      // other errors, e.g. maybe we don't have enough permission
      console.log("Error occurred while trying to remove file");
    } else {
      console.log(`removed`);
    }
  });
};

function getImagePath () {
  const imagePath = process.cwd();
  return `${imagePath}/public/images/productImages/`;
};

module.exports = {
  getAll,
  productById,
  getImagePath,
  deleteImage,
  buildProduct,
};
