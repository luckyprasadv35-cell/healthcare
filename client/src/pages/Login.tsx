import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const { signIn, hasProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (data: any) => {
    await signIn(data.email, data.password);
    if (hasProfile) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <AuthForm mode="login" onSubmit={handleLogin} />
    </div>
  );
};

export default Login;
