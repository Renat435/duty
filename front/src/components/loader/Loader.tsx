import React from "react";
import style from "./style.module.scss";

const Loader: React.FC = () => {
    return (
        <div className={style.loader__wrapper}>
            <div className={style.loader}></div>
        </div>
    );
};

export default Loader;