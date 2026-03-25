import { useSearchParams } from "react-router-dom";

export function buildSearchParam(query) {
  if (query.length == 0) return {};
  return {
    q: query,
  };
}

export function useSearchQuery() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const setQuery = (newQuery) => setParams(buildSearchParam(newQuery));

  return [query, setQuery];
}
