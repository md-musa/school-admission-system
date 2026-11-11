import { useQuery } from "@tanstack/react-query"
import { getClasses } from "@/api/classApi"
import { QUERY_KEYS } from "@/lib/queryKeys"


export function useClasses() {
  return useQuery({
    queryKey: QUERY_KEYS.classes.all,
    queryFn: getClasses,
    staleTime: 0,              // always treat data as stale so interval refetches work
    refetchInterval: 5_000,    // poll every 5 seconds
    refetchOnWindowFocus: true,
  })
}
