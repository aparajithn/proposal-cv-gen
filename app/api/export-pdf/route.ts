import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { TailoredProject } from '@/types';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { consultantId, tailoredProjects, format, rfpName } = body;

    if (!consultantId || !tailoredProjects) {
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

    // Generate HTML for the CV
    const html = generateCVHTML(consultant, tailoredProjects, format);

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CV-${rfpName || consultant.name}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error in export-pdf:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

function generateCVHTML(
  consultant: any,
  projects: TailoredProject[],
  format: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      font-size: 28px;
      margin-bottom: 5px;
      color: #1a1a1a;
    }
    h2 {
      font-size: 18px;
      color: #666;
      margin-bottom: 20px;
      font-weight: normal;
    }
    h3 {
      font-size: 16px;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #1a1a1a;
      border-bottom: 2px solid #333;
      padding-bottom: 5px;
    }
    .summary {
      margin-bottom: 25px;
      line-height: 1.8;
    }
    .skills, .certifications {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }
    .skill, .cert {
      background: #f0f0f0;
      padding: 5px 12px;
      border-radius: 4px;
      font-size: 14px;
    }
    .project {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .project-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .project-meta {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }
    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 10px 0;
    }
    .tech {
      background: #e8e8e8;
      padding: 3px 10px;
      border-radius: 3px;
      font-size: 12px;
    }
    .project-description {
      margin: 10px 0;
      line-height: 1.7;
    }
    .outcomes {
      font-style: italic;
      margin-top: 10px;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${consultant.name}</h1>
    <h2>${consultant.title}</h2>
    
    ${consultant.summary ? `
      <div class="summary">
        ${consultant.summary}
      </div>
    ` : ''}
    
    ${consultant.skills && consultant.skills.length > 0 ? `
      <h3>Skills</h3>
      <div class="skills">
        ${consultant.skills.map((skill: string) => `<span class="skill">${skill}</span>`).join('')}
      </div>
    ` : ''}
    
    ${consultant.certifications && consultant.certifications.length > 0 ? `
      <h3>Certifications</h3>
      <div class="certifications">
        ${consultant.certifications.map((cert: string) => `<span class="cert">${cert}</span>`).join('')}
      </div>
    ` : ''}
    
    <h3>Project Experience</h3>
    ${projects.map((project: TailoredProject) => `
      <div class="project">
        <div class="project-title">${project.role}</div>
        <div class="project-meta">
          ${project.client_name || ''}
          ${project.client_name && project.duration ? ' • ' : ''}
          ${project.duration || ''}
        </div>
        
        ${project.tech_stack && project.tech_stack.length > 0 ? `
          <div class="tech-stack">
            ${project.tech_stack.map((tech: string) => `<span class="tech">${tech}</span>`).join('')}
          </div>
        ` : ''}
        
        ${project.tailored_description ? `
          <div class="project-description">
            ${project.tailored_description}
          </div>
        ` : ''}
        
        ${project.outcomes ? `
          <div class="outcomes">
            <strong>Key Outcomes:</strong> ${project.outcomes}
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>
</body>
</html>
  `;
}
