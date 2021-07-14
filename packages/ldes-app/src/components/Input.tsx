import React from 'react';
import c from '../utils/c';

type InputGroupProps = {
  className?: string;
  children: React.ReactNode;
};

type LabelProps = JSX.IntrinsicElements['label'] & {
  htmlFor: string;
};

type InputProps = JSX.IntrinsicElements['input'] & {
  id: string;
};

type TextareaProps = JSX.IntrinsicElements['textarea'] & {
  id: string;
};

type SelectProps = JSX.IntrinsicElements['select'] & {
  id: string;
};

type SubmitProps = JSX.IntrinsicElements['input'] & {};

export const InputGroup = (props: InputGroupProps) => {
  const { className, children } = props;

  return <div className={c(className, 'flex flex-col mb-3')}>{children}</div>;
};

export const Label = (props: LabelProps) => {
  return <label className={c('w-full mb-1', props.className)} {...props} />;
};

export const Input = (props: InputProps) => {
  const { type = 'text', className, disabled, ...rest } = props;

  return (
    <input
      type={type}
      className={c('w-full py-1 px-2', className, disabled && 'bg-gray-100 cursor-not-allowed')}
      disabled={disabled}
      {...rest}
    />
  );
};

export const Textarea = (props: TextareaProps) => {
  const { className } = props;

  return <textarea className={c(props.className, 'w-full py-1 px-2')}></textarea>;
};

export const Select = (props: SelectProps) => {
  const { className, children, ...rest } = props;

  return (
    <select className={c('', props.className)} {...rest}>
      {children}
    </select>
  );
};

export const Submit = (props: SubmitProps) => {
  const { className, ...rest } = props;

  return (
    <input
      type="submit"
      className={c(
        'py-1 px-2 cursor-pointer bg-gray-100 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors duration-200',
        props.className
      )}
      {...rest}
    />
  );
};
