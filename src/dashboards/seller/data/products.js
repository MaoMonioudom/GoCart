import iPad from "../../../assets/images/ipad.jpg";
import Shirt from "../../../assets/images/shirt.jpg";
import Book from "../../../assets/images/book.jpg";
import Sock from "../../../assets/images/socks.jpg";
import Noodles from "../../../assets/images/noodles.jpg";
import Milk from "../../../assets/images/milk.jpg";
import Banana from "../../../assets/images/banana.png";

export const products = [
  {
    id: 1,
    name: "iPad",
    category: "Electronic",
    price: 349,
    stock: 500,
    rating: 5,
    discount: "50%",
    status: "Active",
    image: iPad,
    details: {
      brand: "Apple",
      material: "Aluminum",
      color: "Silver",
    },
  },
  {
    id: 2,
    name: "Oversized T-Shirt",
    category: "Fashion and Clothing",
    price: 30,
    stock: 2500,
    rating: 4,
    discount: "0%",
    status: "Active",
    image: Shirt,
    details: {
      brand: "ZARA",
      size: "M, L, XL",
      fabric: "Cotton",
    },
  },
  {
    id: 3,
    name: "How to Win Friends & Influence People",
    category: "Book",
    price: 28,
    stock: 1900,
    rating: 3,
    discount: "0%",
    status: "Active",
    image: Book,
    details: {
      author: "Dale Carnegie",
      pages: 320,
    },
  },
  {
    id: 4,
    name: "Socks",
    category: "Fashion and Clothing",
    price: 4.5,
    stock: 1900,
    rating: 3,
    discount: "0%",
    status: "Active",
    image: Sock,
    details: {
      brand: "Uniqlo",
      fabric: "Cotton",
      size: "Free Size",
    },
  },
  {
    id: 5,
    name: "Dried White Noodles Egg",
    category: "Food and Drink",
    price: 10,
    stock: 1900,
    rating: 3,
    discount: "0%",
    status: "Active",
    image: Noodles,
    details: {
      brand: "Local Farm",
      ingredients: "Wheat, Egg",
      expirationDate: "2026-01-01",
    },
  },
  {
    id: 6,
    name: "Kirisu Milk Full Cream",
    category: "Food and Drink",
    price: 5,
    stock: 1900,
    rating: 3,
    discount: "0%",
    status: "Active",
    image: Milk,
    details: {
      brand: "Kirisu",
      ingredients: "Milk",
      expirationDate: "2026-03-10",
    },
  },
  {
    id: 7,
    name: "Khmer Banana",
    category: "Food and Drink",
    price: 5,
    stock: 1900,
    rating: 3,
    discount: "0%",
    status: "Active",
    image: Banana,
    details: {
      origin: "Cambodia",
      type: "Organic",
    },
  },
];
