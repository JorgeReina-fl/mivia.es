import {
  PortfolioData,
  PortfolioTemplateProps,
  ExperienceEntry,
  EducationEntry,
} from './PortfolioModern'

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=DM+Mono:wght@400;500&display=swap'

const css = `
@import url('${FONTS_URL}');

#mn-root {
  background: #fff;
  color: #111;
  font-family: 'Cormorant Garamond', Georgia, serif;
  min-height: 100vh;
}
.mn-hero {
  padding: 3rem 1.25rem 2rem;
  border-bottom: 1px solid #e8e6e2;
}
.mn-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
  color: #555; margin-bottom: 1.25rem;
  display: flex; align-items: center; gap: 0.75rem;
}
.mn-eyebrow::after {
  content: ''; flex: 1; height: 1px; background: #e0ddd8;
}
.mn-name {
  font-size: clamp(3.25rem, 13vw, 5.5rem);
  font-weight: 600; line-height: 0.9;
  letter-spacing: -0.02em; color: #111;
  margin-bottom: 0.75rem;
}
.mn-name em { font-style: italic; color: #111; }
.mn-gold { display: block; width: 2.5rem; height: 2px; background: #d4a853; margin: 1.25rem 0; }
.mn-headline {
  font-size: clamp(1.05rem, 3.5vw, 1.2rem);
  font-weight: 400; line-height: 1.65; color: #333;
  max-width: 36ch;
}
.mn-contact {
  display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e8e6e2;
  background: #faf9f7;
}
.mn-contact a {
  font-family: 'DM Mono', monospace;
  font-size: 10.5px; color: #555; text-decoration: none;
  letter-spacing: 0.04em;
  transition: color 0.2s;
}
.mn-contact a:hover { color: #111; }
.mn-skills {
  padding: 1.25rem 1.25rem;
  border-bottom: 1px solid #e8e6e2;
  display: flex; flex-wrap: wrap; gap: 0.5rem;
}
.mn-skill {
  font-family: 'DM Mono', monospace;
  font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  color: #111; background: #f3f2f0;
  padding: 5px 12px; border-radius: 2px;
}
.mn-projects { padding: 2.5rem 1.25rem 0; }
.mn-sec-label {
  font-family: 'DM Mono', monospace;
  font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase;
  color: #aaa; margin-bottom: 2rem;
}
.mn-proj {
  padding-bottom: 2.5rem; margin-bottom: 2.5rem;
  border-bottom: 1px solid #ece9e4;
}
.mn-proj:last-child { border-bottom: none; }
.mn-proj-hd { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 0.75rem; }
.mn-proj-n {
  font-family: 'DM Mono', monospace;
  font-size: 10px; color: #d4a853; flex-shrink: 0;
}
.mn-proj-title {
  font-size: clamp(1.35rem, 4vw, 1.75rem);
  font-weight: 600; line-height: 1.15; color: #111;
}
.mn-proj-desc {
  font-size: 1rem; font-weight: 400; line-height: 1.75;
  color: #333; margin-bottom: 1rem;
}
.mn-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.mn-tag {
  font-family: 'DM Mono', monospace;
  font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 3px 9px; border: 1px solid #ccc; color: #666;
}
.mn-timeline { padding: 2.5rem 1.25rem; background: #faf9f7; }
.mn-tl-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;
}
@media (max-width: 500px) { .mn-tl-grid { grid-template-columns: 1fr; } }
.mn-tl-item { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.mn-tl-item:last-child { margin-bottom: 0; }
.mn-tl-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #d4a853;
  flex-shrink: 0; margin-top: 6px;
}
.mn-tl-role { font-size: 1rem; font-weight: 600; color: #111; margin-bottom: 0.2rem; }
.mn-tl-co { font-size: 0.95rem; font-weight: 400; color: #444; margin-bottom: 0.2rem; }
.mn-tl-yr {
  font-family: 'DM Mono', monospace;
  font-size: 9px; color: #aaa; letter-spacing: 0.08em;
}
.mn-footer {
  background: #111; color: #fff;
  padding: 2.5rem 1.25rem;
  display: flex; flex-direction: column; gap: 1rem;
}
.mn-footer-name { font-size: 1.5rem; font-weight: 300; }
.mn-footer-email {
  font-family: 'DM Mono', monospace;
  font-size: 11px; color: #d4a853;
  text-decoration: none; letter-spacing: 0.05em;
}
.mn-footer-email:hover { text-decoration: underline; }
`

