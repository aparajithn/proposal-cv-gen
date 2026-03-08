import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Users, Download, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-8 py-16 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Stop Wasting 12 Hours Per Proposal on CVs
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Generate client-ready consultant CVs in seconds. Store profiles once,
            tailor them instantly for every RFP.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Get Started
                <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Add Consultants</h3>
              <p className="text-muted-foreground">
                Upload profiles with skills, certifications, and project history
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Paste RFP Keywords</h3>
              <p className="text-muted-foreground">
                AI tailors project descriptions to match RFP requirements
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Download CVs</h3>
              <p className="text-muted-foreground">
                Get clean PDFs or Word docs in seconds
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-8 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">
            The Proposal CV Nightmare
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-red-600">❌ Before</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Copy-pasting from old proposals</li>
                <li>• Reformatting to match client templates</li>
                <li>• Outdated information slipping through</li>
                <li>• 12+ hours per proposal building CVs</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-green-600">✅ After</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Store consultant profiles in one place</li>
                <li>• Auto-tailor to match RFP keywords</li>
                <li>• Generate clean, professional CVs</li>
                <li>• Track what was sent to which client</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to save 12 hours per proposal?
          </h2>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Building CVs
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t">
        <div className="container mx-auto px-8 text-center text-sm text-muted-foreground">
          <p>ProposalCV - AI-powered consulting proposal CVs</p>
        </div>
      </footer>
    </div>
  );
}
