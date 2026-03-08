'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Consultant } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const consultantIdParam = searchParams.get('consultantId');

  const [loading, setLoading] = useState(false);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [formData, setFormData] = useState({
    consultantId: consultantIdParam || '',
    clientName: '',
    role: '',
    duration: '',
    techStack: '',
    descriptionTechnical: '',
    descriptionExecutive: '',
    descriptionFunctional: '',
    outcomes: '',
  });

  useEffect(() => {
    fetchConsultants();
  }, []);

  async function fetchConsultants() {
    const { data, error } = await supabase
      .from('consultants')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching consultants:', error);
    } else {
      setConsultants(data || []);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('projects').insert({
      consultant_id: formData.consultantId,
      client_name: formData.clientName || null,
      role: formData.role,
      duration: formData.duration || null,
      tech_stack: formData.techStack.split(',').map(t => t.trim()).filter(Boolean),
      description_technical: formData.descriptionTechnical || null,
      description_executive: formData.descriptionExecutive || null,
      description_functional: formData.descriptionFunctional || null,
      outcomes: formData.outcomes || null,
    });

    if (error) {
      console.error('Error creating project:', error);
      alert('Error creating project. Please try again.');
    } else {
      router.push(`/consultants/${formData.consultantId}`);
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <Link href={consultantIdParam ? `/consultants/${consultantIdParam}` : '/dashboard'}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add New Project</CardTitle>
          <CardDescription>
            Add a project to a consultant&apos;s profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="consultantId">Consultant *</Label>
              <Select
                value={formData.consultantId}
                onValueChange={(value) => setFormData({ ...formData, consultantId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Senior Technical Lead"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name (optional, can anonymize)</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Fortune 500 Financial Services"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="12 months (2024-2025)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="techStack">Tech Stack (comma-separated)</Label>
              <Input
                id="techStack"
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                placeholder="React, Node.js, PostgreSQL, AWS"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionTechnical">Technical Description</Label>
              <Textarea
                id="descriptionTechnical"
                rows={4}
                value={formData.descriptionTechnical}
                onChange={(e) => setFormData({ ...formData, descriptionTechnical: e.target.value })}
                placeholder="Detailed technical implementation, architecture, technologies..."
              />
              <p className="text-xs text-muted-foreground">
                For technical audiences (CTOs, architects)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionExecutive">Executive Description</Label>
              <Textarea
                id="descriptionExecutive"
                rows={3}
                value={formData.descriptionExecutive}
                onChange={(e) => setFormData({ ...formData, descriptionExecutive: e.target.value })}
                placeholder="High-level business impact and strategic outcomes..."
              />
              <p className="text-xs text-muted-foreground">
                For executive audiences (C-suite, directors)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionFunctional">Functional Description</Label>
              <Textarea
                id="descriptionFunctional"
                rows={3}
                value={formData.descriptionFunctional}
                onChange={(e) => setFormData({ ...formData, descriptionFunctional: e.target.value })}
                placeholder="Functional capabilities, user experience, process improvements..."
              />
              <p className="text-xs text-muted-foreground">
                For functional audiences (product managers, business analysts)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outcomes">Key Outcomes</Label>
              <Textarea
                id="outcomes"
                rows={3}
                value={formData.outcomes}
                onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
                placeholder="Measurable results: 40% reduction in costs, 2M users migrated..."
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-8">Loading...</div>}>
      <NewProjectForm />
    </Suspense>
  );
}
