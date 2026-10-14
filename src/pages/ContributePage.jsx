import { useState } from 'react'
import { CONTACT_EMAIL } from '../config.js'

// Placeholder: V1 has no uploads. This form will build a pre-filled email
// (mailto:) once the contact address is set; for now it only shows a notice.
export default function ContributePage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="page page--narrow">
      <h1>Contribute a photo</h1>
      <p className="lead">
        Have an old photo of Halifax? Tell us about it and email it in. Please
        only send photos you took yourself or have permission to share.
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
        <button type="submit" className="button button--primary">Prepare email</button>
      </form>

      {submitted && (
        <p className="notice" role="status">
          Email submissions aren't live yet. In the meantime, send your photo
          and details to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      )}
    </div>
  )
}
