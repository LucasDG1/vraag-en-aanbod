import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AccessCodeEntry } from './components/AccessCodeEntry';
import { Header } from './components/Header';
import { ProjectsPage } from './components/ProjectsPage';
import { AddProjectPage } from './components/AddProjectPage';
import { Toaster } from './components/ui/sonner';

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



// Translations
const translations = {
  nl: {
    projects: 'Projecten',
    spoed: 'Spoed',
    addProject: 'Project Toevoegen',
    search: 'Zoeken...',
    category: 'Categorie',
    skills: 'Vaardigheden',
    urgency: 'Urgentie',
    title: 'Titel',
    description: 'Beschrijving',
    normal: 'Normaal',
    urgent: 'Spoed',
    submit: 'Versturen',
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
    studentName: 'Student Naam',
    contactInfo: 'Contact Info',
    image: 'Afbeelding',
    deadline: 'Deadline',
    optional: 'Optioneel',
    createdBy: 'Gemaakt door',
    confirmDelete: 'Weet je zeker dat je dit project wilt verwijderen?',
    confirmSave: 'Weet je zeker dat je de wijzigingen wilt opslaan?',
    cancel: 'Annuleren',
    save: 'Opslaan',
    deleteProject: 'Project verwijderen',
    saveChanges: 'Wijzigingen opslaan',
    cannotUndo: 'Deze actie kan niet ongedaan worden gemaakt.',
    projectDeleted: 'Project succesvol verwijderd',
    projectUpdated: 'Project succesvol bijgewerkt',
    deleteError: 'Fout bij het verwijderen van het project',
    updateError: 'Fout bij het bijwerken van het project'
  },
  en: {
    projects: 'Projects',
    spoed: 'Urgent',
    addProject: 'Add Project',
    search: 'Search...',
    category: 'Category',
    skills: 'Skills',
    urgency: 'Urgency',
    title: 'Title',
    description: 'Description',
    normal: 'Normal',
    urgent: 'Urgent',
    submit: 'Submit',
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
    studentName: 'Student Name',
    contactInfo: 'Contact Info',
    image: 'Image',
    deadline: 'Deadline',
    optional: 'Optional',
    createdBy: 'Created by',
    confirmDelete: 'Are you sure you want to delete this project?',
    confirmSave: 'Are you sure you want to save the changes?',
    cancel: 'Cancel',
    save: 'Save',
    deleteProject: 'Delete project',
    saveChanges: 'Save changes',
    cannotUndo: 'This action cannot be undone.',
    projectDeleted: 'Project successfully deleted',
    projectUpdated: 'Project successfully updated',
    deleteError: 'Error deleting project',
    updateError: 'Error updating project'
  }
};

export default function App() {
  const [hasAccess, setHasAccess] = useState(false);
  const [currentPage, setCurrentPage] = useState('projects');
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<'nl' | 'en'>('nl');


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



  if (!hasAccess) {
    return (
      <SupabaseProvider>
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
          <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            <div className={`min-h-screen transition-colors duration-300 ${
              isDark ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
              <AccessCodeEntry onSubmit={handleAccessCodeSubmit} />
              <Toaster />
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
                      <ProjectsPage />
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

                </AnimatePresence>
              </main>
              <Toaster />
            </div>

        </LanguageContext.Provider>
      </ThemeContext.Provider>
    </SupabaseProvider>
  );
}

// Export contexts for use in components
export { ThemeContext, LanguageContext };