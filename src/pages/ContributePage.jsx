import { CONTACT_EMAIL } from '../config.js'

// V1 has no uploads: the form builds a pre-filled email and the contributor
// attaches their photo in their own mail app.
function buildMailto(form) {
  const field = (name) => form.elements[name].value.trim()
  const subject = `Photo submission: ${field('location')}`
  const body = [
    `Name: ${field('name')}`,
    `Location: ${field('location')}`,
    `Year: ${field('year')}`,
    `Credit / source: ${field('credit')}`,
    '',
    'Description:',
    field('description'),
    '',
    '(Please attach your photo to this email.)',
  ].join('\n')
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export default function ContributePage() {
  function handleSubmit(e) {
    e.preventDefault()
    window.location.href = buildMailto(e.currentTarget)
  }

  return (
    <div className="page page--narrow">
      <h1>Contribute a photo</h1>
      <p className="lead">
        Have an old photo of Halifax? Fill this in and we'll open an email for
        you; attach the photo and send. Please only send photos you took
        yourself or have permission to share.
      </p>

      <form className="contribute-form" onSubmit={handleSubmit}>
        <label>
          Your name
          <input type="text" name="name" />
        </label>
        <label>
          Where was it taken? <span className="hint">(street, intersection or landmark)</span>
          <input type="text" name="location" required />
        </label>
        <label>
          Roughly what year?
          <input type="text" name="year" placeholder="e.g. 1955 or 1950s" />
        </label>
        <label>
          Description
          <textarea name="description" rows="4" />
        </label>
        <label>
          Source / credit
          <input type="text" name="credit" placeholder="e.g. family photo, archive name" />
        </label>
        <button type="submit" className="button button--primary">Open email</button>
      </form>

      <p className="notice">
        Email not opening? Send your photo and details to{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </div>
  )
}
