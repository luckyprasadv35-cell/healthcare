import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const { signIn, hasProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (data: any) => {
    // Just call signIn, the AuthProvider and AppRoutes will handle redirection based on profile status
    await signIn(data.email, data.password);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <AuthForm mode="login" onSubmit={handleLogin} />
    </div>
  );
};

export default Login;
