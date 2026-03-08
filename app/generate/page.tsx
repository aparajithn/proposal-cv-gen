'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Consultant, Project, TailoredProject } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import Link from 'next/link';

export default function GenerateCVPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedConsultantId, setSelectedConsultantId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tailoredProjects, setTailoredProjects] = useState<TailoredProject[]>([]);
  const [rfpKeywords, setRfpKeywords] = useState('');
  const [rfpName, setRfpName] = useState('');
  const [format, setFormat] = useState<'pdf' | 'word-table' | 'word-bullets'>('pdf');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'tailor' | 'preview'>('select');

  useEffect(() => {
    fetchConsultants();
  }, []);

  useEffect(() => {
    if (selectedConsultantId) {
      fetchProjects();
    }
  }, [selectedConsultantId]);

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

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('consultant_id', selectedConsultantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
  }

  async function handleTailorDescriptions() {
    if (!rfpKeywords.trim()) {
      alert('Please enter RFP keywords');
      return;
    }

    setLoading(true);

    const keywords = rfpKeywords.split(',').map(k => k.trim()).filter(Boolean);

    try {
      const response = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultantId: selectedConsultantId,
          rfpKeywords: keywords,
          format,
          rfpName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate CV');
      }

      const data = await response.json();
      setTailoredProjects(data.tailoredProjects);
      setStep('preview');
    } catch (error) {
      console.error('Error generating CV:', error);
      alert('Error generating CV. Please try again.');
    }

    setLoading(false);
  }

  async function handleDownload() {
    setLoading(true);

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultantId: selectedConsultantId,
          tailoredProjects,
          format,
          rfpName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export CV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV-${rfpName || 'generated'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Log the export
      await supabase.from('cv_exports').insert({
        consultant_id: selectedConsultantId,
        rfp_name: rfpName || null,
        format,
      });
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Error downloading CV. Please try again.');
    }

    setLoading(false);
  }

  const selectedConsultant = consultants.find(c => c.id === selectedConsultantId);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate CV</h1>
        <p className="text-muted-foreground">
          AI-powered CV tailoring for RFP responses
        </p>
      </div>

      {step === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Consultant & RFP Details</CardTitle>
            <CardDescription>
              Choose the consultant and provide RFP keywords for tailoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="consultant">Consultant *</Label>
              <Select
                value={selectedConsultantId}
                onValueChange={setSelectedConsultantId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      {consultant.name} - {consultant.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedConsultantId && projects.length === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  This consultant has no projects yet.{' '}
                  <Link href={`/projects/new?consultantId=${selectedConsultantId}`} className="underline">
                    Add a project first
                  </Link>
                  .
                </p>
              </div>
            )}

            {selectedConsultantId && projects.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rfpName">RFP Name (optional)</Label>
                  <Input
                    id="rfpName"
                    value={rfpName}
                    onChange={(e) => setRfpName(e.target.value)}
                    placeholder="Client XYZ - Cloud Migration RFP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rfpKeywords">RFP Keywords (comma-separated) *</Label>
                  <Textarea
                    id="rfpKeywords"
                    rows={4}
                    value={rfpKeywords}
                    onChange={(e) => setRfpKeywords(e.target.value)}
                    placeholder="cloud migration, AWS, containerization, microservices, DevOps, agile"
                  />
                  <p className="text-xs text-muted-foreground">
                    The AI will tailor project descriptions to emphasize these keywords
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">CV Format</Label>
                  <Select
                    value={format}
                    onValueChange={(value: any) => setFormat(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">Clean PDF</SelectItem>
                      <SelectItem value="word-table">Word (2-column table)</SelectItem>
                      <SelectItem value="word-bullets">Word (bullet points)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleTailorDescriptions}
                  disabled={!rfpKeywords.trim() || loading}
                  className="w-full"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {loading ? 'Tailoring...' : 'Generate Tailored CV'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'preview' && selectedConsultant && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CV Preview</CardTitle>
              <CardDescription>
                Review AI-tailored descriptions before downloading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedConsultant.name}</h2>
                  <p className="text-lg text-muted-foreground">{selectedConsultant.title}</p>
                  {selectedConsultant.summary && (
                    <p className="mt-4 text-sm">{selectedConsultant.summary}</p>
                  )}
                </div>

                {selectedConsultant.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedConsultant.skills.map((skill, idx) => (
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

                <div>
                  <h3 className="font-semibold mb-4">Projects (AI-Tailored)</h3>
                  <div className="space-y-4">
                    {tailoredProjects.map((project) => (
                      <div key={project.id} className="border-l-4 border-primary pl-4">
                        <h4 className="font-semibold">{project.role}</h4>
                        {project.client_name && (
                          <p className="text-sm text-muted-foreground">{project.client_name}</p>
                        )}
                        {project.duration && (
                          <p className="text-sm text-muted-foreground">{project.duration}</p>
                        )}
                        {project.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-2 my-2">
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
                        {project.tailored_description && (
                          <p className="text-sm mt-2">{project.tailored_description}</p>
                        )}
                        {project.outcomes && (
                          <p className="text-sm mt-2 italic">
                            <strong>Outcomes:</strong> {project.outcomes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setStep('select')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleDownload}
              disabled={loading}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              {loading ? 'Generating...' : 'Download CV'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
