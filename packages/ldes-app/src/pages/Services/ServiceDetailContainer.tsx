import React from 'react';
import { useService } from '../../hooks/api/useService';
import useParams from '../../hooks/useParams';
import { ServiceDetail } from './ServiceDetail';

export function ServiceDetailContainer() {
  const { id } = useParams();
  const { data: service } = useService(id);

  // TODO: return someting useful
  if (!service) {
    return null;
  }

  return <ServiceDetail service={service} />;
}
