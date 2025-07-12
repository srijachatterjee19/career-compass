// 'use client';

// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import RegisterForm from '../components/RegisterForm';
// import LoginForm from '../components/LoginForm';
// import LogoutButton from '../components/LogoutButton';
// import UsersView from '../components/UsersView';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* <Route path="/" element={<MainPage />} /> */}
//         <Route path="/login" element={<LoginForm />} />
//         <Route path="/register" element={<RegisterForm />} />
//         <Route path="/users" element={<UsersView />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
'use client';

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Career Compass</h1>
      <p>Please navigate to /login, /register, or /users to access the respective pages.</p>
    </div>
  );
}