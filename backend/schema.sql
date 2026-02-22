/* =========================================================
   USERS TABLE
   ========================================================= */
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


/* =========================================================
   ADDRESSES TABLE
   ========================================================= */
CREATE TABLE addresses (
    address_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    street_address TEXT,
    city_province VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


/* =========================================================
   SELLER TABLE
   ========================================================= */
CREATE TABLE seller (
    seller_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE,
    shop_name VARCHAR(150),
    shop_description TEXT,
    bank_account VARCHAR(150),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


/* =========================================================
   CATEGORIES TABLE
   ========================================================= */
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(120)
);


/* =========================================================
   PRODUCTS TABLE
   ========================================================= */
CREATE TABLE products (
    product_id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT,
    category_id INT,
    name VARCHAR(200),
    description TEXT,
    price NUMERIC(10,2),
    status VARCHAR(50),
    current_stock_level INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (seller_id)
        REFERENCES seller(seller_id)
        ON DELETE CASCADE,

    FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE SET NULL
);


/* =========================================================
   PRODUCT IMAGES TABLE
   ========================================================= */
CREATE TABLE product_image (
    image_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT,
    image_url TEXT,
    is_main BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
);


/* =========================================================
   ORDERS TABLE
   ========================================================= */
CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    address_id BIGINT,
    total_amount NUMERIC(10,2),
    status VARCHAR(50),
    payment_status VARCHAR(50),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    FOREIGN KEY (address_id)
        REFERENCES addresses(address_id)
);


/* =========================================================
   ORDER ITEMS TABLE
   ========================================================= */
CREATE TABLE order_item (
    item_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT,
    product_id BIGINT,
    quantity INT,
    unit_price NUMERIC(10,2),
    final_price NUMERIC(10,2),
    promo_id BIGINT,

    FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
);


/* =========================================================
   PAYMENTS TABLE
   ========================================================= */
CREATE TABLE payment (
    payment_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT,
    user_id BIGINT,
    amount NUMERIC(10,2),
    payment_method VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id)
        REFERENCES orders(order_id),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);


/* =========================================================
   REVIEWS TABLE
   ========================================================= */
CREATE TABLE review (
    review_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    product_id BIGINT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
);


/* =========================================================
   USER ACTIVITY LOGS TABLE
   ========================================================= */
CREATE TABLE user_activities_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    product_id BIGINT,
    action_type VARCHAR(100),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
);


/* =========================================================
   PROMOTIONS TABLE
   ========================================================= */
CREATE TABLE promotions (
    promo_id BIGSERIAL PRIMARY KEY,
    promo_name VARCHAR(150),
    disc_pct NUMERIC(5,2),
    disc_amount NUMERIC(10,2),
    start_date DATE,
    end_date DATE
);


/* =========================================================
   PRODUCT PROMOTION TABLE (MANY-TO-MANY)
   ========================================================= */
CREATE TABLE product_promotion (
    product_id BIGINT,
    promo_id BIGINT,
    PRIMARY KEY (product_id, promo_id),

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,

    FOREIGN KEY (promo_id)
        REFERENCES promotions(promo_id)
        ON DELETE CASCADE
);


/* =========================================================
   STOCK PREDICTION HISTORY TABLE
   ========================================================= */
CREATE TABLE stock_prediction_hist (
    prediction_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT,
    prediction_month DATE,
    predicted_quantity INT,
    actual_quantity INT,
    promo_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
        REFERENCES products(product_id),

    FOREIGN KEY (promo_id)
        REFERENCES promotions(promo_id)
);
