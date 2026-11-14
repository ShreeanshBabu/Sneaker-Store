const BASE_URL = import.meta.env.VITE_API_URL

export async function apiFetch(path, options = {}) {
    const headers = {}
    if (options.body) headers['Content-Type'] = 'application/json'

    const res = await fetch(`${BASE_URL}${path}`, {
    // 1. What option goes here so the browser sends the cookie?
    method: options.method || 'GET',
    credentials: "include",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    })

    // 2. Parse the response body as JSON.
    const data = await res.json().catch(() => ({}))

    // 3. fetch only rejects on network failure. It does NOT reject on 401, 404 or 409.
    //    What must you check here, and what should the function do with the
    //    backend's { error: '...' } message when the check fails?
    if (!res.ok) {
        throw new Error(data.error || data.message || `Request failed (${res.status})`)
    }

    return data
}