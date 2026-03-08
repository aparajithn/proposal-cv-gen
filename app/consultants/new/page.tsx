'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewConsultantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    summary: '',
    skills: '',
    certifications: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('You must be logged in to add a consultant');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('consultants').insert({
      user_id: user.id,
      name: formData.name,
      title: formData.title,
      summary: formData.summary || null,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      certifications: formData.certifications.split(',').map(c => c.trim()).filter(Boolean),
    });

    if (error) {
      console.error('Error creating consultant:', error);
      alert('Error creating consultant. Please try again.');
    } else {
      router.push('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add New Consultant</CardTitle>
          <CardDescription>
            Create a new consultant profile with their skills and experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Senior IT Consultant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                rows={4}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief overview of expertise and experience..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="Python, AWS, Agile, Data Analysis"
              />
              <p className="text-xs text-muted-foreground">
                Separate skills with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications (comma-separated)</Label>
              <Input
                id="certifications"
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                placeholder="PMP, AWS Certified Solutions Architect"
              />
              <p className="text-xs text-muted-foreground">
                Separate certifications with commas
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Consultant'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
