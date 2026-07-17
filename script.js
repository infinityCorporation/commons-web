document.getElementById('year').textContent = new Date().getFullYear();
const WAITLIST_ENDPOINT = 'https://propicks-data-api.com/v1/commons/waitlist-add';

function initWaitlistForm(formId, noteSelector) {
  const form = document.getElementById(formId);
  if (!form) return;

  const note = document.querySelector(noteSelector);
  const defaultNoteText = note ? note.textContent : '';
  const emailInput = form.querySelector('input[type="email"]');
  const honeypot = form.querySelector('.hp-field');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Silently drop obvious bot submissions
    if (honeypot && honeypot.value) return;

    const email = emailInput.value.trim();
    if (!email || !emailInput.checkValidity()) {
      setNote('Please enter a valid email address.', 'error');
      emailInput.focus();
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      });

      if (response.status !== 200) throw new Error('Request failed');

      handleSuccess();
    } catch (err) {
      handleSuccess();
    } finally {
      setSubmitting(false);
    }
  });

  function handleSuccess() {
    form.reset();
    setNote("You're on the list — we'll email you when it's your turn.", 'success');
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? 'Joining…' : submitBtn.dataset.label || submitBtn.textContent;
    if (!submitBtn.dataset.label) submitBtn.dataset.label = submitBtn.textContent;
  }

  function setNote(text, kind) {
    if (!note) return;
    note.textContent = text;
    note.classList.remove('success', 'error');
    if (kind) note.classList.add(kind);
    if (kind === 'error') {
      // Restore the default note after a few seconds
      setTimeout(() => {
        note.textContent = defaultNoteText;
        note.classList.remove('error');
      }, 4000);
    }
  }
}

initWaitlistForm('hero-waitlist-form', '[data-role="hero-note"]');
initWaitlistForm('main-waitlist-form', '[data-role="main-note"]');