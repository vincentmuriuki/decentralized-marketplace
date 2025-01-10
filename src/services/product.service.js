export const addProduct = async (productDB, product) => {
  const productId = `product-${Date.now()}`;
  await productDB.put(productId, product);
  return productId;
};

export const listProducts = async (productDB) => {
  const stream = productDB.createReadStream();
  const products = [];
  for await (const { key, value } of stream) {
    products.push({ id: key, ...value });
  }
  return products;
};
