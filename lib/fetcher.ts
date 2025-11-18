export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = options.headers ? {...(options.headers as any)} : {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {...options, headers});
  const json = await res.json().catch(()=>({}));
  return { ok: res.ok, status: res.status, data: json };
}
