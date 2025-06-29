import React from "react";
import { LogIn } from "lucide-react";

interface LoginFormProps {
  email: string;
  password: string;
  loading: boolean;
  message: string;
  onEmailChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onLogin: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCreateTestUsers: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  loading,
  message,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onKeyPress,
  onCreateTestUsers
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md">
        
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fluffy Candy Cleaning</h1>
          <p className="text-sm text-gray-600 mt-1">Log in to track machine cleanings</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-pink-500 focus:outline-none"
              onKeyPress={onKeyPress}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-pink-500 focus:outline-none"
              onKeyPress={onKeyPress}
              placeholder="Enter your password"
            />
          </div>

          <button
            onClick={onLogin}
            disabled={loading}
            className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.toLowerCase().includes('invalid')
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-pink-50 text-pink-800 border border-pink-200'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 space-y-2">
          <button
            onClick={onCreateTestUsers}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            🧪 Create Test Users
          </button>
          <div className="text-xs text-gray-500 space-y-1 text-center">
            <p><strong>Admin Accounts:</strong></p>
            <p>Superior Admin: superadmin@fluffycandy.se</p>
            <p>Regular Admin: admin@fluffycandy.se</p>
            <p>Test Cleaner: cleaner@yourdomain.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;