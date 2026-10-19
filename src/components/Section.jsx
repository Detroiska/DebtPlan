export default function Section({ id, title, description, children }) {
  const titleId = `${id}-title`

  return (
    <section className="section" id={id} aria-labelledby={titleId}>
      <div className="section__header">
        <h2 className="section__title" id={titleId}>
          {title}
        </h2>
        {description ? <p className="section__description">{description}</p> : null}
      </div>
      <div className="section__body">{children}</div>
    </section>
  )
}