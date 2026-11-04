import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export function PageHeading({ children, documentTitle }) {
  const headingRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = documentTitle
    window.scrollTo({ top: 0, behavior: 'auto' })
    headingRef.current?.focus({ preventScroll: true })
  }, [documentTitle, pathname])

  return (
    <h1 className="route-page__title" ref={headingRef} tabIndex={-1}>
      {children}
    </h1>
  )
}