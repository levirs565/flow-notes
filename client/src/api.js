import useSWR, { useSWRConfig } from "swr";

const rootUrl = "/api";

async function customFetch(path, { headers, ...moreOptions }) {
  const response = await fetch(`${rootUrl}/${path}`, {
    ...moreOptions,
    headers: headers,
    credentials: "include",
  });
  const json = await response.json();
  if (!response.ok) {
    const error = new Error(json.message);
    error.statusCode = response.status;
    throw error;
  }
  return json;
}

async function swrFetcher(path) {
  return customFetch(path, {});
}

function postData(path, data) {
  return customFetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export function useRegisterUser() {
  return async (name, email, password) =>
    await postData("auth/register", {
      email,
      name,
      password,
    });
}

export function useLoginUser() {
  const { mutate } = useSWRConfig();
  return async (email, password) => {
    await postData("auth/login", {
      email,
      password,
    });
    await mutate("auth/state");
  };
}

function loggedUserMiddleware(useSWRNext) {
  return (key, fetcher, config) => {
    const extendedFetcher = async (...args) => {
      try {
        return await fetcher(...args);
      } catch (e) {
        if (e.statusCode === 401) {
          return null;
        }
        throw e;
      }
    };
    return useSWRNext(key, extendedFetcher, config);
  };
}

export function useLoggedUser() {
  const {
    data: user,
    mutate,
    ...rest
  } = useSWR("auth/state", swrFetcher, {
    shouldRetryOnError: false,
    use: [loggedUserMiddleware],
  });
  return {
    user,
    mutate,
    ...rest,
    logout: async () => {
      await postData("auth/logout");
      await mutate();
    },
  };
}

export function useActiveNotes(query) {
  const params = new URLSearchParams({
    q: query,
  });
  const { data, ...rest } = useSWR("notes?" + params, swrFetcher);
  return {
    notes: data,
    ...rest,
  };
}

export function useArchivedNotes(query) {
  const params = new URLSearchParams({
    archived: true,
    q: query,
  });
  const { data, ...rest } = useSWR("notes?" + params, swrFetcher);
  return {
    notes: data,
    ...rest,
  };
}

export function useAddNote() {
  const { mutate } = useSWRConfig();
  return async (note) => {
    const result = await postData("notes", note);
    mutate(isNotesKey);
    return result;
  };
}

function isNotesKey(key) {
  return key.startsWith("notes?");
}

function patchArchive(id, archived) {
  return customFetch(`notes/${id}/archive`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ archived }),
  });
}

export function useNote(id) {
  const path = `notes/${id}`;
  const { data, ...rest } = useSWR(path, swrFetcher);
  const { mutate: mutateGlobal } = useSWRConfig();

  const noteChanged = async () => {
    await mutateGlobal((key) => path == key || isNotesKey(key));
  };

  return {
    note: data,
    ...rest,
    async archive() {
      await patchArchive(id, true);
      await noteChanged();
    },
    async unarchive() {
      await patchArchive(id, false);
      await noteChanged();
    },
    async remove() {
      await customFetch(path, { method: "DELETE" });
      await noteChanged();
    },
  };
}
