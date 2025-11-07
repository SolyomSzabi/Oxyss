import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scissors, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BarberLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/auth/login`, formData);
      
      if (response.data) {
        // Use the context login function to update state immediately
        login(response.data.access_token, response.data.barber_id, response.data.barber_name);
        
        toast.success(`Welcome back, ${response.data.barber_name}!`);
        navigate('/barber-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Login failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pt-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="bg-zinc-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Scissors className="h-10 w-10 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl font-bold font-heading text-zinc-900">
              Barber Login
            </CardTitle>
            <p className="text-zinc-600 mt-2">
              Access your dashboard and manage appointments
            </p>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-zinc-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-2 form-input"
                  placeholder="your.email@oxyssbarbershop.com"
                  data-testid="login-email-input"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-zinc-700 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-2 form-input"
                  placeholder="Enter your password"
                  data-testid="login-password-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3"
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Demo Credentials</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p><strong>Oxy:</strong> oxy@oxyssbarbershop.com</p>
                <p><strong>Helga:</strong> helga@oxyssbarbershop.com</p>
                <p><strong>Marcus:</strong> marcus@oxyssbarbershop.com</p>
                <p><strong>Password:</strong> barber123</p>
              </div>
            </div> */}

            <div className="mt-6 text-center">
              <Link to="/" className="text-zinc-600 hover:text-yellow-600 text-sm transition-colors">
                ← Back to Website
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BarberLogin;