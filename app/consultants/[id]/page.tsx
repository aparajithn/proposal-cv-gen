'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Consultant, Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Edit, Trash } from 'lucide-react';
import Link from 'next/link';

export default function ConsultantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const consultantId = params.id as string;

  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    summary: '',
    skills: '',
    certifications: '',
  });

  useEffect(() => {
    fetchConsultant();
    fetchProjects();
  }, [consultantId]);

  async function fetchConsultant() {
    const { data, error } = await supabase
      .from('consultants')
      .select('*')
      .eq('id', consultantId)
      .single();

    if (error) {
      console.error('Error fetching consultant:', error);
    } else {
      setConsultant(data);
      setFormData({
        name: data.name,
        title: data.title,
        summary: data.summary || '',
        skills: data.skills.join(', '),
        certifications: data.certifications.join(', '),
      });
    }
    setLoading(false);
  }

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('consultant_id', consultantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('consultants')
      .update({
        name: formData.name,
        title: formData.title,
        summary: formData.summary || null,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        certifications: formData.certifications.split(',').map(c => c.trim()).filter(Boolean),
      })
      .eq('id', consultantId);

    if (error) {
      console.error('Error updating consultant:', error);
      alert('Error updating consultant');
    } else {
      await fetchConsultant();
      setEditing(false);
    }

    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this consultant and all their projects?')) {
      return;
    }

    const { error } = await supabase
      .from('consultants')
      .delete()
      .eq('id', consultantId);

    if (error) {
      console.error('Error deleting consultant:', error);
      alert('Error deleting consultant');
    } else {
      router.push('/dashboard');
    }
  }

  if (loading || !consultant) {
    return (
      <div className="container mx-auto p-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{consultant.name}</CardTitle>
              <CardDescription className="text-lg">{consultant.title}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(!editing)}
              >
                <Edit className="mr-2 h-4 w-4" />
                {editing ? 'Cancel' : 'Edit'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  rows={4}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                <Input
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {consultant.summary && (
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-muted-foreground">{consultant.summary}</p>
                </div>
              )}

              {consultant.skills.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {consultant.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-sm bg-primary/10 text-primary px-3 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {consultant.certifications.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {consultant.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Link href={`/projects/new?consultantId=${consultantId}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Link href={`/projects/new?consultantId=${consultantId}`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{project.role}</CardTitle>
                  <CardDescription>
                    {project.client_name && `${project.client_name} • `}
                    {project.duration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {project.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.tech_stack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-muted px-2 py-1 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.description_technical && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description_technical}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
