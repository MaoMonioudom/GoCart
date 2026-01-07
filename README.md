# Gocart. 

## Dependencies
- "react-router-dom" 

## Project Folder Structure
```
gocart-frontend/
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
    │   │   ├── Button/
    │   │   │   ├── Button.jsx
    │   │   │   └── Button.css
    │   │   │
    │   │   ├── Modal/
    │   │   │   ├── Modal.jsx
    │   │   │   └── Modal.css
    │   │   │
    │   │   └── Loader/
    │   │       ├── Loader.jsx
    │   │       └── Loader.css
    │   │
    │   └── layout/
    │       ├── Navbar/
    │       │   ├── Navbar.jsx
    │       │   └── Navbar.css
    │       │
    │       ├── Sidebar/
    │       │   ├── Sidebar.jsx
    │       │   └── Sidebar.css
    │       │
    │       └── Footer/
    │           ├── Footer.jsx
    │           └── Footer.css
    │
    ├── dashboards/
    │   ├── customer/
    │   │   ├── pages/
    │   │   │   ├── CustomerHome/
    │   │   │   │   ├── CustomerHome.jsx
    │   │   │   │   └── CustomerHome.css
    │   │   │   │
    │   │   │   ├── Orders/
    │   │   │   │   ├── Orders.jsx
    │   │   │   │   └── Orders.css
    │   │   │   │
    │   │   │   └── Profile/
    │   │   │       ├── Profile.jsx
    │   │   │       └── Profile.css
    │   │   │
    │   │   ├── components/
    │   │   │   ├── OrderCard/
    │   │   │   │   ├── OrderCard.jsx
    │   │   │   │   └── OrderCard.css
    │   │   │   │
    │   │   │   └── ReviewForm/
    │   │   │       ├── ReviewForm.jsx
    │   │   │       └── ReviewForm.css
    │   │   │
    │   │   └── customerService.js
    │   │
    │   ├── seller/
    │   │   ├── pages/
    │   │   │   ├── SellerHome/
    │   │   │   ├── Products/
    │   │   │   └── SalesAnalytics/
    │   │   │
    │   │   ├── components/
    │   │   │   ├── ProductCard/
    │   │   │   └── StockTable/
    │   │   │
    │   │   └── sellerService.js
    │   │
    │   └── admin/
    │       ├── pages/
    │       │   ├── AdminHome/
    │       │   ├── Users/
    │       │   └── Reports/
    │       │
    │       ├── components/
    │       │   ├── UserTable/
    │       │   └── StatsCard/
    │       │
    │       └── adminService.js
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
