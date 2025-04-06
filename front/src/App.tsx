import {useKeycloak} from "@react-keycloak/web";
import Loader from "./components/loader/Loader.tsx";
import {lazy, Suspense, useEffect} from "react";
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";

const Main = lazy(() => import('./pages/main/MainPage.tsx'));

const router = createBrowserRouter([
    {
        path: '',
        element: <Main />,
    },
    {
        path: '*',
        element: <Navigate to="/" />
    }
]);

function App() {
    const { keycloak, initialized } = useKeycloak();

    useEffect(() => {
        if (initialized && !keycloak.authenticated) {
            keycloak.login();
        }
    }, [initialized, keycloak]);

    return (
        <Suspense fallback={<Loader />}>
            <RouterProvider router={router} />
        </Suspense>
    );
}

export default App;