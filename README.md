# Digital Gold & Silver (DGS) Trading Platform

![Digital Gold Silver Banner](https://img.shields.io/badge/Status-Active-brightgreen) ![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue) ![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)

A comprehensive, role-based trading platform for Digital Gold and Silver. This platform facilitates seamless transactions between Customers and Dealers, overseen by an Admin panel to ensure security and compliance.

## 🚀 Features

*   **Role-Based Access Control (RBAC):** Distinct dashboards and access levels for Customers, Dealers, and Administrators.
*   **Live Market Prices:** Real-time updates for Gold and Silver prices dictated by approved dealers.
*   **OTP Verification:** Secure email-based OTP (One-Time Password) generation for registration and login validation.
*   **QR Invoices:** View and download transaction invoices complete with scannable QR codes.
*   **Micro-Frontend Architecture:** Three distinctly split React applications interacting with a centralized Node.js REST API.

---

## 🏗️ Architecture & Project Structure

The repository is structured into a central backend API and three independent front-end portal applications to allow isolated environments and secure deployment.

```text
/DIGITAL---GOLD-SILVER
 ├── /server      # Node.js/Express Backend API (Port 5000)
 ├── /customer    # React/Vite Customer Facing Portal (Port 5173)
 ├── /admin       # React/Vite Administrative Portal (Port 5174)
 └── /dealer      # React/Vite Dealer Management Portal (Port 5175)
```

## 🛠️ Tech Stack

### Frontend
- **React.js 19** with **Vite** for incredibly fast HMR and compilation.
- **React Router DOM v7** for declarative application routing.
- **React Toastify** for elegant toast notifications.
- **Axios** for HTTP requests connecting to the backend.

### Backend
- **Node.js & Express.js** for robust backend routing.
- **MongoDB & Mongoose** for NoSQL data modeling.
- **Nodemailer** for sending OTP validation emails.
- **JSON Web Tokens (JWT)** & **Bcrypt.js** for secure stateless authentication.

---

## ⚙️ Setup & Installation

Follow these steps to get your development environment set up:

### 1. Clone the repository
```bash
git clone https://github.com/Gnanesh-12/DIGITAL---GOLD-SILVER.git
cd DIGITAL---GOLD-SILVER
```

### 2. Environment Variables
Navigate to the `/server` directory and configure your `.env` file with the required credentials.
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_smtp_email
EMAIL_PASS=your_smtp_password
```

### 3. Install Dependencies
You will need to install the NPM packages for the backend and all three frontend applications.

```bash
# Install Server Dependencies
cd server && npm install

# Install Frontend Dependencies
cd ../customer && npm install
cd ../admin && npm install
cd ../dealer && npm install
```

---

## 💻 Running the Application

To run the full stack locally, you will need **four** separate terminal windows.

**Terminal 1: Start the Backend Server**
```bash
cd server
npm start # or node index.js
```

**Terminal 2: Start the Customer Portal**
```bash
cd customer
npm run dev
# Runs on http://localhost:5173
```

**Terminal 3: Start the Admin Portal**
```bash
cd admin
npm run dev
# Runs on http://localhost:5174
```

**Terminal 4: Start the Dealer Portal**
```bash
cd dealer
npm run dev
# Runs on http://localhost:5175
```

## 🛡️ Authentication Flow

1. **Customers** can register and immediately log in upon OTP verification.
2. **Dealers** can register but will be placed in a `Pending Approval` state until an Administrator verifies and approves their account on the Admin Portal.
3. Every session strictly validates the role-based token. If a token logged in as a 'Dealer' attempts to navigate to the 'Customer' Portal, they will be met with an *Access Denied* screen to prevent accidental session pollution.

---
*Built securely for digital trading and inventory management.*
