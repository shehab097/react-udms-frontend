export function getToken() {
  return localStorage.getItem("token");
}
export function getUsername() {
  return localStorage.getItem("username");
}
export function getRole() {
  return localStorage.getItem("role");
}

export function removeToken() {
  localStorage.removeItem("token");
  sessionStorage.clear();
}