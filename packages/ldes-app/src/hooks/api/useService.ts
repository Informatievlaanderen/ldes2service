import { useMutation, useQuery } from 'react-query';
import { IConnectorService } from '@treecg/ldes-types';
import { useContext } from 'react';
import { AppContext } from '../../App';

export function useService(id: string) {
  const { connectors } = useContext(AppContext);

  return {
    data: connectors.find(connector => connector.id === id),
  };
}

export function useUpdateService() {
  const { setConnectors } = useContext(AppContext);

  // @ts-ignore
  return useMutation<unknown, unknown, IConnectorService, unknown>(connector => {
    setConnectors(co => {
      return [
        ...co.filter(c => c.id !== connector.id),
        {
          ...co.find(c => c.id === connector.id),
          ...connector,
        },
      ];
    });
  });
}

export function useAddService() {
  const { setConnectors } = useContext(AppContext);

  // @ts-ignore
  return useMutation<IConnectorService, unknown, IConnectorService, unknown>(connector => {
    const newConnector = {
      ...connector,
      id: new Date().toISOString(),
    };

    setConnectors(co => {
      return [...co, newConnector];
    });

    return newConnector;
  });
}

export function useDeleteService() {
  const { setConnectors } = useContext(AppContext);

  // @ts-ignore
  return useMutation<unknown, unknown, string, unknown>(id => {
    setConnectors(co => {
      return co.filter(c => c.id !== id);
    });
  });
}
