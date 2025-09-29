import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AccessCodeEntry } from './components/AccessCodeEntry';
import { Header } from './components/Header';
import { ProjectsPage } from './components/ProjectsPage';
import { AddProjectPage } from './components/AddProjectPage';

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
  logout: () => void;
}>({
  isAdmin: false,
  adminUser: null,
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
  const [isAdmin, setIsAdmin] = useState(true); // Set to true for demo mode
  const [adminUser, setAdminUser] = useState({ email: 'demo@glu.nl', name: 'Demo Admin' });
  const [accessToken, setAccessToken] = useState<string | null>('demo-token');

  // Load saved preferences
  useEffect(() => {
    const savedAccess = localStorage.getItem('glu-access');
    const savedTheme = localStorage.getItem('glu-theme');
    const savedLanguage = localStorage.getItem('glu-language');

    if (savedAccess === 'true') setHasAccess(true);
    if (savedTheme === 'dark') setIsDark(true);
    if (savedLanguage) setLanguage(savedLanguage as 'nl' | 'en');
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

  const logout = () => {
    // In demo mode, just reset to projects page
    setCurrentPage('projects');
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
          <AuthContext.Provider value={{ isAdmin, adminUser, logout }}>
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