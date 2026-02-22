import { apiRequest, parseJwt } from "./client";

export async function loginApi(email, password) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  const token = data?.token;
  const payload = token ? parseJwt(token) : null;

  return {
    token,
    user_id: payload?.user_id,
    role: payload?.role,
    email,
  };
}

export async function registerApi({ email, password, role }) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: { email, password, role },
  });
}
