import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';

const Register: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (data: any) => {
    await signUp(data.email, data.password);
    // Navigation is handled automatically by AuthProvider and ProtectedRoute
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <AuthForm mode="register" onSubmit={handleRegister} />
    </div>
  );
};

export default Register;
