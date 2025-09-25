import React, { useState, useContext } from 'react';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LanguageContext, ThemeContext, AuthContext } from '../App';

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { isDark } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        onSuccess();
      } else {
        setError('Ongeldige inloggegevens of geen admin toegang goedgekeurd');
      }
    } catch (error) {
      setError('Er is een fout opgetreden bij het inloggen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } shadow-lg`}>
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center mb-4"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: 'rgb(108, 190, 153)' }}
                >
                  <Shield className="h-8 w-8" />
                </div>
              </motion.div>
              
              <CardTitle className="text-2xl">Admin {t('login')}</CardTitle>
              <CardDescription>
                Log in om toegang te krijgen tot het Content Management System
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Mail className="h-4 w-4" />
                    {t('email')}
                  </label>
                  <Input
                    type="email"
                    placeholder="admin@glu.nl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Lock className="h-4 w-4" />
                    {t('password')}
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-3 rounded-md text-sm ${
                      isDark ? 'bg-red-900/30 text-red-300 border border-red-800' : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                  >
                    {error}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="space-y-3"
                >
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    style={{ backgroundColor: 'rgb(108, 190, 153)' }}
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        {t('login')}
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className={`text-center mt-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <p>Nog geen admin toegang?</p>
                <p>Vraag toegang aan via de "Admin Aanvragen" knop in de header.</p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}