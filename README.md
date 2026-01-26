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
    │   │   ├── banana.png
    │   │   ├── book.jpg
    │   │   ├── HomeCustomerBanner.png
    │   │   └── logo.png
    │   │
    │   ├── categories/
    │   │   ├── CategoryOne/
    │   │   │   ├── index.js
    │   │   │   └── Pic1.png … Pic12.png
    │   │   ├── CategoryTwo/
    │   │   ├── CategoryThree/
    │   │   ├── CategoryFour/
    │   │   ├── CategoryFive/
    │   │   ├── CategorySix/
    │   │   └── CategorySeven/
    │   │
    │   └── icons/
    │       └── google-icon.png
    │
    ├── components/               # SHARED (PUBLIC + DASHBOARD)
    │   ├── common/
    │   │   ├── Button.jsx
    │   │   └── Loader.jsx
    │   │
    │   ├── layout/
    │   │   ├── Nav.jsx
    │   │   ├── Footer.jsx
    │   │   ├── Header.jsx
    │   │   └── DashboardLayout.jsx
    │   │
    │   └── Logo.jsx
    │
    ├── pages/                    # PUBLIC (NO AUTH)
    │   ├── Landing/
    │   │   └── Landing.jsx
    │   │
    │   ├── Home/
    │   │   └── Home.jsx          # auth redirect
    │   │
    │   ├── Login/
    │   │   └── Login.jsx
    │   │
    │   └── Register/
    │       └── Register.jsx
    │
    ├── dashboards/               # AUTH REQUIRED
    │   ├── customer/
    │   │   ├── pages/
    │   │   │   ├── CustomerHome.jsx
    │   │   │   ├── CustomerProduct.jsx
    │   │   │   ├── CustomerPromotion.jsx
    │   │   │   ├── CustomerCart.jsx
    │   │   │   └── CustomerProfile.jsx
    │   │   │
    │   │   └── components/
    │   │       ├── Navbar.jsx
    │   │       └── ProductCard.jsx
    │   │
    │   ├── seller/
    │   │   ├── pages/
    │   │   │   ├── SellerHome.jsx
    │   │   │   ├── Product.jsx
    │   │   │   ├── Inbox.jsx
    │   │   │   ├── MLPrediction.jsx
    │   │   │   └── SellerProfile.jsx
    │   │   │
    │   │   ├── components/
    │   │   │   └── Navbar.jsx
    │   │   │
    │   │   └── data/
    │   │       ├── comparisonData.js
    │   │       ├── kpis.js
    │   │       ├── products.js
    │   │       ├── quantityData.js
    │   │       ├── restockAlerts.js
    │   │       └── salesTrendData.js
    │   │
    │   └── admin/
    │       ├── pages/
    │       │   ├── AdminHome.jsx
    │       │   ├── CustomerManagement.jsx
    │       │   ├── SellerManagement.jsx
    │       │   ├── MLInsights.jsx
    │       │   └── ProfilePage.jsx
    │       │
    │       ├── components/
    │       │   ├── cards/
    │       │   │   └── StatCard.jsx
    │       │   │
    │       │   ├── charts/
    │       │   │   ├── BarChartBox.jsx
    │       │   │   ├── CustomerAreaChart.jsx
    │       │   │   ├── LineChartBox.jsx
    │       │   │   └── PieChartBox.jsx
    │       │   │
    │       │   ├── table/
    │       │   │   └── DataTable.jsx
    │       │   │
    │       │   ├── Logo.jsx
    │       │   └── NavBar.jsx
    │       │
    │       └── data/
    │           ├── customer.js
    │           ├── seller.js
    │           └── ml.js
    │
    ├── routes/
    │   ├── AppRoutes.jsx
    │   ├── ProtectedRoute.jsx
    │   └── RoleRoute.jsx
    │
    ├── services/
    │   ├── api.js
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
