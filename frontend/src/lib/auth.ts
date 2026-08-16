export function getAuthRedirectUrl(): string {
  return `${window.location.origin}/`
}

export function hasOAuthCallbackParams(): boolean {
  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return (
    searchParams.has('code') ||
    hashParams.has('access_token') ||
    hashParams.has('error') ||
    searchParams.has('error')
  )
}

export function clearAuthParamsFromUrl(): void {
  window.history.replaceState({}, document.title, window.location.pathname)
}

export function parseAuthErrorFromUrl(): string | null {
  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))

  const error =
    searchParams.get('error_description') ??
    hashParams.get('error_description') ??
    searchParams.get('error') ??
    hashParams.get('error')

  if (!error) return null

  clearAuthParamsFromUrl()
  return error.replace(/\+/g, ' ')
}
