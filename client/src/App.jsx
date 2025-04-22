/* eslint-disable no-unused-vars */
import axios from 'axios';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { UserContextProvider } from './UserContext';

import Layout from './Layout';
import AddEvent from './pages/AddEvent';
import CalendarView from './pages/CalendarView';
import CreateEvent from './pages/CreateEvent';
import DashboardPage from './pages/DashboardPage';
import EventPage from './pages/EventPage';
import ForgotPassword from './pages/ForgotPassword';
import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';
import OrderSummary from './pages/OrderSummary';
import PaymentSummary from './pages/PaymentSummary';
import RegisterPage from './pages/RegisterPage';
import ResetPassword from './pages/ResetPassword';
import TicketPage from './pages/TicketPage';
import UserAccountPage from './pages/UserAccountPage';
import UserLoginPage from './pages/UserLoginPage';
import UserRegisterPage from './pages/UserRegisterPage';

axios.defaults.baseURL = '/api/';
axios.defaults.withCredentials = true;

function App() {
	return (
		<UserContextProvider>
			<Routes>
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
