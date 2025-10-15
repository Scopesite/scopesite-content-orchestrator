import axios from "axios";

const CS_BASE = "https://api.contentstudio.io/api/v1";
const CS_KEY = process.env.CONTENTSTUDIO_API_KEY;

if (!CS_KEY) {
  console.error("Missing CONTENTSTUDIO_API_KEY");
  process.exit(1);
}

export const cs = axios.create({
  baseURL: CS_BASE,
  headers: { "X-API-Key": CS_KEY, "Content-Type": "application/json" },
  timeout: 20000
});
