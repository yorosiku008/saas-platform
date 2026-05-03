import { api } from "./api"

export interface User {
  id: string
  email: string
  role: string
  org_id: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export async function register(email: string, password: string, orgName: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/register", { email, password, org_name: orgName })
  localStorage.setItem("access_token", data.access_token)
  return data
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/login", { email, password })
  localStorage.setItem("access_token", data.access_token)
  return data
}

export function logout(): void {
  localStorage.removeItem("access_token")
  window.location.href = "/login"
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/auth/me")
  return data
}
