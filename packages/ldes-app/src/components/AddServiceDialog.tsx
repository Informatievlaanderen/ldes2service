import { IConnectorService } from '@treecg/ldes-types';
import React, { useState } from 'react';
import { Dialog } from '@reach/dialog';
import '@reach/dialog/styles.css';
import { TemplateConfigInput } from './TemplateConfigInput';
import { H2 } from './Headings';
import { Label, InputGroup, Select, Submit, Input } from './Input';
import { useAddService } from '../hooks/api/useService';
import { availableConnectors } from '../hooks/api/data';
import { useHistory } from 'react-router-dom';

export function AddServiceDialog() {
  const history = useHistory();
  const [showDialog, setShowDialog] = React.useState(false);

  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

  const { mutateAsync } = useAddService();

  const [selectedService, setSelectedService] = useState<string>('');
  const [serviceConfiguration, setServiceConfiguration] = useState({});
  const [serviceProperties, setServiceProperties] = useState<IConnectorService | null>(null);

  function onSubmit(e: any) {
    e.preventDefault();

    const connector: IConnectorService = {
      id: '',
      name: serviceProperties?.name || '',
      port: serviceProperties?.port || 0,
      type: availableConnectors[selectedService].name,
      image: availableConnectors[selectedService].type,
      config: serviceConfiguration,
    };

    mutateAsync(connector).then(newConnector => {
      setShowDialog(false);

      history.push(`/services/${newConnector.id}`);
    });
  }

  function onChange(e: any) {
    // @ts-ignore
    setServiceProperties({ ...serviceProperties, [e.target.name]: e.target.value });
  }

  return (
    <div>
      <button onClick={open}>Add a new service</button>

      <Dialog isOpen={showDialog} onDismiss={close} aria-label="Add Dialog">
        <button className="close-button" onClick={close}>
          <span aria-hidden>×</span>
        </button>

        <H2>Add Service</H2>
        <form onSubmit={onSubmit}>
          <div>
            <InputGroup>
              <Label htmlFor={'availableServices'}>Choose service</Label>

              <Select id={'availableServices'} onChange={e => setSelectedService(e.target.value)}>
                <option disabled={true} selected>
                  --
                </option>
                {Object.values(availableConnectors).map(service => {
                  return (
                    <option key={service.name} value={service.name}>
                      {service.name}
                    </option>
                  );
                })}
              </Select>
            </InputGroup>

            <InputGroup>
              <Label htmlFor={'name'}>Name</Label>
              <Input id={'name'} name={'name'} onChange={onChange} />
            </InputGroup>

            <InputGroup>
              <Label htmlFor={'port'}>Port</Label>
              <Input id={'port'} name={'port'} onChange={onChange} />
            </InputGroup>

            {selectedService && (
              <TemplateConfigInput
                template={availableConnectors[selectedService]}
                value={serviceConfiguration}
                onChange={setServiceConfiguration}
              />
            )}
          </div>

          <Submit value="save" />
        </form>
      </Dialog>
    </div>
  );
}
