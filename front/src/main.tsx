import { createRoot } from 'react-dom/client'
import './styles/_reset.scss'
import './styles/_vars.scss'
import './styles/index.scss'
import App from './App.tsx'
import keycloak from "./Keycloak.ts";
import Loader from "./components/loader/Loader.tsx";
import {ReactKeycloakProvider} from "@react-keycloak/web";

createRoot(document.getElementById('root')!).render(
    <ReactKeycloakProvider
        authClient={keycloak}
        LoadingComponent={<Loader/>}
    >
        <App />
    </ReactKeycloakProvider>
)
