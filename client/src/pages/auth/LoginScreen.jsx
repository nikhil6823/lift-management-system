import { KeyRound, MailCheck, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { register, registerCustomer, resendEmailVerification, verifyEmail, verifyLoginCode } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

export function LoginScreen({ expectedRole }) {
  const { user, login, completeLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('credentials');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const homeFor = (role) => role === 'admin' ? '/admin' : role === 'customer' ? '/customer' : '/employee';
  if (user) return <Navigate to={homeFor(user.role)} replace />;

  const finish = (session) => {
    completeLogin(session);
    navigate(location.state?.from || homeFor(session.user.role), { replace: true });
  };

  const submitCredentials = async (event) => {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      if (mode === 'register') {
        const next = await (expectedRole === 'customer' ? registerCustomer(form) : register(form));
        setStep('email');
        setNotice(`We sent a verification code to ${next.email}. Check your inbox to continue.`);
      } else {
        const next = await login({ email: form.email, password: form.password });
        if (next.twoFactorRequired) {
          setChallenge(next.challenge);
          setStep('two-factor');
          setNotice(`We sent a sign-in code to ${next.email}. Check your inbox to continue.`);
        } else finish(next);
      }
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (event) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const next = step === 'email'
        ? await verifyEmail({ email: form.email, code })
        : await verifyLoginCode({ challenge, code });
      finish(next);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true); setError('');
    try {
      const next = await resendEmailVerification({ email: form.email });
      setNotice('A new verification code was sent. Check your inbox to continue.');
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };

  const roleName = expectedRole === 'admin' ? 'Administrator' : expectedRole === 'customer' ? 'Customer' : 'Technician';
  const registrationCopy = expectedRole === 'customer' ? 'Create your customer account to report lift conditions, request service, and chat with the support team.' : 'Create the initial administrator account. Administrators provision technicians from the team page.';
  const verificationStep = step !== 'credentials';
  return <div className="auth-page"><section className="auth-intro"><span className="eyebrow">PV Tech Elevators Pvt Ltd</span><h1>Every lift, <em>in motion.</em></h1><p>One calm workspace for assets, service work, and field teams.</p><div className="auth-feature"><KeyRound size={19} /> Role-protected access for customers, office, and field teams</div></section><section className="auth-panel"><div className="auth-card">{verificationStep ? <span className="auth-step-icon"><MailCheck size={22} /></span> : <span className="eyebrow">PV Tech Elevators Pvt Ltd · {roleName} portal</span>}<h2>{step === 'email' ? 'Verify your email' : step === 'two-factor' ? 'Confirm your sign-in' : mode === 'login' ? 'Welcome back' : 'Set up your account'}</h2><p>{step === 'email' ? 'Enter the six-digit code sent to your email before continuing.' : step === 'two-factor' ? 'Enter the one-time code to finish signing in.' : mode === 'login' ? 'Sign in securely with your password and a verification code.' : registrationCopy}</p>{error && <div className="alert error">{error}</div>}{notice && <div className="alert">{notice}</div>}{verificationStep ? <form onSubmit={submitCode} className="auth-form"><label>Verification code<input required inputMode="numeric" pattern="[0-9]{6}" minLength="6" maxLength="6" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} autoComplete="one-time-code" /></label><button disabled={busy}>{busy ? 'Checking…' : 'Verify code'}</button></form> : <form onSubmit={submitCredentials} className="auth-form">{mode === 'register' && <label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" /></label>}<label>{expectedRole === 'customer' ? 'Email address' : 'Work email'}<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" /></label><label>Password<input required minLength="8" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label><button disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Continue to verification' : expectedRole === 'customer' ? 'Create customer account' : 'Create initial administrator'}</button></form>}{step === 'email' && <button className="text-button auth-switch" onClick={resend} disabled={busy}>Resend verification code</button>}{verificationStep && <button className="text-button auth-switch" onClick={() => { setStep('credentials'); setCode(''); setError(''); setNotice(''); }}>Back to sign in</button>}{!verificationStep && (expectedRole === 'admin' || expectedRole === 'customer') && <button className="text-button auth-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setNotice(''); }}>{mode === 'login' ? expectedRole === 'customer' ? 'Create a customer account' : 'Set up the initial administrator' : 'Already have access? Sign in'}</button>}{!verificationStep && expectedRole !== 'admin' && <button className="text-button role-switch" onClick={() => navigate('/login')}>Administrator sign in</button>}{!verificationStep && expectedRole !== 'employee' && <button className="text-button role-switch" onClick={() => navigate('/employee/login')}>Technician sign in</button>}{verificationStep && <p className="auth-security-note"><ShieldCheck size={15} /> Codes expire after 10 minutes.</p>}</div></section></div>;
}