import { useContext } from 'react';
import { AppContext } from '../../App';

export function useServices() {
  const { connectors } = useContext(AppContext);

  return {
    data: connectors,
  };
}
