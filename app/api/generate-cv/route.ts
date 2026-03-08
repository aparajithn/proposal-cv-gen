import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { tailorProjectDescription } from '@/lib/openai';
import { CVGenerationRequest, TailoredProject } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: CVGenerationRequest = await request.json();
    const { consultantId, rfpKeywords } = body;

    if (!consultantId || !rfpKeywords || rfpKeywords.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Fetch consultant
    const { data: consultant, error: consultantError } = await supabase
      .from('consultants')
      .select('*')
      .eq('id', consultantId)
      .single();

    if (consultantError || !consultant) {
      return NextResponse.json(
        { error: 'Consultant not found' },
        { status: 404 }
      );
    }

    // Fetch projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('consultant_id', consultantId)
      .order('created_at', { ascending: false });

    if (projectsError) {
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    // Tailor each project description using AI
    const tailoredProjects: TailoredProject[] = await Promise.all(
      (projects || []).map(async (project) => {
        // Use the most appropriate description based on what's available
        const originalDescription =
          project.description_technical ||
          project.description_executive ||
          project.description_functional ||
          `${project.role} at ${project.client_name || 'client'}`;

        try {
          const tailoredDescription = await tailorProjectDescription(
            originalDescription,
            rfpKeywords
          );

          return {
            ...project,
            tailored_description: tailoredDescription,
          };
        } catch (error) {
          console.error('Error tailoring project:', error);
          // Fallback to original description if AI fails
          return {
            ...project,
            tailored_description: originalDescription,
          };
        }
      })
    );

    return NextResponse.json({
      consultant,
      tailoredProjects,
    });
  } catch (error) {
    console.error('Error in generate-cv:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
