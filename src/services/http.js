const DEFAULT_TIMEOUT_MS = 10_000

export async function fetchWithTimeout(url, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { signal: controller.signal })
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('A consulta à API excedeu o tempo limite')
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}
