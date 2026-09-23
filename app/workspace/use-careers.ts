"use client";

import { useEffect, useState } from "react";
import type { Career } from "./data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export function useCareers() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { void fetch(`${API_BASE_URL}/api/v1/careers`).then(async (response) => { if (!response.ok) throw new Error(); setCareers(await response.json() as Career[]); }).catch(() => setError("Không thể tải danh sách nghề.")); }, []);
  return { careers, error };
}
