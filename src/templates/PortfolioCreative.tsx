import {
  PortfolioTemplateProps,
  ExperienceEntry,
  EducationEntry,
} from './PortfolioModern'

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap'

const css = `
@import url('${FONTS_URL}');

#cr-root {
  background: #0f0f0f;
  color: #f0ede8;
  font-family: 'Barlow', sans-serif;
  min-height: 100vh;
}
.cr-hero {
  padding: 2rem 1.25rem;
  border-bottom: 1px solid #222;
}
.cr-topbar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 3rem;
}
.cr-location {
  font-family: 'DM Mono', monospace;
  font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #666;
}
.cr-avail {
  font-family: 'DM Mono', monospace;
  font-size: 10px; letter-spacing: 0.1em;
  color: #e8e000; display: flex; align-items: center; gap: 6px;
}
.cr-avail::before {
  content: ''; width: 6px; height: 6px; border-radius: 50%;
  background: #e8e000; display: inline-block;
}
.cr-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(4.5rem, 22vw, 9rem);
  font-weight: 900; line-height: 0.85;
  text-transform: uppercase; letter-spacing: -0.02em;
  color: #f0ede8; margin-bottom: 2rem;
}
.cr-name .yr { color: #e8e000; }
.cr-hd-row {
  display: flex; flex-direction: column; gap: 1rem;
  padding-top: 1.5rem; border-top: 1px solid #222;
}
@media (min-width: 640px) {
  .cr-hd-row { flex-direction: row; justify-content: space-between; align-items: flex-end; }
}
.cr-profession {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(1.2rem, 4vw, 1.75rem);
  font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.04em; color: #e8e000; line-height: 1.2;
}
.cr-summary {
  font-size: 0.9rem; font-weight: 400; line-height: 1.65;
  color: #aaa; max-width: 38ch;
}
@media (min-width: 640px) { .cr-summary { text-align: right; } }
.cr-skills {
  background: #e8e000;
  padding: 0.85rem 1.25rem;
  display: flex; flex-wrap: wrap; gap: 0;
}
.cr-skill {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 13px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.07em;
  color: #0f0f0f;
  padding-right: 1rem; margin-right: 1rem;
  border-right: 2px solid #0f0f0f;
  white-space: nowrap; line-height: 1.6;
}
.cr-skill:last-child { border-right: none; padding-right: 0; margin-right: 0; }
.cr-projects { padding: 2rem 1.25rem 0; }
.cr-proj-hd {
  display: flex; justify-content: space-between; align-items: baseline;
  padding-bottom: 1rem; margin-bottom: 0;
  border-bottom: 2px solid #f0ede8;
}
.cr-sec-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(2rem, 8vw, 3.5rem);
  font-weight: 900; text-transform: uppercase;
  letter-spacing: -0.01em; color: #f0ede8;
}
.cr-proj-count {
  font-family: 'DM Mono', monospace;
  font-size: 10px; color: #555;
}
.cr-proj {
  display: grid;
  grid-template-columns: 3rem 1fr;
  gap: 1.25rem;
  padding: 1.75rem 0;
  border-bottom: 1px solid #1e1e1e;
  transition: background 0.15s;
}
.cr-proj:last-child { border-bottom: none; }
.cr-proj-n {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2.25rem; font-weight: 900;
  color: #2a2a2a; line-height: 1;
  letter-spacing: -0.02em; padding-top: 2px;
}
.cr-proj-meta {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 0.6rem;
}
.cr-proj-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(1.25rem, 5vw, 1.75rem);
  font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.01em; color: #f0ede8; line-height: 1;
}
.cr-proj-yr {
  font-family: 'DM Mono', monospace;
  font-size: 9px; color: #555; flex-shrink: 0; margin-left: 0.75rem;
}
.cr-proj-desc {
  font-size: 0.875rem; font-weight: 400;
  line-height: 1.65; color: #aaa; margin-bottom: 0.85rem;
}
.cr-proj-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.cr-proj-tag {
  font-family: 'DM Mono', monospace;
  font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 3px 8px;
  border: 1px solid #2e2e2e; color: #666;
  border-radius: 2px;
}
.cr-bottom {
  padding: 2rem 1.25rem;
  border-top: 2px solid #f0ede8;
  display: flex; flex-direction: column; gap: 2.5rem;
}
@media (min-width: 640px) {
  .cr-bottom { flex-direction: row; gap: 0; }
  .cr-bottom-col:first-child { flex: 1; padding-right: 2rem; border-right: 1px solid #222; }
  .cr-bottom-col:last-child { flex: 1; padding-left: 2rem; }
}
.cr-col-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.5rem; font-weight: 900;
  text-transform: uppercase; color: #f0ede8;
  margin-bottom: 1.5rem;
}
.cr-exp-item {
  display: flex; gap: 1rem; margin-bottom: 1.5rem;
}
.cr-exp-item:last-child { margin-bottom: 0; }
.cr-exp-bar {
  width: 3px; background: #e8e000;
  flex-shrink: 0; border-radius: 2px;
}
.cr-exp-role {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.05rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.02em;
  color: #f0ede8; margin-bottom: 0.15rem;
}
.cr-exp-co { font-size: 0.85rem; font-weight: 400; color: #999; }
.cr-exp-yr {
  font-family: 'DM Mono', monospace;
  font-size: 9px; color: #555; margin-top: 0.25rem;
}
.cr-edu-item { margin-bottom: 1.25rem; }
.cr-edu-item:last-child { margin-bottom: 0; }
.cr-edu-degree {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.05rem; font-weight: 700;
  text-transform: uppercase; color: #f0ede8;
}
.cr-edu-inst { font-size: 0.85rem; font-weight: 400; color: #999; }
.cr-edu-yr {
  font-family: 'DM Mono', monospace;
  font-size: 9px; color: #555; margin-top: 0.2rem;
}
.cr-footer {
  background: #0a0a0a;
  border-top: 1px solid #1a1a1a;
  padding: 2.5rem 1.25rem;
  display: flex; flex-direction: column; gap: 1.5rem;
}
@media (min-width: 640px) {
  .cr-footer { flex-direction: row; justify-content: space-between; align-items: flex-end; }
}
.cr-footer-cta {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(2.25rem, 9vw, 4rem);
  font-weight: 900; text-transform: uppercase;
  color: #f0ede8; line-height: 0.88;
  letter-spacing: -0.02em;
}
.cr-footer-cta .y { color: #e8e000; }
.cr-footer-right { display: flex; flex-direction: column; gap: 0.6rem; }
@media (min-width: 640px) { .cr-footer-right { align-items: flex-end; } }
.cr-footer-email {
  font-family: 'DM Mono', monospace;
  font-size: 11px; color: #e8e000;
  text-decoration: none; letter-spacing: 0.04em;
}
.cr-footer-email:hover { text-decoration: underline; }
.cr-footer-socials { display: flex; gap: 1rem; flex-wrap: wrap; }
.cr-footer-social {
  font-family: 'DM Mono', monospace;
  font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase;
  color: #555; text-decoration: none;
}
.cr-footer-social:hover { color: #f0ede8; }
`

