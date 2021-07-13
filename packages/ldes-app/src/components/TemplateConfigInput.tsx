import { IConfigTemplate } from '@ldes/types';
import { InputGroup, Label, Input} from './Input';

type TemplateValue = {
  [k in string]: string;
};

interface Props {
  template: IConfigTemplate;
  value: TemplateValue;
  onChange: () => TemplateValue;
}

export function TemplateConfigInput(props: Props) {
  const { template, value, onChange } = props;

  return (
    <div>
      Generate all fields from the template, and add the value to it. When one of the fields change, call the
      onChange callback.

      {template.fields.map((field)=> {
        return <div key={field.name}>
          <InputGroup>
            <Label htmlFor={field.name}>{field.name.replace('_',' ')}</Label>
            <Input id={field.name} name={field.name} value={value[field.name] ?? field.value ?? ""} onChange={handleChange}/>
          </InputGroup>
        </div>
      })}
    </div>
  );
}
