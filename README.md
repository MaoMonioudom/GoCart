# Gocart. 

## Dependencies
- "react-router-dom" 

## Project Folder Structure
```
GoCart/
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── logos/
│   │
│   ├── components/
│   │   ├── common/              # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Loader.jsx
│   │   │
│   │   ├── layout/              # Layout components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.jsx
│   │   │
│   │   └── product/
│   │       ├── ProductCard.jsx
│   │       ├── ProductList.jsx
│   │       └── ProductDetail.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Category.jsx
│   │   ├── Product.jsx
│   │   └── NotFound.jsx
│   │
│   ├── data/
│   │   └── products.js          # Mock product data
│   │
│   ├── styles/
│   │   └── global.css
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```
