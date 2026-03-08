'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Consultant } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Plus, User, FileText } from 'lucide-react';

export default function DashboardPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultants();
  }, []);

  async function fetchConsultants() {
    const { data, error } = await supabase
      .from('consultants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching consultants:', error);
    } else {
      setConsultants(data || []);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Consultant Database</h1>
          <p className="text-muted-foreground mt-2">
            Manage consultant profiles and generate CVs for RFP responses
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/consultants/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Consultant
            </Button>
          </Link>
          <Link href="/generate">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate CV
            </Button>
          </Link>
        </div>
      </div>

      {consultants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No consultants yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first consultant profile
            </p>
            <Link href="/consultants/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Consultant
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultants.map((consultant) => (
            <Link key={consultant.id} href={`/consultants/${consultant.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{consultant.name}</CardTitle>
                  <CardDescription>{consultant.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {consultant.summary || 'No summary available'}
                  </p>
                  {consultant.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {consultant.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {consultant.skills.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{consultant.skills.length - 3} more
                        </span>
                      )}
                    </div>
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
