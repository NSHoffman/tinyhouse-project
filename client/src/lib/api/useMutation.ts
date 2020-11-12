import { useState } from 'react';
import { server } from './server';

interface State<TData> {
  data: TData | null;
  isLoading: boolean;
  error: boolean;
}

type MutationTuple<TData, TVariables> = [
  (variables?: TVariables | undefined) => Promise<void>, 
  State<TData>
];

export const useMutation = <TData = any, TVariables = any>(
  query: string
): MutationTuple<TData, TVariables> => 
{
  const [state, setState] = useState<State<TData>>({
    data: null,
    isLoading: false,
    error: false,
  });

  const mutate = async (variables?: TVariables) => {
    try
    {
      setState({ data: null, isLoading: true, error: false });
      const { data, errors } = await server.fetch<TData, TVariables>({query, variables});

      if (errors && errors.length) throw new Error(errors[0].message);
      setState({ data, isLoading: false, error: false });
    }

    catch (err)
    {
      setState({ data: null, isLoading: false, error: true });
      console.error(err);
    }
  }

  return [mutate, state];
}