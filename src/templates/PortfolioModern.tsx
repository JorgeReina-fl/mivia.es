// ---------------------------------------------------------------------------
// Types — decoupled from Prisma JsonValue to avoid intersection conflicts
// ---------------------------------------------------------------------------

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  instagram?: string;
  twitter?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  url?: string;
  year?: number;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  startYear?: number;
  endYear?: number | null;
  period?: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  year?: number | null;
}

export interface PortfolioContent {
  headline?: string;
  summary?: string;
  projects?: PortfolioProject[];
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  testimonials?: Array<{
    author: string;
    role?: string;
    text: string;
  }>;
  ctaText?: string;
  accentColor?: string;
}

export interface PortfolioUpload {
  id: string;
  portfolioId: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
  createdAt: Date;
}

export interface PortfolioData {
  id: string;
  businessId: string;
  name: string;
  profession: string;
  bio: string;
  location: string | null;
  email: string | null;
  website: string | null;
  avatarUrl: string | null;
  skills: string[];
  generatedHtml: string | null;
  seoTitle: string | null;
  seoDesc: string | null;
  template: string;
  createdAt: Date;
  updatedAt: Date;
  // Typed overrides (Prisma stores these as JsonValue)
  socialLinks: SocialLinks;
  content: PortfolioContent | null;
  uploads: PortfolioUpload[];
}

export interface PortfolioTemplateProps {
  portfolio: PortfolioData;
  isPreview?: boolean;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HeroSection({
  portfolio,
}: {
  portfolio: PortfolioTemplateProps["portfolio"];
}) {
  const content = portfolio.content ?? {};
  const accent = content.accentColor ?? "#6366f1";

  return (
    <section className="flex flex-col items-center gap-6 py-20 px-6 text-center">
      {portfolio.avatarUrl && (
        <img
          src={portfolio.avatarUrl}
          alt={portfolio.name}
          className="w-28 h-28 rounded-full object-cover ring-4 ring-indigo-500"
        />
      )}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{portfolio.name}</h1>
        <p className="mt-1 text-xl text-gray-500">{portfolio.profession}</p>
        {portfolio.location && (
          <p className="mt-1 text-sm text-gray-400">{portfolio.location}</p>
        )}
      </div>
      {content.headline && (
        <p className="max-w-xl text-lg text-gray-700">{content.headline}</p>
      )}
      <div className="flex gap-4 flex-wrap justify-center">
        {portfolio.email && (
          <a
            href={`mailto:${portfolio.email}`}
            className="px-5 py-2 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: accent }}
          >
            {content.ctaText ?? "Contactar"}
          </a>
        )}
        {portfolio.website && (
          <a
            href={portfolio.website}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-full border text-sm font-medium"
          >
            Web
          </a>
        )}
      </div>
      <SocialBar links={portfolio.socialLinks} accent={accent} />
    </section>
  );
}

function SocialBar({ links, accent }: { links: SocialLinks; accent: string }) {
  const entries = Object.entries(links).filter(([, v]) => Boolean(v)) as [
    string,
    string
  ][];
  if (!entries.length) return null;
  return (
    <div className="flex gap-4">
      {entries.map(([platform, url]) => (
        <a
          key={platform}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm capitalize underline"
          style={{ color: accent }}
        >
          {platform}
        </a>
      ))}
    </div>
  );
}

function AboutSection({ bio, summary }: { bio: string; summary?: string }) {
  return (
    <section className="max-w-2xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-semibold mb-4">Sobre mí</h2>
      <p className="text-gray-700 leading-relaxed">{summary ?? bio}</p>
    </section>
  );
}

function SkillsSection({ skills }: { skills: string[] }) {
  if (!skills.length) return null;
  return (
    <section className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-semibold mb-4">Habilidades</h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}

function ProjectsSection({ projects }: { projects: PortfolioProject[] }) {
  if (!projects.length) return null;
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-semibold mb-8">Proyectos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="border rounded-2xl overflow-hidden flex flex-col"
          >
            {project.imageUrl && (
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-5 flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{project.title}</h3>
                {project.year && (
                  <span className="text-xs text-gray-400">{project.year}</span>
                )}
              </div>
              <p className="text-gray-600 text-sm flex-1">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline mt-1"
                >
                  Ver proyecto →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection({
  testimonials,
}: {
  testimonials: NonNullable<PortfolioContent["testimonials"]>;
}) {
  if (!testimonials.length) return null;
  return (
    <section className="bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-8 text-center">
          Lo que dicen de mí
        </h2>
        <div className="flex flex-col gap-6">
          {testimonials.map((t, i) => (
            <blockquote
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border"
            >
              <p className="text-gray-700 italic">&ldquo;{t.text}&rdquo;</p>
              <footer className="mt-3 text-sm font-medium text-gray-500">
                — {t.author}
                {t.role && `, ${t.role}`}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactFooter({
  portfolio,
  accent,
}: {
  portfolio: PortfolioTemplateProps["portfolio"];
  accent: string;
}) {
  return (
    <footer className="py-12 px-6 text-center border-t">
      <p className="text-gray-500 text-sm mb-2">
        ¿Tienes un proyecto en mente?
      </p>
      {portfolio.email && (
        <a
          href={`mailto:${portfolio.email}`}
          className="text-lg font-medium underline"
          style={{ color: accent }}
        >
          {portfolio.email}
        </a>
      )}
      <p className="mt-8 text-xs text-gray-300">
        Página creada con mivia.es
      </p>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Main template component
// ---------------------------------------------------------------------------

export default function PortfolioModern({
  portfolio,
  isPreview = false,
}: PortfolioTemplateProps) {
  const content = portfolio.content ?? {};
  const accent = content.accentColor ?? "#6366f1";
  const projects = content.projects ?? [];
  const testimonials = content.testimonials ?? [];

  return (
    <div
      className={`min-h-screen bg-white font-sans text-gray-900 ${
        isPreview ? "pointer-events-none select-none" : ""
      }`}
    >
      <HeroSection portfolio={portfolio} />
      <AboutSection bio={portfolio.bio} summary={content.summary} />
      <SkillsSection skills={portfolio.skills} />
      {projects.length > 0 && <ProjectsSection projects={projects} />}
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}
      <ContactFooter portfolio={portfolio} accent={accent} />
    </div>
  );
}
