import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Clock, User, Tag, Trash2, Edit, Image, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { LanguageContext, ThemeContext } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  urgency: 'normal' | 'urgent';
  studentName: string;
  contactInfo: string;
  imageUrl?: string;
  deadline?: string;
  createdAt: string;
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Project | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const { isDark } = useContext(ThemeContext);
  const { t, language } = useContext(LanguageContext);

  const filterProjects = useCallback(() => {
    let filtered = [...projects];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.category.toLowerCase().includes(term) ||
        project.skills.some(skill => skill.toLowerCase().includes(term)) ||
        project.studentName.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    if (selectedSkill !== 'all') {
      filtered = filtered.filter(project => project.skills.includes(selectedSkill));
    }

    if (selectedUrgency !== 'all') {
      filtered = filtered.filter(project => project.urgency === selectedUrgency);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedCategory, selectedSkill, selectedUrgency]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [filterProjects]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects
      const projectsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-42382a8b/projects`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      if (!projectsResponse.ok) {
        console.error('Projects response error:', await projectsResponse.text());
      }
      const projectsData = await projectsResponse.json();
      setProjects(Array.isArray(projectsData) ? projectsData : []);

      // Fetch categories
      const categoriesResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-42382a8b/categories`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      if (!categoriesResponse.ok) {
        console.error('Categories response error:', await categoriesResponse.text());
      }
      const categoriesData = await categoriesResponse.json();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      // Fetch skills
      const skillsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-42382a8b/skills`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      if (!skillsResponse.ok) {
        console.error('Skills response error:', await skillsResponse.text());
      }
      const skillsData = await skillsResponse.json();
      setSkills(Array.isArray(skillsData) ? skillsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectToDelete: Project) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-42382a8b/projects/${projectToDelete.id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete response error:', errorText);
        toast.error(t('deleteError'));
        return;
      }

      setShowDeleteConfirm(null);
      toast.success(t('projectDeleted'));
      await fetchData();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(t('deleteError'));
    }
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-42382a8b/projects/${editingProject.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(editForm)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update response error:', errorText);
        toast.error(t('updateError'));
        return;
      }

      setEditingProject(null);
      setEditForm({});
      setShowSaveConfirm(false);
      toast.success(t('projectUpdated'));
      await fetchData();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(t('updateError'));
    }
  };

  const getUrgencyColor = (urgency: string) => {
    return urgency === 'urgent' ? 'bg-red-500' : 'bg-green-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`mb-8 p-6 rounded-xl ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        } shadow-lg`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder={t('category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCategories')}</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Skills Filter */}
          <Select value={selectedSkill} onValueChange={setSelectedSkill}>
            <SelectTrigger>
              <SelectValue placeholder={t('skills')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allSkills')}</SelectItem>
              {skills.map(skill => (
                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Urgency Filter */}
          <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
            <SelectTrigger>
              <SelectValue placeholder={t('urgency')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="normal">{t('normal')}</SelectItem>
              <SelectItem value="urgent">{t('urgent')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('noProjects')}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`h-full cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isDark ? 'bg-gray-800 border-gray-700 hover:shadow-gray-900/20' : 'bg-white hover:shadow-gray-200'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{project.category}</Badge>
                          <Badge 
                            className={`${getUrgencyColor(project.urgency)} text-white`}
                          >
                            {project.urgency === 'urgent' ? t('urgent') : t('normal')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProject(project);
                            setEditForm(project);
                          }}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(project);
                          }}
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent onClick={() => setSelectedProject(project)}>
                    <CardDescription className="mb-4 line-clamp-3">
                      {project.description}
                    </CardDescription>
                    
                    {project.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {project.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{project.studentName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Project Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedProject.title}
                  <Badge 
                    className={`${getUrgencyColor(selectedProject.urgency)} text-white`}
                  >
                    {selectedProject.urgency === 'urgent' ? t('urgent') : t('normal')}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{t('description')}</h4>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedProject.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">{t('category')}</h4>
                  <Badge variant="secondary">{selectedProject.category}</Badge>
                </div>
                
                {selectedProject.skills.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">{t('skills')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.skills.map(skill => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Student</h4>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedProject.studentName}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Contact</h4>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedProject.contactInfo}
                    </p>
                  </div>
                </div>
                
                {selectedProject.imageUrl && (
                  <div>
                    <h4 className="font-medium mb-2">{t('image')}</h4>
                    <img 
                      src={selectedProject.imageUrl} 
                      alt={selectedProject.title}
                      className="max-w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {selectedProject.deadline && (
                  <div>
                    <h4 className="font-medium mb-1">{t('deadline')}</h4>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatDate(selectedProject.deadline)}
                    </p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-1">{t('createdBy')}</h4>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatDate(selectedProject.createdAt)}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Project Modal */}
      <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
        <DialogContent className="max-w-2xl">
          {editingProject && (
            <>
              <DialogHeader>
                <DialogTitle>{t('edit')} Project</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('title')}</label>
                  <Input
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{t('description')}</label>
                  <textarea
                    className={`w-full p-3 rounded-md border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                    rows={4}
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('category')}</label>
                    <Select
                      value={editForm.category || ''}
                      onValueChange={(value) => setEditForm({...editForm, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('urgency')}</label>
                    <Select
                      value={editForm.urgency || ''}
                      onValueChange={(value) => setEditForm({...editForm, urgency: value as 'normal' | 'urgent'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">{t('normal')}</SelectItem>
                        <SelectItem value="urgent">{t('urgent')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{t('image')} ({t('optional')})</label>
                  <Input
                    type="url"
                    placeholder="https://"
                    value={editForm.imageUrl || ''}
                    onChange={(e) => setEditForm({...editForm, imageUrl: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{t('deadline')} ({t('optional')})</label>
                  <Input
                    type="date"
                    value={editForm.deadline ? editForm.deadline.split('T')[0] : ''}
                    onChange={(e) => setEditForm({...editForm, deadline: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('studentName')}</label>
                    <Input
                      value={editForm.studentName || ''}
                      onChange={(e) => setEditForm({...editForm, studentName: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('contactInfo')}</label>
                    <Input
                      value={editForm.contactInfo || ''}
                      onChange={(e) => setEditForm({...editForm, contactInfo: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{t('skills')}</label>
                  <Input
                    placeholder={language === 'nl' ? "Komma gescheiden (bijv. JavaScript, React, Design)" : "Comma separated (e.g. JavaScript, React, Design)"}
                    value={editForm.skills ? editForm.skills.join(', ') : ''}
                    onChange={(e) => setEditForm({...editForm, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingProject(null)}>
                  {t('cancel')}
                </Button>
                <Button 
                  onClick={() => setShowSaveConfirm(true)}
                  style={{ backgroundColor: 'rgb(108, 190, 153)' }}
                >
                  {t('save')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteProject')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDelete')} "{showDeleteConfirm?.title}"? {t('cannotUndo')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => showDeleteConfirm && handleDeleteProject(showDeleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('saveChanges')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmSave')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSaveProject}
              style={{ backgroundColor: 'rgb(108, 190, 153)' }}
              className="hover:opacity-90"
            >
              {t('save')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}