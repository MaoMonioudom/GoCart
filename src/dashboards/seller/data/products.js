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
    category: "Apple - Electronic",
    price: 349,                 // numeric for calculations
    displayPrice: "$349.00",    // string for SellerHome
    stock: 500,
    rating: 5,
    discount: "50%",
    status: "Active",
    image: iPad,
  },
  {
    id: 2,
    name: "Oversized T-Shirt",
    category: "ZARA - Fashion",
    price: 30,
    displayPrice: "$30.00",
    stock: 2500,
    rating: 4,
    discount: "0%",
    status: "Active",
    image: Shirt,
  },
  {
    id: 3,
    name: "HTWFAIPPL BOOK",
    category: "Dale Carnegie - Book",
    price: 28,
    displayPrice: "$28.00",
    stock: 1900,
    rating: 3,
    discount: "0%",
    status: "Active",
    image: Book,
  },
  {
    id: 4,
    name: "Socks",
    category: "Fashion & Clothing",
    price: 450,
    displayPrice: "$450.00",
    stock: 1900,
    rating: 3,
    discount: "0%",
    status: "Active",
    image: Sock,
  },
  {
    id: 5,
    name: "Dried White Noodles Egg",
    category: "Food & Drinks",
    price: 10,
    displayPrice: "$10.00",
    stock: 1900,
    rating: 3,
    discount: "0%",
    status: "Active",
    image: Noodles,
  },
  {
    id: 6,
    name: "Kirisu Milk Full Cream",
    category: "Food & Drinks",
    price: 5,
    displayPrice: "$5.00",
    stock: 1900,
    rating: 3,
    discount: "0%",
    status: "Active",
    image: Milk,
  },
  {
    id: 7,
    name: "Khmer Banana",
    category: "Food & Drinks",
    price: 5,
    displayPrice: "$5.00",
    stock: 1900,
    rating: 3,
    discount: "0%",
    status: "Active",
    image: Banana,
  },
];
