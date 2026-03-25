import useSWR, { useSWRConfig } from "swr";

const rootUrl = "https://notes-api.dicoding.dev/v1";
const accessTokenKey = "accessToken";

async function customFetch(path, { headers, ...moreOptions }) {
  const accessToken = localStorage.getItem(accessTokenKey);
  const response = await fetch(`${rootUrl}/${path}`, {
    ...moreOptions,
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      ...headers,
    },
  });
  const json = await response.json();
  if (!response.ok) {
    const error = new Error(json.message);
    error.statusCode = response.status;
    throw error;
  }
  return json.data;
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
    await postData("register", {
      email,
      name,
      password,
    });
}

export function useLoginUser() {
  const { mutate } = useSWRConfig();
  return async (email, password) => {
    const result = await postData("login", {
      email,
      password,
    });
    localStorage.setItem(accessTokenKey, result.accessToken);
    await mutate("users/me");
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
  } = useSWR("users/me", swrFetcher, {
    shouldRetryOnError: false,
    use: [loggedUserMiddleware],
  });
  return {
    user,
    mutate,
    ...rest,
    logout: async () => {
      localStorage.removeItem(accessTokenKey);
      await mutate();
    },
  };
}

export function useActiveNotes() {
  const { data, ...rest } = useSWR("notes", swrFetcher);
  return {
    notes: data,
    ...rest,
  };
}

export function useArchivedNotes() {
  const { data, ...rest } = useSWR("notes/archived", swrFetcher);
  return {
    notes: data,
    ...rest,
  };
}

export function useAddNote() {
  const { mutate } = useSWRConfig();
  return async (note) => {
    const result = await postData("notes", note);
    mutate("notes");
    return result;
  };
}

export function useNote(id) {
  const path = `notes/${id}`;
  const { data, ...rest } = useSWR(path, swrFetcher);
  const { mutate: mutateGlobal } = useSWRConfig();

  const noteChanged = async () => {
    await mutateGlobal((key) =>
      ["notes", "notes/archived", path].includes(key)
    );
  };

  return {
    note: data,
    ...rest,
    async archive() {
      await postData(`${path}/archive`);
      await noteChanged();
    },
    async unarchive() {
      await postData(`${path}/unarchive`);
      await noteChanged();
    },
    async remove() {
      await customFetch(path, { method: "DELETE" });
      await noteChanged();
    },
  };
}
