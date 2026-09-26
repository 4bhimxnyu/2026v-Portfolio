'use client';

import { useState } from 'react';
import Image from 'next/image';
import { projects, otherProjects } from '@/data/projects';
import styles from './Projects.module.css';

function ProjectDetails({ project }) {
  const { description, role, technologies, image, imageAlt, link, source, caseStudy, name } = project;
  const hasContent = description || role || technologies.length || link || source || caseStudy;

  return (
    <div className={styles.details}>
      <div className={styles.preview}>
        {image ? (
          <Image src={image} alt={imageAlt || `${name} preview`} fill sizes="(max-width: 800px) 100vw, 40vw" />
        ) : (
          <span className={styles.previewEmpty}>Preview image to come</span>
        )}
      </div>

      <div className={styles.info}>
        {hasContent ? (
          <>
            {description && <p className={styles.description}>{description}</p>}
            <dl className={styles.facts}>
              {role && (
                <div>
                  <dt>Role</dt>
                  <dd>{role}</dd>
                </div>
              )}
              {technologies.length > 0 && (
                <div>
                  <dt>Built with</dt>
                  <dd>{technologies.join(', ')}</dd>
                </div>
              )}
            </dl>
            <div className={styles.links}>
              {link && (
                <a href={link} target="_blank" rel="noopener noreferrer">
                  Visit {name}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              )}
              {source && (
                <a href={source} target="_blank" rel="noopener noreferrer">
                  View the source on GitHub
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              )}
              {caseStudy && <a href={caseStudy}>Read the case study</a>}
            </div>
          </>
        ) : (
          <p className={styles.description}>The write-up for {name} is in progress.</p>
        )}
      </div>
    </div>
  );
}

// Cursor-following preview (only rendered for projects that have an image).
const trackPreview = e => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--px', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--py', `${e.clientY - rect.top}px`);
};

export default function Projects() {
  const [open, setOpen] = useState(null);

  return (
    <section id="work" className={styles.work} aria-labelledby="work-title">
      <header className={styles.head}>
        <h2 id="work-title" className={styles.title}>
          Selected work
        </h2>
        <p className={styles.intro}>Three projects, chosen on purpose. Open one for details.</p>
      </header>

      <ul className={styles.list}>
        {projects.map((project, index) => {
          const isOpen = open === project.slug;
          const panelId = `project-${project.slug}`;
          const meta = [project.category, project.year].filter(Boolean).join(', ');
          return (
            <li
              key={project.slug}
              className={styles.item}
              data-open={isOpen || undefined}
              data-flip={index % 2 === 1 || undefined}
            >
              <h3 className={styles.itemHeading}>
                <button
                  type="button"
                  className={styles.row}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : project.slug)}
                  onPointerMove={project.image ? trackPreview : undefined}
                >
                  <span className={styles.name}>{project.name}</span>
                  {meta && <span className={styles.meta}>{meta}</span>}
                  <span className={styles.toggle} aria-hidden="true" />
                  {project.image && (
                    <span className={styles.float} aria-hidden="true">
                      <Image src={project.image} alt="" fill sizes="18rem" />
                    </span>
                  )}
                </button>
              </h3>
              <div id={panelId} className={styles.panel} hidden={!isOpen}>
                <ProjectDetails project={project} />
              </div>
            </li>
          );
        })}
      </ul>

      {otherProjects.length > 0 && (
        <div className={styles.other}>
          <h3 className={styles.otherTitle}>Other projects</h3>
          <ul className={styles.otherList}>
            {otherProjects.map(item => (
              <li key={item.name} className={styles.otherItem}>
                <h4 className={styles.otherName}>
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      {item.name}
                      <span className="visually-hidden"> on GitHub (opens in a new tab)</span>
                    </a>
                  ) : (
                    item.name
                  )}
                </h4>
                {item.category && <p className={styles.otherCategory}>{item.category}</p>}
                <p className={styles.otherDescription}>{item.description}</p>
                <p className={styles.otherTech}>{item.technologies.join(', ')}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
