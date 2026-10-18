// json_xml_demo.js - Handling JSON and XML data in Node.js
const fs = require('fs');
const xml2js = require('xml2js');

// Step 2: Create a JavaScript object
const productData = {
  id: "PROD-1001",
  name: "Sony WH-1000XM5 Bluetooth Headphones",
  price: 8500000,
  inStock: true,
  categories: ["Audio", "Electronics", "Wireless"],
  supplier: {
    name: "Sony Vietnam",
    contact: "support@sony.com.vn"
  }
};

// Step 3: Convert the JS object to JSON format
const jsonString = JSON.stringify(productData, null, 2);
console.log("=== 1. FORMATTED JSON STRING ===");
console.log(jsonString);
fs.writeFileSync('product.json', jsonString, 'utf8');

// Step 4: Convert the JS object to XML format
const builder = new xml2js.Builder({ rootName: 'Product' });
const xmlData = builder.buildObject(productData);
console.log("\n=== 2. CONVERTED TO XML FORMAT ===");
console.log(xmlData);
fs.writeFileSync('product.xml', xmlData, 'utf8');

// Step 5: Read the XML file and parse it back into a JS object
fs.readFile('product.xml', 'utf8', (err, data) => {
  if (err) throw err;
  xml2js.parseString(data, { explicitArray: false }, (err, result) => {
    if (err) throw err;
    console.log("\n=== 3. XML FILE PARSED BACK INTO A JS OBJECT ===");
    console.log(result.Product);
    console.log(`Parsed product name: ${result.Product.name}`);
  });
});

// =================================================================
// Step 6: Read product.json, calculate 10% discount, and save to product_final.json
// =================================================================
fs.readFile('product.json', 'utf8', (err, data) => {
  if (err) {
    console.error("Lỗi khi đọc file product.json:", err);
    return;
  }

  // Parse chuỗi JSON thành JavaScript Object
  const product = JSON.parse(data);

  // Kiểm tra trường price hợp lệ (là số và > 0)
  if (typeof product.price === 'number' && product.price > 0) {
    // Tính giá giảm 10% (giá gốc * 0.9)
    const discountPrice = product.price * 0.9;

    // Thêm trường discountPrice vào object
    product.discountPrice = discountPrice;

    // Ghi object đã cập nhật ra file product_final.json
    const updatedJsonString = JSON.stringify(product, null, 2);
    fs.writeFileSync('product_final.json', updatedJsonString, 'utf8');

    console.log("\n=== 4. PROCESSED & SAVED TO product_final.json ===");
    console.log(`Original Price: ${product.price} VND`);
    console.log(`Discount Price (10% off): ${product.discountPrice} VND`);
  } else {
    console.log("Invalid product price!");
  }
});