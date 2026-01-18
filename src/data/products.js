// src/data/products.js

// Import just the first few images for mockup purposes, 
// but you can extend all the way up to pic84 later if you have them
import pic1 from "../assets/images/CategoryFive/Pic1.png";
import pic2 from "../assets/images/CategoryFive/Pic2.png";
import pic3 from "../assets/images/CategoryFive/Pic3.png";
import pic4 from "../assets/images/CategoryFive/Pic4.png";
import pic5 from "../assets/images/CategoryFive/Pic5.png";
import pic6 from "../assets/images/CategoryFive/Pic6.png";
import pic7 from "../assets/images/CategoryFive/Pic7.png";
import pic8 from "../assets/images/CategoryFive/Pic8.png";
import pic9 from "../assets/images/CategoryFive/Pic9.png";
import pic10 from "../assets/images/CategoryFive/Pic10.png";
// ... continue importing until pic84 from all categories

const allProducts = [
  { id: 1, image: pic1, name: "Product 1", brand: "Brand A", price: 12.99 },
  { id: 2, image: pic2, name: "Product 2", brand: "Brand B", price: 23.5 },
  { id: 3, image: pic3, name: "Product 3", brand: "Brand C", price: 9.99 },
  { id: 4, image: pic4, name: "Product 4", brand: "Brand D", price: 15.0 },
  { id: 5, image: pic5, name: "Product 5", brand: "Brand E", price: 29.99 },
  { id: 6, image: pic6, name: "Product 6", brand: "Brand F", price: 5.49 },
  { id: 7, image: pic7, name: "Product 7", brand: "Brand G", price: 45.0 },
  { id: 8, image: pic8, name: "Product 8", brand: "Brand H", price: 19.99 },
  { id: 9, image: pic9, name: "Product 9", brand: "Brand I", price: 8.75 },
  { id: 10, image: pic10, name: "Product 10", brand: "Brand J", price: 14.99 },
  // ... continue creating products until id 84
];

export default allProducts;
