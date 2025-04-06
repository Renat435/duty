import React from "react";
import style from './style.module.scss';

interface ButtonProps {
    text: string;
    theme?: 'default' | 'danger' | 'success';
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({text, theme = "default", onClick}) => {
    return (
        <button
            className={`${style.button} ${style[`button--${theme}`]}`}
            onClick={onClick}
        >{text}</button>
    );
};

export default Button;