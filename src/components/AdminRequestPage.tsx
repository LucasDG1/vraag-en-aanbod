import React, { useState, useContext } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, User, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LanguageContext, ThemeContext } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AdminRequestPageProps {
  onSuccess: () => void;
}

export function AdminRequestPage({ onSuccess }: AdminRequestPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { isDark } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-42382a8b/admin/request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Er is een fout opgetreden bij het aanvragen van admin toegang');
      }
    } catch (error) {
      setError('Er is een fout opgetreden bij het aanvragen van admin toegang');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={`${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } shadow-lg text-center`}>
              <CardContent className="pt-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex justify-center mb-6"
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: 'rgb(108, 190, 153)' }}
                  >
                    <Send className="h-8 w-8" />
                  </div>
                </motion.div>
                
                <h2 className="text-2xl mb-4">Aanvraag Verzonden!</h2>
                <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Je aanvraag voor admin toegang is succesvol verzonden. 
                  Een bestaande admin zal je verzoek beoordelen en goedkeuren.
                </p>
                <p className={`mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Je ontvangt bericht zodra je toegang is goedgekeurd. 
                  Daarna kun je inloggen met je e-mailadres en wachtwoord.
                </p>
                
                <Button
                  onClick={onSuccess}
                  style={{ backgroundColor: 'rgb(108, 190, 153)' }}
                >
                  Terug naar Projecten
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

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
                  <UserPlus className="h-8 w-8" />
                </div>
              </motion.div>
              
              <CardTitle className="text-2xl">Admin Toegang Aanvragen</CardTitle>
              <CardDescription>
                Vul je gegevens in om admin toegang aan te vragen voor het CMS
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
                    <User className="h-4 w-4" />
                    Volledige Naam
                  </label>
                  <Input
                    type="text"
                    placeholder="Voor- en achternaam"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Mail className="h-4 w-4" />
                    E-mailadres
                  </label>
                  <Input
                    type="email"
                    placeholder="jouw.naam@glu.nl"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Lock className="h-4 w-4" />
                    Wachtwoord
                  </label>
                  <Input
                    type="password"
                    placeholder="Kies een sterk wachtwoord"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength={6}
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Minimaal 6 karakters
                  </p>
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
                  transition={{ duration: 0.5, delay: 0.6 }}
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
                        <Send className="h-4 w-4 mr-2" />
                        Aanvraag Versturen
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className={`mt-6 p-4 rounded-md ${
                  isDark ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  <strong>Let op:</strong> Je aanvraag moet goedgekeurd worden door een bestaande admin 
                  voordat je toegang krijgt tot het Content Management System.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}