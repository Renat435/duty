import style from "./style.module.scss";
import Calendar from "../../components/calendar/Calendar.tsx";
import React, {useEffect, useState} from "react";
import {useKeycloak} from "@react-keycloak/web";
import {type User} from "../../api/user.ts";
import Loader from "../../components/loader/Loader.tsx";

const MainPage: React.FC = () => {
    const { keycloak } = useKeycloak();
    const [user, setUser] = useState<null | User>(null);

    async function getUserHandler() {
        const userInfo = await keycloak.loadUserInfo();
        const {name, preferred_username} = userInfo as {
            name: string
            preferred_username: string
        };

        setUser({
            id: preferred_username,
            name: name,
        });
    }

    useEffect(() => {
        getUserHandler();
    }, [])

    if (!user) {
        return (
            <Loader/>
        );
    }

    return (
        <div className={style.wrapper}>
            <div className={style.header}>
                <h3 className={style.title}>Duty calendar</h3>
            </div>
            <Calendar user={user}/>
        </div>
    );
}

export default MainPage;