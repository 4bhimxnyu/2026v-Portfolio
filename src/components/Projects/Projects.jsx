'use client';

import { useState } from 'react';
import Image from 'next/image';
import { featuredProjects } from '@/data/projects';
import styles from './Projects.module.css';

function ProjectDetails({ project }) {
  const { description, role, technologies, image, link, caseStudy, name } = project;
  const hasContent = description || role || technologies.length || link || caseStudy;

  return (
    <div className={styles.details}>
      <div className={styles.preview}>
        {image ? (
          <Image src={image} alt={`${name} preview`} fill sizes="(max-width: 800px) 100vw, 40vw" />
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
                <a href={link} target="_blank" rel="noreferrer">
                  Visit {name}
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

export default function Projects() {
  const [open, setOpen] = useState(null);

  return (
    <section id="work" className={styles.work} aria-labelledby="work-title">
      <header className={styles.head}>
        <h2 id="work-title" className={styles.title}>
          Selected work
        </h2>
        <p className={styles.intro}>A few projects across product design and development. Open one for details.</p>
      </header>

      <ul className={styles.list}>
        {featuredProjects.map(project => {
          const isOpen = open === project.slug;
          const panelId = `project-${project.slug}`;
          const meta = [project.category, project.year].filter(Boolean).join(', ');
          return (
            <li key={project.slug} className={styles.item} data-open={isOpen || undefined}>
              <h3 className={styles.itemHeading}>
                <button
                  type="button"
                  className={styles.row}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : project.slug)}
                >
                  <span className={styles.name}>{project.name}</span>
                  {meta && <span className={styles.meta}>{meta}</span>}
                  <span className={styles.toggle} aria-hidden="true" />
                </button>
              </h3>
              <div id={panelId} className={styles.panel} hidden={!isOpen}>
                <ProjectDetails project={project} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
