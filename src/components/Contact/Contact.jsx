'use client';

import { useId, useRef, useState } from 'react';
import SlingButton from '@/components/micro/SlingButton/SlingButton';
import { site } from '@/config/site';
import styles from './Contact.module.css';

const buildMailto = message => {
  const params = new URLSearchParams({ subject: 'Hello from your portfolio', body: message });
  // URLSearchParams encodes spaces as '+', which mail clients show literally.
  return `mailto:${site.email}?${params.toString().replace(/\+/g, '%20')}`;
};

export default function Contact() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const fieldRef = useRef(null);
  const fieldId = useId();
  const statusId = useId();

  const openEmail = () => {
    const text = message.trim();
    if (!text) {
      setStatus({ type: 'error', text: 'Write a message first, then launch it.' });
      fieldRef.current?.focus();
      return;
    }
    window.location.href = buildMailto(text);
    setStatus({
      type: 'info',
      text: 'Your email app should open with this message ready. It sends when you press send there.',
    });
  };

  return (
    <section id="contact" className={styles.contact} aria-labelledby="contact-title">
      <h2 id="contact-title" className={styles.title}>
        Start a conversation.
      </h2>

      <div className={styles.grid}>
        <div className={styles.composer}>
          <label htmlFor={fieldId} className={styles.label}>
            Your message
          </label>
          <div className={styles.field}>
            <textarea
              id={fieldId}
              ref={fieldRef}
              className={styles.textarea}
              rows={4}
              value={message}
              placeholder="A project, a role, or just a hello."
              aria-describedby={statusId}
              aria-invalid={status?.type === 'error' || undefined}
              onChange={e => {
                setMessage(e.target.value);
                if (status?.type === 'error') setStatus(null);
              }}
            />
            <div className={styles.launcher}>
              <SlingButton
                onSend={openEmail}
                ariaLabel="Open this message in your email app"
                padColor="#f4f1ea"
                iconColor="#120f17"
                accentColor="#67E8F9"
                wellColor="#1b1722"
                bandColor="#6f6a7a"
                size={56}
                strokeWidth={3}
                armAt={48}
                maxPull={160}
                launchSpeed={2600}
                recoil={0.2}
                flight={120}
                particles={14}
                spread={60}
                axis="any"
                tapSends
              />
            </div>
          </div>
          <p className={styles.help}>Tap the button, or pull it back and let go.</p>
          <p id={statusId} className={styles.status} data-type={status?.type} role="status">
            {status?.text}
          </p>
        </div>

        <div className={styles.direct}>
          <p className={styles.or}>Or write directly</p>
          <a className={styles.email} href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <ul className={styles.links}>
            {site.links.map(link => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
