import { useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

export default function UserLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);

  async function handleLogin(ev) {
    ev.preventDefault();
    try {
      await axios.post('/user/login', { email, password });
      setRedirect(true);
    } catch (e) {
      alert('Login failed');
    }
  }

  if (redirect) {
    return <Navigate to="/useraccount" />;
  }

  return (
    <form onSubmit={handleLogin} className="login-form">
      <h2>User Login</h2>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}
