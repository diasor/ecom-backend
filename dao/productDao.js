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
      if (error) return callback(`Failed to get product. => ${error}.`);
      productsResults = [];
      each(products, (item) => {
        const productItem = buildProduct(item);
        productsResults.push(productItem);
      });
      return callback(undefined, productsResults);
    });
};

function getProductById (id, callback) {
  // returns a single product identified by the parameter id
  Product.findOne({_id: id}, (error, productDocument) => {
    if (error) return callback(`Failed to get product by id. => ${error}.`);
    const fullProduct = buildProduct(productDocument);
    return callback(undefined, fullProduct);
  });
};

function createProduct (item, callback) {
  // create and save the product
  const newProduct = new Product(item);
  newProduct.save((error, savedProduct) => {
    if (error) return callback(`Error creating a new product: ${error}.`);
    return callback(undefined, savedProduct)
  });
};

function updateProduct (item, newFileName, callback) {
  // if the object already existed, the it must be found in the database to be updated
  Product.findById({_id: item._id}, (error, productDocument) => {
    // updates the product payload
    productDocument.name = item.name;
    productDocument.description = item.description;
    productDocument.price = item.price;
    productDocument.manufacturer = item.manufacturer;
    if (newFileName) {
      // checking whether a new image must be uploaded (and the old one should be deleted)
      const newImageName = item.imageName;
      // get the old image for deletation
      oldImageName = productDocument.imageName;
      productDocument.imageName = newImageName;

      // upload new image and delete old one
      const uploadDir = getImagePath();
      const oldImagePath = `${uploadDir}${oldImageName}`;
      deleteImage(oldImagePath);
    }
    // saves the product
    productDocument.save((error, savedProduct) => {
      if (error) return callback(`Error updating a product: ${error}.`);
      return callback(undefined, savedProduct)
    });
  });
};

function removeProduct (id, callback) {
  // this function finds a product by id, and if it exists, removes interval
  // if the product had an image, this function removes the image too
  Product.findOneAndRemove({_id: id}, (error, productDocument) => {
    if (error) return callback(`Error finding the product: ${id}. ERROR: ${error}`);
    // if the removed document had an image, it must be deleted from the server
    if (!isEmpty(productDocument.imageName)) {
      const uploadDir = getImagePath();
      const removeImageName = `${uploadDir}${productDocument.imageName}`;
      deleteImage(removeImageName);
      // the object has been successfully removed as well as it's image
      return callback(undefined, productDocument);
    }
    // if the object didn't have an image, it will still be returned
    return callback(undefined, productDocument);
  });
};

function buildProduct (itemResult) {
  const uploadDir = getImagePath();
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
    } catch (error)  {
      productItem.image =  '';
      console.log(`Error reading an image ${error}.`);
    }
  }
  return productItem;
};

function deleteImage (imageName) {
  fs.unlink(imageName, (error) => {
    if (error && error.code == 'ENOENT') {
      // file doesn't exist
      console.log("File doesn't exist, won't remove it.");
    } else if (error) {
      // other errors, e.g. maybe we don't have enough permissions
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
  getProductById,
  createProduct,
  updateProduct,
  getImagePath,
  buildProduct,
  removeProduct,
};
