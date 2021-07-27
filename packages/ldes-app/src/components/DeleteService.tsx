import React from 'react';
import { useDeleteService } from '../hooks/api/useService';
import { IConnectorService } from '@ldes/types';
import { useHistory } from 'react-router-dom';
import { Submit } from './Input';

type Props = {
  service: IConnectorService;
};

export function DeleteService(props: Props) {
  const history = useHistory();
  const { mutateAsync } = useDeleteService();
  const { service } = props;

  function deleteService() {
    mutateAsync(service.id);

    history.push('/');
  }

  return <Submit onClick={deleteService} value="Delete" />;
}
