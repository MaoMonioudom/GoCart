# Gocart. 

## Technologies & Dependencies
### Frontend Libraries
- React: Core library for building user interfaces using component-based architecture.
- React DOM: Handles rendering of React components into the browser DOM.
- React Router DOM: Manages client-side routing and navigation between pages.
- Lucide React: Provides lightweight and customizable SVG icons.
- React Icons: Icon library supporting multiple popular icon sets.
### Data Visualization
- Chart.js: JavaScript library for creating responsive and interactive charts.
- React ChartJS 2: React wrapper for Chart.js to integrate charts into React components.
- Recharts: Charting library built specifically for React, used for analytics and dashboards.

## Project Folder Structure
```
gocart/
├── public/
├── src/
│   ├── assets/              
│   │   ├── images/
│   │   ├── icons/
│   │   └── logos/
│   │
│   ├── components/           
│   │   ├── common/        
│   │   └── layout/        
│   │
│   ├── dashboards/          
│   │   ├── admin/
│   │   │   ├── components/   
│   │   │   ├── pages/      
│   │   │   └── data/        
│   │   │
│   │   ├── seller/
│   │   │   ├── components/   
│   │   │   ├── pages/    
│   │   │   └── data/         
│   │   │
│   │   └── customer/
│   │       ├── components/   
│   │       ├── pages/        
│   │       └── data/      
│   │
│   ├── services/            
│   │   ├── api.js            
│   │   ├── authService.js
│   │   ├── adminService.js
│   │   └── sellerService.js
│   │
│   ├── hooks/                
│   ├── context/              
│   ├── routes/             
│   ├── styles/            
│   ├── utils/         
│   │
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```
## Run the Project
clone the project
```bash
git clone https://github.com/MaoMonioudom/GoCart
```
``` bash
cd gocart
```
To install all required dependencies, run:
``` bash
npm install
```
run the project
``` bash
npm run dev
```
## Future Enhancement
- Integration with backend APIs for authentication and data persistence
- Machine Learning models for stock prediction and recommendation system
- Real-time analytics for seller dashboards

