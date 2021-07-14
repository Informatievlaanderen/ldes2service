import React, { useState } from 'react';
import { IConfigTemplate, IConnectorService } from '@ldes/types';
import { H1, H2, H3 } from '../../components/Headings';
import { Input, InputGroup, Label, Submit } from '../../components/Input';
import { Td, Th, Tr } from '../../components/Table';
import { TemplateConfigInput } from '../../components/TemplateConfigInput';
import { useUpdateService } from '../../hooks/api/useService';
import { DeleteService } from '../../components/DeleteService';
import CreatableSelect from 'react-select/creatable';
import { availableConnectors, ldesUris } from '../../hooks/api/data';
import { ActionMeta, OptionTypeBase, ValueType } from 'react-select';

type Props = {
  service: IConnectorService;
};

export function ServiceDetail(props: Props) {
  const { service } = props;

  const { mutateAsync } = useUpdateService();

  const [serviceProperties, setServiceProperties] = useState(service);
  const [serviceConfiguration, setServiceConfiguration] = useState(service.config);

  const template = availableConnectors[service.type];

  function onChange(e: any) {
    setServiceProperties({ ...serviceProperties, [e.target.name]: e.target.value });
  }

  function onSubmit(e: any) {
    e.preventDefault();

    return mutateAsync({ ...serviceProperties, ['config']: serviceConfiguration });
  }

  function handleChange(options: ValueType<OptionTypeBase, true>, action: ActionMeta<OptionTypeBase>) {
    return setServiceProperties({
      ...serviceProperties,
      orchestrators: options.map(option => ({
        id: new Date().toISOString(),
        ldes_uri: option.value,
        name: option.value,
        slug: option.value,
        polling_interval: 5000,
      })),
    });
  }

  return (
    <div>
      <H1>{service.name}</H1>

      <div className="mt-8">
        <H3>Configuration</H3>

        <form onSubmit={onSubmit}>
          <InputGroup>
            <Label htmlFor={'name'}>Name</Label>
            <Input id={'name'} name={'name'} onChange={onChange} value={serviceProperties.name} />
          </InputGroup>

          <InputGroup>
            <Label htmlFor={'type'}>Type</Label>
            <Input id={'type'} name={'name'} onChange={onChange} value={serviceProperties.type} disabled />
          </InputGroup>

          <InputGroup>
            <Label htmlFor={'image'}>Image</Label>
            <Input id={'image'} name={'image'} onChange={onChange} value={serviceProperties.image} disabled />
          </InputGroup>

          <InputGroup>
            <Label htmlFor={'port'}>Port</Label>
            <Input id={'port'} name={'port'} onChange={onChange} value={serviceProperties.port} />
          </InputGroup>

          {/* TODO this template is still static */}
          <TemplateConfigInput
            template={template}
            value={serviceConfiguration}
            onChange={setServiceConfiguration}
          />

          <InputGroup>
            <Label htmlFor={'ldes'}>LDES</Label>
            <CreatableSelect
              id="ldes"
              isMulti
              defaultValue={serviceProperties.orchestrators?.map(orchestrator => ({
                value: orchestrator.ldes_uri,
                label: orchestrator.ldes_uri,
              }))}
              options={ldesUris.map(uri => ({
                value: uri,
                label: uri,
              }))}
              onChange={handleChange}
            />{' '}
          </InputGroup>

          <div>
            <Submit value="save" />
          </div>
        </form>
      </div>

      <div className="mt-8">
        <H3>Event Streams attached to this service</H3>
        {service.orchestrators ? (
          <table className="w-full mt-2">
            <thead>
              <Tr>
                <Th>Name</Th>
                <Th>URL</Th>
              </Tr>
            </thead>
            <tbody>
              {service.orchestrators.map((orchestrator: any) => {
                return (
                  <Tr key={orchestrator.ldes_uri}>
                    <Td>{orchestrator.name}</Td>
                    <Td>
                      <a href={orchestrator.ldes_uri} target="_blank">
                        {orchestrator.ldes_uri}
                      </a>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No ldes attached</p>
        )}
      </div>
      <div className="mt-8">
        <H3>Advanced settings</H3>
        <div className="mt-2">
          <DeleteService service={service} />
        </div>
      </div>
    </div>
  );
}
