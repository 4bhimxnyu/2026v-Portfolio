import { experience, education } from '@/data/experience';
import styles from './Experience.module.css';

export default function Experience() {
  return (
    <section id="experience" className={styles.experience} aria-labelledby="experience-title">
      <h2 id="experience-title" className={styles.title}>
        Experience
      </h2>

      <ol className={styles.timeline}>
        {experience.map(job => {
          const current = job.end === 'Present';
          return (
            <li key={`${job.company}-${job.start}`} className={styles.entry}>
              <p className={styles.dates}>
                {current && <span className={styles.live} aria-hidden="true" />}
                {job.start} – {job.end}
                {current && <span className="visually-hidden"> (current role)</span>}
              </p>
              <div className={styles.who}>
                <h3 className={styles.company}>
                  {job.link ? (
                    <a href={job.link} target="_blank" rel="noopener noreferrer">
                      {job.company}
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    job.company
                  )}
                </h3>
                <p className={styles.role}>{job.role}</p>
              </div>
              <ul className={styles.points}>
                {job.points.map(point => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      <div className={styles.education}>
        <h3 className={styles.subtitle}>Education</h3>
        {education.map(item => (
          <div key={item.school} className={styles.entry}>
            <p className={styles.dates}>{item.end}</p>
            <div className={styles.who}>
              <p className={styles.company}>{item.school}</p>
              <p className={styles.role}>
                {item.degree}, {item.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