function formatYear(entry: ExperienceEntry): string {
  if (entry.period) return entry.period
  const start = entry.startYear ?? ''
  const end = entry.endYear ? String(entry.endYear) : 'Presente'
  return `${start} — ${end}`
}

export default function PortfolioMinimal({ portfolio }: PortfolioTemplateProps) {
  const content = portfolio.content ?? {}
  const projects = content.projects ?? []
  const experience: ExperienceEntry[] = content.experience ?? []
  const education: EducationEntry[] = content.education ?? []
  const socialLinks = portfolio.socialLinks ?? {}

  const nameParts = portfolio.name.split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ')

  const eyebrow = [portfolio.profession, portfolio.location].filter(Boolean).join(' · ')

  return (
    <div id="mn-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* HERO */}
      <header className="mn-hero">
        <div className="mn-eyebrow">{eyebrow}</div>
        <h1 className="mn-name">
          {firstName}
          {lastName && (
            <>
              <br />
              <em>{lastName}</em>
            </>
          )}
        </h1>
        <span className="mn-gold" />
        {content.headline && (
          <p className="mn-headline">{content.headline}</p>
        )}
      </header>

      {/* CONTACT */}
      <nav className="mn-contact">
        {portfolio.email && (
          <a href={`mailto:${portfolio.email}`}>{portfolio.email}</a>
        )}
        {portfolio.website && (
          <a href={portfolio.website} target="_blank" rel="noopener noreferrer">
            {portfolio.website.replace(/^https?:\/\//, '')}
          </a>
        )}
        {socialLinks.linkedin && (
          <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        )}
        {socialLinks.github && (
          <a href={socialLinks.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        )}
        {socialLinks.instagram && (
          <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
        )}
        {socialLinks.twitter && (
          <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>
        )}
      </nav>

      {/* SKILLS */}
      {portfolio.skills.length > 0 && (
        <div className="mn-skills">
          {portfolio.skills.map((skill) => (
            <span key={skill} className="mn-skill">{skill}</span>
          ))}
        </div>
      )}

      {/* PROJECTS */}
      {projects.length > 0 && (
        <main className="mn-projects">
          <p className="mn-sec-label">Proyectos seleccionados</p>
          {projects.map((proj, idx) => (
            <article key={proj.id} className="mn-proj">
              <div className="mn-proj-hd">
                <span className="mn-proj-n">{String(idx + 1).padStart(2, '0')}</span>
                <h2 className="mn-proj-title">{proj.title}</h2>
              </div>
              <p className="mn-proj-desc">{proj.description}</p>
              {proj.tags.length > 0 && (
                <div className="mn-tags">
                  {proj.tags.map((tag) => (
                    <span key={tag} className="mn-tag">{tag}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </main>
      )}

      {/* TIMELINE */}
      {(experience.length > 0 || education.length > 0) && (
        <section className="mn-timeline">
          <p className="mn-sec-label" style={{ marginBottom: '1.5rem' }}>Trayectoria</p>
          <div className="mn-tl-grid">
            {experience.length > 0 && (
              <div>
                <p className="mn-sec-label">Experiencia</p>
                {experience.map((exp, idx) => (
                  <div key={idx} className="mn-tl-item">
                    <div className="mn-tl-dot" />
                    <div>
                      <p className="mn-tl-role">{exp.role}</p>
                      <p className="mn-tl-co">{exp.company}</p>
                      <p className="mn-tl-yr">{formatYear(exp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {education.length > 0 && (
              <div>
                <p className="mn-sec-label">Formación</p>
                {education.map((edu, idx) => (
                  <div key={idx} className="mn-tl-item">
                    <div className="mn-tl-dot" />
                    <div>
                      <p className="mn-tl-role">{edu.degree}</p>
                      <p className="mn-tl-co">{edu.institution}</p>
                      {edu.year && <p className="mn-tl-yr">{edu.year}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="mn-footer">
        <p className="mn-footer-name">{portfolio.name}</p>
        {portfolio.email && (
          <a href={`mailto:${portfolio.email}`} className="mn-footer-email">
            {portfolio.email}
          </a>
        )}
      </footer>
    </div>
  )
}
