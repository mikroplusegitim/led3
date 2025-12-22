import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function SignUp() {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validasyon
    if (formData.password !== formData.confirmPassword) {
      return setError('Şifreler eşleşmiyor');
    }

    if (formData.password.length < 6) {
      return setError('Şifre en az 6 karakter olmalıdır');
    }

    if (!formData.companyName.trim()) {
      return setError('Firma adı gereklidir');
    }

    setLoading(true);

    try {
      await signup(formData.email, formData.password, formData.companyName);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Bu email adresi zaten kullanımda');
      } else if (err.code === 'auth/invalid-email') {
        setError('Geçersiz email adresi');
      } else if (err.code === 'auth/weak-password') {
        setError('Şifre çok zayıf');
      } else {
        setError('Kayıt başarısız. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>💡 LED Kontrol</h1>
          <p>Yeni Hesap Oluştur</p>
        </div>

        {error && (
          <div className="auth-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="companyName">Firma Adı</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="ABC İnşaat"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ornek@firma.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Şifre (Tekrar)</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link>
          </p>
        </div>

        <div className="auth-info">
          <p>
            ✨ <strong>Ücretsiz Plan:</strong> 1 cihaz, 5 bina<br/>
            📈 İstediğiniz zaman yükseltin
          </p>
        </div>
      </div>
    </div>
  );
}
