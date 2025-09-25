import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'motion/react';
import { Plus, X, User, Mail, FileText, Tag, Clock, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { LanguageContext, ThemeContext } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AddProjectPageProps {
  onSuccess: () => void;
}

export function AddProjectPage({ onSuccess }: AddProjectPageProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills: [] as string[],
    urgency: 'normal' as 'normal' | 'urgent',
    studentName: '',
    contactInfo: ''
  });
  
  const [categories, setCategories] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { isDark } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const categoriesResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-42382a8b/categories`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      const categoriesData = await categoriesResponse.json();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      // Fetch skills
      const skillsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-42382a8b/skills`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      const skillsData = await skillsResponse.json();
      setAvailableSkills(Array.isArray(skillsData) ? skillsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill]
      });
    }
    setSkillInput('');
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.studentName || !formData.contactInfo) {
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-42382a8b/projects`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        onSuccess();
      } else {
        console.error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSkills = availableSkills.filter(skill =>
    skill.toLowerCase().includes(skillInput.toLowerCase()) &&
    !formData.skills.includes(skill)
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-lg`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Plus className="h-6 w-6" style={{ color: 'rgb(255, 143, 28)' }} />
              {t('addProject')}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Title */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <FileText className="h-4 w-4" />
                  {t('title')} *
                </label>
                <Input
                  placeholder="Geef je project een duidelijke titel..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </motion.div>

              {/* Project Description */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <FileText className="h-4 w-4" />
                  {t('description')} *
                </label>
                <textarea
                  className={`w-full p-3 rounded-md border resize-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={4}
                  placeholder="Beschrijf je project in detail. Wat wil je bereiken? Wat is de scope?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </motion.div>

              {/* Category and Urgency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Tag className="h-4 w-4" />
                    {t('category')} *
                  </label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een categorie..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Clock className="h-4 w-4" />
                    {t('urgency')}
                  </label>
                  <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value as 'normal' | 'urgent'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {t('normal')}
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          {t('urgent')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </div>

              {/* Skills */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Tag className="h-4 w-4" />
                  {t('skills')}
                </label>
                
                {/* Skill Input */}
                <div className="relative mb-3">
                  <Input
                    placeholder="Type om vaardigheden te zoeken..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (filteredSkills.length > 0) {
                          handleSkillAdd(filteredSkills[0]);
                        } else if (skillInput.trim()) {
                          handleSkillAdd(skillInput.trim());
                        }
                      }
                    }}
                  />
                  
                  {/* Skill Suggestions */}
                  {skillInput && filteredSkills.length > 0 && (
                    <div className={`absolute z-10 w-full mt-1 rounded-md border shadow-lg ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}>
                      {filteredSkills.slice(0, 5).map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleSkillAdd(skill)}
                          className={`w-full text-left px-3 py-2 hover:bg-opacity-50 first:rounded-t-md last:rounded-b-md ${
                            isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Skills */}
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map(skill => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleSkillRemove(skill)}
                          className="ml-1 hover:bg-gray-600 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Student Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <User className="h-4 w-4" />
                    Jouw Naam *
                  </label>
                  <Input
                    placeholder="Voor- en achternaam"
                    value={formData.studentName}
                    onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Mail className="h-4 w-4" />
                    Contact Info *
                  </label>
                  <Input
                    placeholder="E-mail of telefoonnummer"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
                    required
                  />
                </motion.div>
              </div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex justify-end gap-4 pt-4"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSuccess}
                  disabled={submitting}
                >
                  Annuleren
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !formData.title || !formData.description || !formData.category || !formData.studentName || !formData.contactInfo}
                  className="min-w-32"
                  style={{ backgroundColor: 'rgb(255, 143, 28)' }}
                >
                  {submitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('submit')}
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}