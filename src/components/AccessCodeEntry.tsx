import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Sun, Moon, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LanguageContext, ThemeContext } from '../App';

interface AccessCodeEntryProps {
  onSubmit: (code: string) => void;
}

export function AccessCodeEntry({ onSubmit }: AccessCodeEntryProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { language, toggleLanguage, t } = useContext(LanguageContext);

  // Auto-focus the input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim();
    if (trimmedCode === '694201') {
      onSubmit(trimmedCode);
    } else {
      setError(t('invalidCode'));
      setCode('');
      // Refocus the input after error
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // Allow all characters for now
    setCode(value);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 rounded-full"
          style={{ backgroundColor: 'rgb(255, 143, 28)' }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-24 h-24 rounded-full"
          style={{ backgroundColor: 'rgb(108, 190, 153)' }}
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Theme and Language toggles */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className={`${isDark ? 'text-white hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          className={`${isDark ? 'text-white hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <Globe className="h-5 w-5" />
          <span className="ml-1 text-xs">{language.toUpperCase()}</span>
        </Button>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        {/* GLU Logo placeholder */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgb(255, 143, 28)' }}
          >
            <Lock className="h-8 w-8 text-white" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className={`text-2xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Grafisch Lyceum Utrecht
          </h1>
          <h2 className={`text-lg mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Vraag & Aanbod Platform
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('enterAccessCode')}
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label htmlFor="accessCode" className={`block text-sm mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('accessCode')}
            </label>
            <Input
              ref={inputRef}
              id="accessCode"
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="Voer code in..."
              className={`text-center text-lg tracking-widest focus:ring-2 focus:ring-orange-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
              } ${error ? 'border-red-500' : ''}`}
              maxLength={6}
              autoComplete="off"
              autoFocus
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-500 text-sm mt-1"
              >
                {error}
              </motion.p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-lg"
            style={{ backgroundColor: 'rgb(255, 143, 28)', color: 'white' }}
            disabled={code.length !== 6}
          >
            {t('enter')}
          </Button>
          
          {/* Helpful hint */}
          <div className={`text-center text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {language === 'nl' ? 'Toegangscode: 694201' : 'Access code: 694201'}
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className={`text-center mt-6 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
        >
          {language === 'nl' 
            ? 'Voor studenten van Grafisch Lyceum Utrecht' 
            : 'For students of Grafisch Lyceum Utrecht'
          }
        </motion.div>
      </motion.div>
    </div>
  );
}