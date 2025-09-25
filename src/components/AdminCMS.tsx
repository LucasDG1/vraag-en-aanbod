import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'motion/react';
import { Settings, Users, FileText, Check, X, Trash2, Edit, UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { LanguageContext, ThemeContext } from '../App';
import { projectId } from '../utils/supabase/info';

interface AdminCMSProps {
  accessToken: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  urgency: 'normal' | 'urgent';
  studentName: string;
  contactInfo: string;
  createdAt: string;
}

interface AdminRequest {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export function AdminCMS({ accessToken }: AdminCMSProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { isDark } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);

  useEffect(() => {
    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

  const fetchData = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      
      // Fetch projects
      const projectsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-42382a8b/projects`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      const projectsData = await projectsResponse.json();
      setProjects(Array.isArray(projectsData) ? projectsData : []);

      // Fetch admin requests
      const requestsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-42382a8b/admin/requests`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      const requestsData = await requestsResponse.json();
      setAdminRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      console.error('Error fetching CMS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-42382a8b/projects/${projectId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (response.ok) {
        await fetchData();
        setConfirmDelete(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleApproveAdmin = async (requestId: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-42382a8b/admin/requests/${requestId}/approve`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error approving admin request:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUrgencyColor = (urgency: string) => {
    return urgency === 'urgent' ? 'bg-red-500' : 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl mb-2 flex items-center gap-2">
            <Settings className="h-8 w-8" style={{ color: 'rgb(108, 190, 153)' }} />
            Content Management System
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Beheer projecten en admin gebruikers voor het GLU Vraag & Aanbod platform
          </p>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Projecten ({projects.length})
            </TabsTrigger>
            <TabsTrigger value="admin-requests" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admin Verzoeken ({adminRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projecten Beheer</CardTitle>
                <CardDescription>
                  Bekijk, bewerk en verwijder projecten van studenten
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Geen projecten gevonden
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className={`${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg">{project.title}</h3>
                                  <Badge variant="secondary">{project.category}</Badge>
                                  <Badge 
                                    className={`${getUrgencyColor(project.urgency)} text-white`}
                                  >
                                    {project.urgency === 'urgent' ? t('urgent') : t('normal')}
                                  </Badge>
                                </div>
                                
                                <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {project.description.length > 150 
                                    ? `${project.description.substring(0, 150)}...` 
                                    : project.description
                                  }
                                </p>

                                {project.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {project.skills.map(skill => (
                                      <Badge key={skill} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>Student: {project.studentName}</span>
                                  <span>Contact: {project.contactInfo}</span>
                                  <span>Aangemaakt: {formatDate(project.createdAt)}</span>
                                </div>
                              </div>

                              <div className="flex gap-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedProject(project)}
                                  className="h-8 w-8"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setConfirmDelete(project.id)}
                                  className="h-8 w-8 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin-requests">
            <Card>
              <CardHeader>
                <CardTitle>Admin Verzoeken</CardTitle>
                <CardDescription>
                  Bekijk en keur verzoeken voor admin toegang goed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {adminRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Geen openstaande admin verzoeken
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {adminRequests.map((request, index) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className={`${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-lg mb-1">{request.name}</h3>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {request.email}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  Aangevraagd: {formatDate(request.createdAt)}
                                </p>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleApproveAdmin(request.id)}
                                  className="flex items-center gap-2"
                                  style={{ backgroundColor: 'rgb(108, 190, 153)' }}
                                >
                                  <Check className="h-4 w-4" />
                                  Goedkeuren
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Project Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle>Project Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Titel</h4>
                  <p>{selectedProject.title}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Beschrijving</h4>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedProject.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Categorie</h4>
                    <Badge variant="secondary">{selectedProject.category}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Urgentie</h4>
                    <Badge 
                      className={`${getUrgencyColor(selectedProject.urgency)} text-white`}
                    >
                      {selectedProject.urgency === 'urgent' ? t('urgent') : t('normal')}
                    </Badge>
                  </div>
                </div>
                
                {selectedProject.skills.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Vaardigheden</h4>
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
                    <p>{selectedProject.studentName}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Contact</h4>
                    <p>{selectedProject.contactInfo}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Aangemaakt</h4>
                  <p>{formatDate(selectedProject.createdAt)}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project Verwijderen</DialogTitle>
          </DialogHeader>
          <p>Weet je zeker dat je dit project wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Annuleren
            </Button>
            <Button 
              variant="destructive"
              onClick={() => confirmDelete && handleDeleteProject(confirmDelete)}
            >
              Verwijderen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}