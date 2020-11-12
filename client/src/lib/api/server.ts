interface Body<TArgs> {
  query: string;
  variables?: TArgs;
}

interface GQLError {
  message: string;
}


export const server = {

  fetch: async <TData = any, TArgs = any>(body: Body<TArgs>) => {
    const res = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('Failed to fetch data from the server');

    return res.json() as Promise<{ data: TData, errors?: GQLError[] }>;
  },
};