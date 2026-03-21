# Gocart. 

## Dependencies
- "react-router-dom" 

## How to run the project
clone the project
```
git clone -b Customer https://github.com/MaoMonioudom/GoCart
```
go into project 
```
cd gocart
```
TO RUN THE SERVER
```
cd backend
```
create virtual environment
```
python -m venv venv
```
activate venv for bash
```
source venv/scripts/activate
```
install dependency
```
pip install -r requirements.txt
```
run server
```
python app.py
```
TO RUN WEB INTERFACE
in new terminal
```
cd gocart/frontend && npm i && npm run dev
```



## Project Folder Structure
```
backend/
├── middleware/
│   └── auth_middleware.py
|
├── models/
│   ├── forecasting_model/
│   └── rcm_model/
| 
├── ml/
│   └── recommend.py
|
├── routes/
│   ├── admin.py
│   ├── auth.py
│   ├── customer.py
│   ├── order.py
│   ├── product.py
│   └── seller.py
|
├── services/
│   ├── admin_service.py
│   ├── auth_service.py
│   ├── customer_service.py
│   ├── ml_service.py
│   ├── order_service.py
│   ├── product_service.py
│   ├── promotion_service.py
│   ├── seller_service.py
│   └── user_service.py
|
├── utils/
│   ├── hash.py
│   └── jwt_handler.py
|
├── supabase_client.py
├── config.py
├── app.py
├── schema.sql
├── requirements.txt
└── .env
```
```
frontend/
├── src/
│   ├── api/
│   │   ├── client.js
│   │   ├── auth.js
│   │   ├── customer.js
│   │   └── product.js
│   |
│   ├── assets/
│   │   ├── images/
│   │   └── logo/
│   |
│   ├── components/
│   │   ├── Button.jsx
│   │   ├── Loader.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductList.jsx
│   │   |
│   │   └── layout/
│   │       ├── Navbar.jsx
│   │       └── Footer.jsx
│   |
│   ├── context/
│   │   └── AuthContext.jsx
│   |
│   ├── dashboards/
│   |   |
│   │   ├── customer/
│   │   │   ├── components/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── SubNavbar.jsx
│   │   │   │   └── ProductCard.jsx   # (optional duplicate)
│   │   │   |
│   │   │   ├── pages/
│   │   │   │   ├── CustomerHome.jsx
│   │   │   │   ├── CustomerProduct.jsx
│   │   │   │   ├── ProductDetail.jsx
│   │   │   │   ├── Cart.jsx
│   │   │   │   ├── Checkout.jsx
│   │   │   │   ├── Order.jsx
│   │   │   │   ├── OrderDetail.jsx
│   │   │   │   ├── CustomerPromotion.jsx
│   │   │   │   └── CustomerProfile.jsx
│   │   │   |
│   │   │   └── utils/
│   │   │       └── productMapper.js
│   |   |
│   │   ├── seller/
│   │   │   ├── components/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── cards/
│   │   │   │       └── StatCard.jsx
│   │   │   |
│   │   │   ├── pages/
│   │   │   │   ├── SellerHome.jsx
│   │   │   │   ├── Product.jsx
│   │   │   │   ├── Notification.jsx
│   │   │   │   ├── MLPrediction.jsx
│   │   │   │   └── SellerProfile.jsx
│   |   |
│   │   └── admin/
│   │       ├── components/
│   │       │   ├── Navbar.jsx
│   │       │   |
│   │       │   ├── cards/
│   │       │   │   └── StatCard.jsx
│   │       │   |
│   │       │   ├── charts/
│   │       │   │   ├── BarChartBox.jsx
│   │       │   │   ├── CustomerAreaChart.jsx
│   │       │   │   ├── LineChartBox.jsx
│   │       │   │   └── PieChartBox.jsx
│   │       │   |
│   │       │   ├── layouts/
│   │       │   │   ├── DashboardLayout.jsx
│   │       │   │   └── Header.jsx
│   │       │   |
│   │       │   ├── modals/
│   │       │   │   ├── CustomerDetailModal.jsx
│   │       │   │   └── SellerDetailModal.jsx
│   │       │   |
│   │       │   └── table/
│   │       │       └── DataTable.jsx
│   │       |
│   │       └── pages/
│   │           ├── CustomerManagement.jsx
│   │           ├── SellerManagement.jsx
│   │           ├── MLInsight.jsx
│   │           └── ProfilePage.jsx
│   |
│   ├── pages/   # (keep for public pages if needed)
│   |
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   └── RoleRoute.jsx
│   |
│   ├── services/
│   │   ├── api.js
│   │   ├── adminAPI.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── notificationService.js
│   │   └── sellerDashboard.js
│   |
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .gitignore
└── README.md
```