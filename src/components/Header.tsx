import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Globe, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { LanguageContext, ThemeContext } from '../App';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Header({ currentPage, onPageChange }: HeaderProps) {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { language, toggleLanguage, t } = useContext(LanguageContext);

  const navigationItems = [
    { key: 'projects', label: t('projects'), icon: null },
    { key: 'spoed', label: t('spoed'), icon: null },
    { key: 'add-project', label: t('addProject'), icon: Plus },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 ${
        isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'
      } backdrop-blur-sm border-b transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Navigation */}
          <nav className="flex items-center space-x-1">
            {navigationItems.map((item) => {
              const isActive = currentPage === item.key || 
                (item.key === 'spoed' && currentPage === 'projects');
              
              return (
                <Button
                  key={item.key}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => {
                    if (item.key === 'spoed') {
                      onPageChange('projects'); // Will be handled by ProjectsPage with urgency filter
                    } else {
                      onPageChange(item.key);
                    }
                  }}
                  className={`flex items-center gap-2 ${
                    isActive 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : isDark 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  style={isActive ? { backgroundColor: 'rgb(255, 143, 28)' } : {}}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Center section - Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center"
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: 'rgb(255, 143, 28)' }}
            >
              GLU
            </div>
          </motion.div>

          {/* Right section - Controls */}
          <div className="flex items-center space-x-2">

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`${
                isDark 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Language toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className={`${
                isDark 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span className="ml-1 text-xs">{language.toUpperCase()}</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}