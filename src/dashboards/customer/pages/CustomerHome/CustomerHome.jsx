import Navbar from "../../../../components/layout/Navbar/Navbar";
import Footer from "../../../../components/layout/Footer/Footer";
// import Button from "../../../../components/common/Button/Button";
// import Loader from "../../../../components/common/Loader/Loader";
import ProductList from "../../../../components/ProductList/ProductList";
import allProducts from "../../../../data/products";
// import { useState, useEffect } from "react";
import "./CustomerHome.css";

function CustomerHome() {

  return (
    <div className="page">
      <Navbar />

      <div className="page-body">
        <main className="page-content">
          <ProductList products={allProducts} onAddToCart={(product) => {
            console.log("Add to cart:", product);
          }} />
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default CustomerHome;
