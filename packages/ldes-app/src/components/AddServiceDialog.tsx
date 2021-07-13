import { IConfigTemplate } from '@ldes/types';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog';
import '@reach/dialog/styles.css';
import VisuallyHidden from '@reach/visually-hidden';
import { TemplateConfigInput } from './TemplateConfigInput';
import { H2 } from './Headings';
import { Label, InputGroup, Textarea, Select } from './Input';

type TemplateValue = {
  [k in string]: string;
};

interface Props {}

export function AddServiceDialog(props: Props) {
  const [showDialog, setShowDialog] = React.useState(false);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

  const [selectedService, setSelectedService] = useState(0);
  const [serviceConfiguration, setServiceConfiguration] = useState({});

  const availableConnectors = [
    {
      name: 'elastic',
      fields: [
        {
          name: 'connection_string',
          validation: ['required', 'string'],
          value: 'elastic://[username]:[password@[host]:[port]',
        },
        {
          name: 'collection',
          validation: ['required', 'string'],
        },
        {
          name: 'some other field',
          validation: ['required', 'string'],
        },
      ],
    },
    {
      name: 'mongodb',
      fields: [
        {
          name: 'connection_string',
          validation: ['required', 'string'],
          value: 'mongodb://localhost:27017',
        },
        {
          name: 'collection',
          validation: ['required', 'string'],
        },
      ],
    },
  ];

  return (
    <div>
      <button onClick={open}>add service</button>

      <Dialog isOpen={showDialog} onDismiss={close}>
        <button className="close-button" onClick={close}>
          <span aria-hidden>×</span>
        </button>

        <H2>Add Service</H2>

        <InputGroup>
          <Label htmlFor={'availableServices'}>Choose service</Label>

          <Select id={'availableServices'} onChange={e => setSelectedService(parseInt(e.target.value))}>
            {availableConnectors.map((service, index) => {
              return <option value={index}>{service.name}</option>;
            })}
          </Select>
        </InputGroup>

        <InputGroup>
          <Label htmlFor={'ldes'}>Add LDES</Label>

          <Textarea id={'ldes'} />
          <p>Every LDES should be on a different line.</p>
        </InputGroup>

        <TemplateConfigInput
          template={availableConnectors[selectedService]}
          value={serviceConfiguration}
          onChange={setServiceConfiguration}
        />
      </Dialog>
    </div>
  );
}
