import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AccessCodeEntry } from './components/AccessCodeEntry';
import { Header } from './components/Header';
import { ProjectsPage } from './components/ProjectsPage';
import { AddProjectPage } from './components/AddProjectPage';
import { AdminLogin } from './components/AdminLogin';
import { AdminCMS } from './components/AdminCMS';
import { AdminRequestPage } from './components/AdminRequestPage';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { projectId, publicAnonKey } from './utils/supabase/info';

// Theme context
const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
}>({
  isDark: false,
  toggleTheme: () => {}
});

// Language context
const LanguageContext = createContext<{
  language: 'nl' | 'en';
  toggleLanguage: () => void;
  t: (key: string) => string;
}>({
  language: 'nl',
  toggleLanguage: () => {},
  t: (key: string) => key
});

// Auth context
const AuthContext = createContext<{
  isAdmin: boolean;
  adminUser: any;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}>({
  isAdmin: false,
  adminUser: null,
  login: async () => false,
  logout: () => {}
});

// Translations
const translations = {
  nl: {
    projects: 'Projecten',
    spoed: 'Spoed',
    addProject: 'Project Toevoegen',
    admin: 'Admin',
    search: 'Zoeken...',
    category: 'Categorie',
    skills: 'Vaardigheden',
    urgency: 'Urgentie',
    title: 'Titel',
    description: 'Beschrijving',
    normal: 'Normaal',
    urgent: 'Spoed',
    submit: 'Versturen',
    login: 'Inloggen',
    logout: 'Uitloggen',
    email: 'E-mail',
    password: 'Wachtwoord',
    requestAdmin: 'Admin Aanvragen',
    name: 'Naam',
    enterAccessCode: 'Voer toegangscode in',
    accessCode: 'Toegangscode',
    enter: 'Betreden',
    invalidCode: 'Ongeldige code',
    allCategories: 'Alle Categorieën',
    allSkills: 'Alle Vaardigheden',
    noProjects: 'Geen projecten gevonden',
    projectDetails: 'Project Details',
    edit: 'Bewerken',
    delete: 'Verwijderen',
    cms: 'Content Management',
    manageProjects: 'Projecten Beheren',
    pendingRequests: 'Hangende Verzoeken',
    approve: 'Goedkeuren'
  },
  en: {
    projects: 'Projects',
    spoed: 'Urgent',
    addProject: 'Add Project',
    admin: 'Admin',
    search: 'Search...',
    category: 'Category',
    skills: 'Skills',
    urgency: 'Urgency',
    title: 'Title',
    description: 'Description',
    normal: 'Normal',
    urgent: 'Urgent',
    submit: 'Submit',
    login: 'Login',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    requestAdmin: 'Request Admin',
    name: 'Name',
    enterAccessCode: 'Enter Access Code',
    accessCode: 'Access Code',
    enter: 'Enter',
    invalidCode: 'Invalid code',
    allCategories: 'All Categories',
    allSkills: 'All Skills',
    noProjects: 'No projects found',
    projectDetails: 'Project Details',
    edit: 'Edit',
    delete: 'Delete',
    cms: 'Content Management',
    manageProjects: 'Manage Projects',
    pendingRequests: 'Pending Requests',
    approve: 'Approve'
  }
};

export default function App() {
  const [hasAccess, setHasAccess] = useState(false);
  const [currentPage, setCurrentPage] = useState('projects');
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<'nl' | 'en'>('nl');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Load saved preferences
  useEffect(() => {
    const savedAccess = localStorage.getItem('glu-access');
    const savedTheme = localStorage.getItem('glu-theme');
    const savedLanguage = localStorage.getItem('glu-language');
    const savedToken = localStorage.getItem('glu-admin-token');
    const savedUser = localStorage.getItem('glu-admin-user');

    if (savedAccess === 'true') setHasAccess(true);
    if (savedTheme === 'dark') setIsDark(true);
    if (savedLanguage) setLanguage(savedLanguage as 'nl' | 'en');
    if (savedToken && savedUser) {
      setAccessToken(savedToken);
      setAdminUser(JSON.parse(savedUser));
      setIsAdmin(true);
    }
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('glu-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Apply language
  useEffect(() => {
    localStorage.setItem('glu-language', language);
  }, [language]);

  const toggleTheme = () => setIsDark(!isDark);
  const toggleLanguage = () => setLanguage(language === 'nl' ? 'en' : 'nl');

  const t = (key: string) => translations[language][key] || key;

  const handleAccessCodeSubmit = (code: string) => {
    if (code === '694201') {
      setHasAccess(true);
      localStorage.setItem('glu-access', 'true');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-42382a8b/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        setAccessToken(data.access_token);
        setAdminUser(data.user);
        setIsAdmin(true);
        localStorage.setItem('glu-admin-token', data.access_token);
        localStorage.setItem('glu-admin-user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setAccessToken(null);
    setAdminUser(null);
    setIsAdmin(false);
    setCurrentPage('projects');
    localStorage.removeItem('glu-admin-token');
    localStorage.removeItem('glu-admin-user');
  };

  if (!hasAccess) {
    return (
      <SupabaseProvider>
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
          <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            <div className={`min-h-screen transition-colors duration-300 ${
              isDark ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
              <AccessCodeEntry onSubmit={handleAccessCodeSubmit} />
            </div>
          </LanguageContext.Provider>
        </ThemeContext.Provider>
      </SupabaseProvider>
    );
  }

  return (
    <SupabaseProvider>
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
          <AuthContext.Provider value={{ isAdmin, adminUser, login, logout }}>
            <div className={`min-h-screen transition-colors duration-300 ${
              isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
            }`}>
              <Header currentPage={currentPage} onPageChange={setCurrentPage} />
              
              <main className="pt-20">
                <AnimatePresence mode="wait">
                  {currentPage === 'projects' && (
                    <motion.div
                      key="projects"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <ProjectsPage accessToken={accessToken} />
                    </motion.div>
                  )}
                  
                  {currentPage === 'add-project' && (
                    <motion.div
                      key="add-project"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <AddProjectPage onSuccess={() => setCurrentPage('projects')} />
                    </motion.div>
                  )}
                  
                  {currentPage === 'admin-login' && !isAdmin && (
                    <motion.div
                      key="admin-login"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <AdminLogin onSuccess={() => setCurrentPage('admin-cms')} />
                    </motion.div>
                  )}
                  
                  {currentPage === 'admin-request' && (
                    <motion.div
                      key="admin-request"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <AdminRequestPage onSuccess={() => setCurrentPage('projects')} />
                    </motion.div>
                  )}
                  
                  {currentPage === 'admin-cms' && isAdmin && (
                    <motion.div
                      key="admin-cms"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <AdminCMS accessToken={accessToken} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
            </div>
          </AuthContext.Provider>
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    </SupabaseProvider>
  );
}

// Export contexts for use in components
export { ThemeContext, LanguageContext, AuthContext };