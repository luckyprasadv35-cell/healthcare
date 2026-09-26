import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { LoginSchema, RegisterSchema } from '../types/schemas';
import { z } from 'zod';
import { Activity } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: any) => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit }) => {
  const [apiError, setApiError] = useState<string | null>(null);

  const schema = mode === 'login' ? LoginSchema : RegisterSchema;
  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      await onSubmit(data);
    } catch (err: any) {
      setApiError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8">
      <div className="flex justify-center mb-6">
        <Activity className="h-12 w-12 text-emerald-500" />
      </div>
      <h2 className="text-2xl font-bold text-center text-white mb-8">
        {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
      </h2>

      {apiError && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-6">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{String(errors.email.message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
          <input
            {...register('password')}
            type="password"
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-400 text-xs mt-1">{String(errors.password.message)}</p>}
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
            <input
              {...register('confirmPassword')}
              type="password"
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
            {(errors as any).confirmPassword && <p className="text-red-400 text-xs mt-1">{String((errors as any).confirmPassword.message)}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
        >
          {isSubmitting ? (
            <Activity className="h-5 w-5 animate-pulse" />
          ) : (
            mode === 'login' ? 'Sign In' : 'Sign Up'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
        <Link
          to={mode === 'login' ? '/register' : '/login'}
          className="text-emerald-400 hover:text-emerald-300 font-medium transition"
        >
          {mode === 'login' ? 'Sign up here' : 'Log in here'}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