function formatExpYear(exp: ExperienceEntry): string {
  if (exp.period) return exp.period
  const start = exp.startYear ?? ''
  const end = exp.endYear ? String(exp.endYear) : 'Presente'
  return `${start} — ${end}`
}

export default function PortfolioCreative({ portfolio }: PortfolioTemplateProps) {
  const content = portfolio.content ?? {}
  const projects = content.projects ?? []
  const experience: ExperienceEntry[] = content.experience ?? []
  const education: EducationEntry[] = content.education ?? []
  const socialLinks = portfolio.socialLinks ?? {}

  const nameParts = portfolio.name.split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ')

  return (
    <div id="cr-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* HERO */}
      <header className="cr-hero">
        <div className="cr-topbar">
          <span className="cr-location">{portfolio.location ?? ''}</span>
          <span className="cr-avail">Disponible</span>
        </div>
        <h1 className="cr-name">
          {firstName}
          {lastName && (
            <>
              <br />
              <span className="yr">{lastName}</span>
            </>
          )}
        </h1>
        <div className="cr-hd-row">
          <p className="cr-profession">{portfolio.profession}</p>
          {content.summary && (
            <p className="cr-summary">{content.summary}</p>
          )}
        </div>
      </header>

      {/* SKILLS STRIP */}
      {portfolio.skills.length > 0 && (
        <div className="cr-skills">
          {portfolio.skills.map((skill) => (
            <span key={skill} className="cr-skill">{skill}</span>
          ))}
        </div>
      )}

      {/* PROJECTS */}
      {projects.length > 0 && (
        <section className="cr-projects">
          <div className="cr-proj-hd">
            <h2 className="cr-sec-title">Selected Work</h2>
            <span className="cr-proj-count">
              {String(projects.length).padStart(2, '0')} proyectos
            </span>
          </div>
          <div>
            {projects.map((proj, idx) => (
              <div key={proj.id} className="cr-proj">
                <span className="cr-proj-n">{String(idx + 1).padStart(2, '0')}</span>
                <div>
                  <div className="cr-proj-meta">
                    <h3 className="cr-proj-title">{proj.title}</h3>
                    {proj.year && <span className="cr-proj-yr">{proj.year}</span>}
                  </div>
                  <p className="cr-proj-desc">{proj.description}</p>
                  {proj.tags.length > 0 && (
                    <div className="cr-proj-tags">
                      {proj.tags.map((tag) => (
                        <span key={tag} className="cr-proj-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EXP + EDU */}
      {(experience.length > 0 || education.length > 0) && (
        <div className="cr-bottom">
          {experience.length > 0 && (
            <div className="cr-bottom-col">
              <h3 className="cr-col-title">Experiencia</h3>
              {experience.map((exp, idx) => (
                <div key={idx} className="cr-exp-item">
                  <div className="cr-exp-bar" />
                  <div>
                    <p className="cr-exp-role">{exp.role}</p>
                    <p className="cr-exp-co">{exp.company}</p>
                    <p className="cr-exp-yr">{formatExpYear(exp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {education.length > 0 && (
            <div className="cr-bottom-col">
              <h3 className="cr-col-title">Formación</h3>
              {education.map((edu, idx) => (
                <div key={idx} className="cr-edu-item">
                  <p className="cr-edu-degree">{edu.degree}</p>
                  <p className="cr-edu-inst">{edu.institution}</p>
                  {edu.year && <p className="cr-edu-yr">{edu.year}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <footer className="cr-footer">
        <div className="cr-footer-cta">
          Let&apos;s make<br /><span className="y">something</span><br />bold.
        </div>
        <div className="cr-footer-right">
          {portfolio.email && (
            <a href={`mailto:${portfolio.email}`} className="cr-footer-email">
              {portfolio.email}
            </a>
          )}
          <div className="cr-footer-socials">
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} className="cr-footer-social" target="_blank" rel="noopener noreferrer">Instagram</a>
            )}
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} className="cr-footer-social" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            )}
            {portfolio.website && (
              <a href={portfolio.website} className="cr-footer-social" target="_blank" rel="noopener noreferrer">
                {portfolio.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} className="cr-footer-social" target="_blank" rel="noopener noreferrer">Twitter</a>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
