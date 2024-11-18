import { useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

export default function UserRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);

  async function handleRegister(ev) {
    ev.preventDefault();
    try {
      await axios.post('/user/register', { name, email, password });
      setRedirect(true);
    } catch (e) {
      alert('Registration failed');
    }
  }

  if (redirect) {
    return <Navigate to="/user-login" />;
  }

  return (
    <form onSubmit={handleRegister} className="register-form">
      <h2>User Sign Up</h2>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Sign Up</button>
    </form>
  );
}
