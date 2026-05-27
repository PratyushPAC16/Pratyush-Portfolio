# Portfolio Website Monorepo

This repository contains the source code for a full-stack portfolio website.

## Structure

- **[client](./client)**: React + Vite + TypeScript frontend.
- **[server](./server)**: Node.js + Express + TypeScript backend.

## Tech Stack

### Frontend (Client)
- **Framework & Tooling**: [React](https://react.dev/), [Vite](https://vite.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling & Animations**: [TailwindCSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend (Server)
- **Runtime & Framework**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/)
- **Database & ODM**: [MongoDB](https://www.mongodb.com/), [Mongoose](https://mongoosejs.com/)
- **File Uploads**: [Multer](https://github.com/expressjs/multer)
- **Security & Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/), [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **Validation & Logs**: [Express Validator](https://express-validator.github.io/), [Morgan](https://github.com/expressjs/morgan)
- **Mailing**: [Nodemailer](https://nodemailer.com/)

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Client Setup

```bash
cd client
npm install
npm run dev
```

### Server Setup

```bash
cd server
npm install
npm run dev
```
