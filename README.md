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
    │   │   ├── Button.jsx
    │   │   └── Model.jsx
    │   └── layout/
    │       ├── Button.jsx
    │       └── Model.jsx
    │
    ├── dashboards/       
    │   ├── customer/
    │   │   ├── pages/
    │   │   │   ├── CustomerHome.jsx
    │   │   │   ├── Orders.jsx
    │   │   │   └── Profile.jsx
    │   │   │
    │   │   ├── components/
    │   │   │   ├── OrderCard.jsx
    │   │   │   └── ReviewForm.jsx
    │   │   │
    │   │   └── customerService.js
    │   │
    │   ├── seller/
    │   │   ├── pages/
    │   │   │   ├── SellerHome.jsx
    │   │   │   ├── Products.jsx
    │   │   │   └── SalesAnalytics.jsx
    │   │   │
    │   │   ├── components/
    │   │   │   ├── ProductCard.jsx
    │   │   │   └── StockTable.jsx
    │   │   │
    │   │   └── sellerService.js
    │   │
    │   └── admin/
    │       ├── pages/
    │       │   ├── AdminHome.jsx
    │       │   ├── Users.jsx
    │       │   └── Reports.jsx
    │       │
    │       └── components/
    │           ├── UserTable.jsx
    │           └── StatsCard.jsx      
    │
    ├── routes/  
    │   ├── AppRoutes.jsx
    │   ├── ProtectedRoute.jsx
    │   └── RoleRoute.jsx
    │
    ├── services/  
    │   ├── auth.js
    │   ├── product.js
    │   └── user.js
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
