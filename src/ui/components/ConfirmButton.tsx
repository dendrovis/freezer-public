import React, { ButtonHTMLAttributes } from 'react';
import Classes from './ConfirmButton.module.scss';

type ConfirmButtonPorps = ButtonHTMLAttributes<HTMLButtonElement>;

const ConfirmButton = ({ onClick }: ConfirmButtonPorps) => {
  return (
    <div className={Classes.container}>
      <button onClick={onClick} className={Classes.button}>
        <svg
          width="18"
          height="13"
          viewBox="0 0 18 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.55001 13L0.850006 7.30001L2.27501 5.87501L6.55001 10.15L15.725 0.975006L17.15 2.40001L6.55001 13Z"
            fill="#75FB4C"
          />
        </svg>
      </button>
    </div>
  );
};

export default ConfirmButton;
