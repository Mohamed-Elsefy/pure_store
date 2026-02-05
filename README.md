# E-Commerce SPA – Vanilla JavaScript

A scalable Single Page Application (SPA) architecture built using **Vanilla JavaScript** with a clear separation of concerns and no external frameworks.  
This project focuses on **clean architecture**, **maintainability**, and **extensibility**, making it suitable as a production-ready foundation for e-commerce applications.

---

## 🎯 Project Goals

- Build a full SPA without frameworks (React / Vue / Angular)
- Apply layered architecture and modular design
- Keep the codebase scalable and easy to reason about
- Separate UI, state, routing, and business logic

---

## 🧱 Architecture Overview

The application follows a **feature-based + layered architecture**:

- **Router**: Client-side routing using hash-based navigation
- **Controllers**: Each feature has its own controller
- **Templates**: HTML templates loaded dynamically
- **Layouts**: Persistent UI components (Navbar / Footer)
- **Store**: Centralized state management (inspired by Redux)
- **Actions & Selectors**: Clear state mutation and access
- **Services**: HTTP layer wrapping the Fetch API
- **Configs**: Centralized configuration files

---

## 📁 Project Structure

├── .gitignore
├── package-lock.json
├── package.json
├── README.md
├── assets
│   ├── css
│   │   └── output.css
│   ├── fonts
│   ├── icons
│   └── images
├── node_modules
├── src
│   ├── index.html
│   ├── main.js
│   ├── core
│   │   ├── config
│   │   │   ├── api.config.js
│   │   │   └── routes.config.js
│   │   ├── router
│   │   │   └── router.js
│   │   ├── services
│   │   │   ├── auth.service.js
│   │   │   ├── cart.service.js
│   │   │   ├── category.service.js
│   │   │   ├── http.service.js
│   │   │   ├── payment.service.js
│   │   │   └── product.service.js
│   │   ├── store
│   │   │   ├── actions.js
│   │   │   ├── selectors.js
│   │   │   └── store.js
│   │   └── utils
│   │       ├── formatter.js
│   │       ├── guards.js
│   │       ├── storage.js
│   │       └── template.loader.js
│   ├── features
│   │   ├── admin
│   │   │   ├── admin.controller.js
│   │   │   └── admin.view.js
│   │   ├── auth
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.template.html
│   │   │   └── auth.view.js
│   │   ├── cart
│   │   │   ├── cart.controller.js
│   │   │   ├── cart.template.html
│   │   │   └── cart.view.js
│   │   ├── checkout
│   │   │   ├── checkout.controller.js
│   │   │   ├── checkout.template.html
│   │   │   └── checkout.view.js
│   │   ├── home
│   │   │   ├── home.controller.js
│   │   │   └── home.template.html
│   │   └── products
│   │       ├── products.controller.js
│   │       ├── products.template.html
│   │       └── products.view.js
│   ├── layouts
│   │   ├── footer.js
│   │   ├── footer.template.html
│   │   ├── navbar.js
│   │   └── navbar.template.html
│   └── styles
│       ├── base.css
│       ├── main.css
│       ├── tailwind.css
│       └── theme.css


---

## 🧭 Routing System

- Hash-based routing (`#/home`, `#/products`, etc.)
- Central route configuration
- Dynamic controller loading via ES Modules
- Graceful 404 handling

---

## 🧠 State Management

A lightweight global store provides:

- Centralized application state
- Subscriptions for reactive UI updates
- Actions for controlled state mutations
- Selectors for derived data

State includes:
- Authentication
- Cart
- Products
- UI theme
- Loading states

---

## 🌐 HTTP Service

A unified HTTP service that:

- Wraps the Fetch API
- Automatically attaches headers and auth tokens
- Handles errors consistently
- Supports GET / POST / PUT / DELETE

---

## 🧩 Layout System

- Persistent **Navbar** and **Footer**
- Loaded once and kept across route changes
- Decoupled from feature rendering

---

## 🚀 Getting Started

1. Clone the repository
2. Run a local server (required for ES Modules)
3. npx @tailwindcss/cli -i ./src/styles/main.css -o ./assets/css/output.css --watch

