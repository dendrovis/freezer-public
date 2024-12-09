import React, { type InputHTMLAttributes } from 'react';
import Classes from './Input.module.scss';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = ({ onChange }: InputProps) => {
  return (
    <div className={Classes.container}>
      <input
        type={'url'}
        onChange={onChange}
        placeholder="insert your link here"
        className={Classes.input}
      />
    </div>
  );
};

export default Input;
