# ecommerce-website

A simple beginner-friendly full-stack ecommerce website.

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)

## Features

- Product listing page (image, name, and price)
- Add to cart
- Cart page with total price
- User registration and login
- REST APIs for users and products
- Admin-only add and delete products
- Clean separation between `frontend/` and `backend/`

## Project Structure

```text
frontend/
  index.html
  cart.html
  auth.html
  admin.html
  style.css
  script.js

backend/
  config/db.js
  middleware/authMiddleware.js
  models/
  routes/
  server.js
```

## Setup

1. Install MongoDB locally (or use MongoDB Atlas).
2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Create environment variables:

   ```bash
   cp .env.example .env
   ```

4. Start backend server:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:5000` in the browser.

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (protected)
- `GET /api/products`
- `POST /api/products` (admin)
- `DELETE /api/products/:id` (admin)
- `GET /api/users/cart` (protected)
- `POST /api/users/cart` (protected)
- `DELETE /api/users/cart/:productId` (protected)
