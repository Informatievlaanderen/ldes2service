import { IConfigTemplate } from '@ldes/types';

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
    </div>
  );
}
