import { IConfigTemplate } from '@ldes/types';
import React from 'react';
import ReactDOM from 'react-dom';
import { Input, InputGroup, Label } from './Input';

type TemplateValue = {
  [k in string]: string;
};

interface Props {
  template: IConfigTemplate;
  value: TemplateValue;
  //onChange: () => TemplateValue;
  onChange: (x: any) => unknown;
}

export function TemplateConfigInput(props: Props) {
  const { template, value, onChange }: any = props;

  function handleChange(event: any) {
    onChange({
      ...value,
      [event.target.name]: event.target.value,
    });
  }

  return (
    <div>
      {template.fields.map((field: any) => {
        return (
          <div key={field.name}>
            <InputGroup>
              <Label htmlFor={field.name}>{field.name.replace('_', ' ')}</Label>
              <Input
                id={field.name}
                name={field.name}
                value={value[field.name] ?? field.value ?? ''}
                onChange={handleChange}
              />
            </InputGroup>
          </div>
        );
      })}
    </div>
  );
}
