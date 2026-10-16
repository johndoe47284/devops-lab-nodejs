/**
 * Centralized Express error handler.
 * Ensures consistent JSON error shape across the API: { error: true, message }.
 * If headers were already sent, delegate to Express' default handler
 * (required by Express to avoid a broken response).
 */
export function errorHandler (err, _req, res, next) {
  if (res.headersSent) return next(err)
  const status = err?.status ?? 500
  const message = err?.message ?? 'Internal Server Error'
  res.status(status).json({ error: true, message })
}
