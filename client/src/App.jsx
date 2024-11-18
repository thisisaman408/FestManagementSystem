/* eslint-disable no-unused-vars */
import { Route, Routes } from "react-router-dom";
import "./App.css";
import axios from "axios";
import { UserContextProvider } from "./UserContext";

import Layout from "./Layout";
import IndexPage from "./pages/IndexPage";
// import
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import UserAccountPage from "./pages/UserAccountPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AddEvent from "./pages/AddEvent";
import EventPage from "./pages/EventPage";
import CalendarView from "./pages/CalendarView";
import OrderSummary from "./pages/OrderSummary";
import PaymentSummary from "./pages/PaymentSummary";
import TicketPage from "./pages/TicketPage";
import CreateEvent from "./pages/CreateEvent";

// New pages for the Dashboard and User Authentication
import DashboardPage from "./pages/DashboardPage";
import UserLoginPage from "./pages/UserLoginPage";
import UserRegisterPage from "./pages/UserRegisterPage";

axios.defaults.baseURL = "http://localhost:4000/";
axios.defaults.withCredentials = true;

function App() {
  return (
    <UserContextProvider>
      <Routes>
        {/* Layout routes for authenticated users */}
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/useraccount" element={<UserAccountPage />} />
          <Route path="/createEvent" element={<AddEvent />} />
          <Route path="/event/:id" element={<EventPage />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/wallet" element={<TicketPage />} />
          <Route path="/event/:id/ordersummary" element={<OrderSummary />} />
          <Route
            path="/event/:id/ordersummary/paymentsummary"
            element={<PaymentSummary />}
          />
        </Route>

        {/* Public routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user-login" element={<UserLoginPage />} />
        <Route path="/user-register" element={<UserRegisterPage />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
      </Routes>
    </UserContextProvider>
  );
}

export default App;
