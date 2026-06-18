import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(phone, password);
      navigate('/admin');
    } catch {
      setError('رقم الهاتف أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>📚 سنتر الدروس</h1>
        <h2>تسجيل دخول المشرفين</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>رقم الهاتف</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required dir="ltr" />
          </div>
          <div className="form-group">
            <label>كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block">دخول</button>
        </form>
        <a href="/" className="back-link">العودة للموقع</a>
      </div>
    </div>
  );
}
