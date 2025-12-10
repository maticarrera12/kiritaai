import { useQuery } from "@tanstack/react-query";

async function fetchGamification() {
  const res = await fetch("/api/user/gamification");
  if (!res.ok) return null;
  return res.json();
}

export function useUserGamification(enabled = true) {
  return useQuery({
    queryKey: ["userGamification"],
    queryFn: fetchGamification,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
