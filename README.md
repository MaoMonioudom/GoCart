# Gocart. 

## Dependencies
- "react-router-dom" 

## Project Folder Structure
```
gocart/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── assets/
    │   ├── images/
    │   ├── icons/
    │   └── logos/
    │
    ├── components/
    │   ├── common/
    │   │   ├── Button.jsx
    │   │   └── Loader.jsx
    │   └── layout/
    │       ├── Nav.jsx
    │       └── Footer.jsx
    ├── dashboards/
    │   ├── customer/
    │   │   ├── pages/
    │   │   │   ├── CustomerHome.jsx
    │   │   │   ├── CustomerProduct.jsx
    │   │   │   ├── CustomerPromotion.jsx
    │   │   │   ├── CustomerCart.jsx
    │   │   │   └── ---more---.jsx
    │   │   │
    │   │   └── components/
    │   │       ├── Navbar.jsx
    │   │       └── ---more---.jsx
    │   │
    │   ├── seller/
    │   │   ├── pages/
    │   │   │   ├── Inbox.jsx
    │   │   │   ├── MLPrediction.jsx
    │   │   │   ├── Product.jsx
    │   │   │   ├── SellerHome.jsx
    │   │   │   ├── SellerProfile.jsx
    │   │   │
    │   │   ├── components/
    │   │   │    └── Navbar.jsx
    │   │   └── data/
    │   │       ├── comparisonData.js
    │   │       ├── index.js
    │   │       ├── kpis.js
    │   │       ├── mlPredictionData.js
    │   │       ├── products.js
    │   │       ├── quantityData.js
    │   │       ├── restockAlerts.js
    │   │       └── salesTrendData.js
    │   │
    │   └── admin/
    │       ├── pages/
    │       │   ├── AdminHome.jsx
    │       │   └── ---more---.jsx
    │       │
    │       └── components/
    │           ├── Navbar.jsx
    │           └── ---more---.jsx
    │   
    ├── routes/
    │   ├── AppRoutes.jsx
    │   ├── ProtectedRoute.jsx
    │   └── RoleRoute.jsx
    │
    ├── services/
    │   ├── api.js          # axios / fetch base config
    │   ├── authService.js
    │   ├── productService.js
    │   └── userService.js
    │
    ├── context/
    │   └── AuthContext.jsx
    │
    ├── hooks/
    │   └── useAuth.js
    │
    ├── styles/
    │   └── global.css
    │
    ├── App.jsx
    └── main.jsx

```
