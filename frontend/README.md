# 🚀 Frontend - Job board

This is the frontend application built using Next.js (App Router), Redux Toolkit, Redux Saga, and MUI.

---

## 📁 Project Structure

```bash
frontend/
├── .next/
├── node_modules/
├── public/

├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── register/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx   # Redux + Persist wrapper
│   │
│   ├── assets/             # Images, icons
│   ├── components/         # Reusable UI components
│   ├── constants/          # Static values, enums
│   ├── hooks/              # Custom React hooks
│   ├── screens/            # Page-level logic
│   │
│   ├── store/
│   │   ├── index.ts        # configureStore
│   │   ├── hooks.ts        # typed hooks (useAppDispatch)
│   │
│   │   ├── ActionTypes/    # all action constants
│   │   ├── Saga/           # rootSaga
│   │
│   │   ├── auth/           # login, register
│   │   ├── user/           # user management
│   │   ├── admin/          # admin features
│   │   ├── jobs/           # job module
│   │   ├── applications/   # job applications
│   │   ├── notification/   # socket + notifications
│   │   ├── ui/             # loader, global UI state
│   │
│   ├── theme/              # MUI theme config
│   ├── types/              # TypeScript types
│   ├── utils/              # axios, socket, helpers
│
├── .env
├── .env.example
```

---

## 🧠 Architecture Explanation

### 🔹 `app/`

* Next.js App Router
* Handles routing (login, register, dashboard)
* `providers.tsx` → Redux + Persist wrapper

---

### 🔹 `store/` (Core Logic)

Each module follows:

```bash
domain/
 ├── domainSlice.ts
 ├── domainAction.ts
 ├── domainAPI.ts
 ├── domainWatcher.ts
```

Example:

* `auth/` → login, token
* `jobs/` → job listing
* `applications/` → apply + status
* `notification/` → socket events

---

### 🔹 `Saga/`

* Root saga combining all watchers

---

### 🔹 `utils/`

* axios instance
* socket connection
* helper functions

---

### 🔹 `components/`

* Reusable UI
* tables, modals, inputs, layout

---

### 🔹 `screens/`

* Business logic layer
* connects UI + Redux

---

### 🔹 `theme/`

* MUI customization

---

## ⚙️ Environment Setup

```env
NEXT_PUBLIC_BASE_URL=http://localhost:4000
```

---

## 🔑 Key Features

* Redux Toolkit + Saga architecture
* Role-based system (Admin / Recruiter / Candidate)
* Real-time notifications (Socket.io)
* Advanced search + filters
* JWT auth with refresh token
* MUI-based responsive UI
* Scalable folder structure

---

## ▶️ Run Project

```bash
npm install
npm run dev
```

App:

```
http://localhost:3000
```

---

## 🧠 Important Notes

* All API calls handled via `utils/axios.ts`
* All async handled via Redux Saga
* Notifications handled via `utils/socket.ts`
* Global loader handled via `store/ui`

---

## 👨‍💻 Author

Mitul Kalsariya
