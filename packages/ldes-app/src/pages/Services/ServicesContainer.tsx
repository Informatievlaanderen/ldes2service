import React from 'react';
import { useServices } from '../../hooks/api/useServices';
import { Services } from './Services';

export function ServicesContainer() {
  const { data: services } = useServices();

  return <Services services={services || []} />;
}
