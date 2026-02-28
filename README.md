<img width="1917" height="851" alt="image" src="https://github.com/user-attachments/assets/5c83deb4-55b9-4394-b2b6-f15540016493" />
<img width="1825" height="859" alt="image" src="https://github.com/user-attachments/assets/e71fc422-cd17-4af4-96be-d1193db0141d" />
<img width="911" height="376" alt="image" src="https://github.com/user-attachments/assets/c2967b94-ecf8-4922-96e2-0ec5524ff89f" />
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



To run project:
npm create vite@latest gunaso-portal -- --template react
cd gunaso-portal
npm install
npm install react-router-dom
npm run dev



Project Structure:
gunaso-portal/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── CitizenModal.jsx
│   │   ├── AdminModal.jsx
│   │   ├── Alert.jsx
│   │   └── Badge.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── CitizenDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── panels/
│   │   ├── citizen/
│   │   │   ├── CDHome.jsx
│   │   │   ├── CDSubmit.jsx
│   │   │   ├── CDTickets.jsx
│   │   │   ├── CDProfile.jsx
│   │   │   └── CDNotifications.jsx
│   │   └── admin/
│   │       ├── ADHome.jsx
│   │       ├── ADGrievances.jsx
│   │       ├── ADCitizens.jsx
│   │       ├── ADReports.jsx
│   │       └── ADSettings.jsx
│   ├── context/
│   │   └── AppContext.jsx
│   ├── utils/
│   │   └── storage.js
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js









<img width="1870" height="741" alt="image" src="https://github.com/user-attachments/assets/71379cdf-25f7-47c9-8945-e0d540a4c8a4" />

