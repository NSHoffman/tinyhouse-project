import { useState, useEffect, useCallback } from 'react';
import { server } from './server';

interface State<TData> {
  data: TData | null;
  isLoading: boolean;
  error: boolean;
}

export const useQuery = <TData = any>(query: string) => {
  const [state, setState] = useState<State<TData>>({
    data: null,
    isLoading: false,
    error: false,
  });

  const fetch = useCallback(() => 
  {
    const fetchApi = async () => {
      try 
      {
        setState({ data: null, isLoading: true, error: false });
        const { data, errors } = await server.fetch<TData>({ query });

        if (errors && errors.length) throw new Error(errors[0].message);
        setState({ data, isLoading: false, error: false });
      }

      catch (err) 
      {
        console.error(err);
        setState({ data: null, isLoading: false, error: true });
      }
    }
    fetchApi();
  }, [query]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    ...state,
    refetch: fetch,
  };
};