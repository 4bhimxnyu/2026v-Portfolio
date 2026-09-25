'use client';

import { useId, useRef, useState } from 'react';
import SlingButton from '@/components/micro/SlingButton/SlingButton';
import ProfileCard from '@/components/cards/ProfileCard/ProfileCard';
import { site } from '@/config/site';
import styles from './Contact.module.css';

const buildMailto = message => {
  const params = new URLSearchParams({ subject: 'Hello from your portfolio', body: message });
  // URLSearchParams encodes spaces as '+', which mail clients show literally.
  return `mailto:${site.email}?${params.toString().replace(/\+/g, '%20')}`;
};

// Web3Forms emails each submission to the inbox the access key was created
// with. Keys are public by design (the form posts straight from the browser).
// The env var, if set, wins over the value in site.js.
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || site.web3formsKey;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendViaWeb3Forms({ name, email, message }) {
  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: `Portfolio message from ${name || email}`,
      from_name: 'Portfolio contact form',
      name: name || '(not given)',
      email, // becomes Reply-To, so replying goes straight to the visitor
      message,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.body?.message || result.message || `Request failed (${response.status})`);
  }
}

export default function Contact({ avatarUrl = '', miniAvatarUrl = '' }) {
  const direct = Boolean(WEB3FORMS_KEY);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const messageRef = useRef(null);
  const emailRef = useRef(null);
  const honeypotRef = useRef(null);
  const messageId = useId();
  const nameId = useId();
  const emailId = useId();
  const statusId = useId();

  // The card's "Contact Me" button leads straight to the form.
  const focusForm = () => {
    const target = direct && !email ? emailRef.current : messageRef.current;
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const fail = (text, field) => {
    setStatus({ type: 'error', text, field });
    (field === 'email' ? emailRef : messageRef).current?.focus();
  };

  const send = async () => {
    if (sending) return;
    const text = message.trim();
    if (!text) return fail('Write a message first, then launch it.', 'message');

    // No key configured: hand the message to the visitor's email app.
    if (!direct) {
      window.location.href = buildMailto(text);
      setStatus({
        type: 'info',
        text: 'Your email app should open with this message ready. It sends when you press send there.',
      });
      return;
    }

    const address = email.trim();
    if (!EMAIL_PATTERN.test(address)) return fail('Add your email address so I can write back.', 'email');

    // Bots tick every box, including this hidden one. People never see it.
    if (honeypotRef.current?.checked) return;

    setSending(true);
    setStatus({ type: 'info', text: 'Sending…' });
    try {
      await sendViaWeb3Forms({ name: name.trim(), email: address, message: text });
      setStatus({ type: 'success', text: `Sent. Thanks! I'll reply to ${address}.` });
      setMessage('');
    } catch {
      setStatus({ type: 'error', text: `That didn't send. Try again, or email me directly at ${site.email}.` });
    } finally {
      setSending(false);
    }
  };

  const clearError = () => {
    if (status?.type === 'error') setStatus(null);
  };

  return (
    <section id="contact" className={styles.contact} aria-labelledby="contact-title">
      <h2 id="contact-title" className={styles.title}>
        Start a conversation.
      </h2>

      <div className={styles.grid}>
        <div className={styles.main}>
          <form
            className={styles.composer}
            noValidate
            onSubmit={e => {
              e.preventDefault();
              send();
            }}
          >
            {direct && (
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label htmlFor={nameId} className={styles.label}>
                    Your name <span className={styles.optional}>(optional)</span>
                  </label>
                  <input
                    id={nameId}
                    className={styles.input}
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor={emailId} className={styles.label}>
                    Your email
                  </label>
                  <input
                    id={emailId}
                    ref={emailRef}
                    className={styles.input}
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    aria-describedby={statusId}
                    aria-invalid={status?.field === 'email' || undefined}
                    onChange={e => {
                      setEmail(e.target.value);
                      clearError();
                    }}
                  />
                </div>
              </div>
            )}

            <label htmlFor={messageId} className={styles.label}>
              Your message
            </label>
            <div className={styles.field}>
              <textarea
                id={messageId}
                ref={messageRef}
                className={styles.textarea}
                rows={4}
                value={message}
                placeholder="A project, a role, or just a hello."
                aria-describedby={statusId}
                aria-invalid={status?.field === 'message' || undefined}
                onChange={e => {
                  setMessage(e.target.value);
                  clearError();
                }}
              />
              <div className={styles.launcher}>
                <SlingButton
                  onSend={send}
                  disabled={sending}
                  ariaLabel={direct ? 'Send message' : 'Open this message in your email app'}
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

            {/* Lets Enter in the name/email fields submit the form (a form with two
                text inputs needs a submit button for that). The sling is the visible send. */}
            <button type="submit" className="visually-hidden" tabIndex={-1} aria-hidden="true">
              Send
            </button>
            <input
              ref={honeypotRef}
              type="checkbox"
              name="botcheck"
              className={styles.honeypot}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <p className={styles.help}>Tap the button, or pull it back and let go.</p>
            <p id={statusId} className={styles.status} data-type={status?.type} role="status">
              {status?.text}
            </p>
          </form>

          <div className={styles.direct}>
            <p className={styles.or}>Or write directly</p>
            <a className={styles.email} href={`mailto:${site.email}`}>
              {/* Long address: allow a clean break before the @ on narrow screens. */}
              {site.email.split('@')[0]}
              <wbr />@{site.email.split('@')[1]}
            </a>
            <ul className={styles.links} aria-label="Profiles">
              {site.links.map(link => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.card}>
          <ProfileCard
            name={site.name}
            title={site.role}
            handle={site.handle}
            status={site.status}
            contactText="Contact Me"
            avatarUrl={avatarUrl}
            miniAvatarUrl={miniAvatarUrl || undefined}
            showUserInfo
            enableTilt
            enableMobileTilt={false}
            onContactClick={focusForm}
            iconUrl="/images/card-pattern.svg"
            behindGlowEnabled
            innerGradient="linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)"
          />
        </div>
      </div>
    </section>
  );
}
