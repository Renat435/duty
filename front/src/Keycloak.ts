import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: "https://auth.acqproject.com/",
    realm: "mon",
    clientId: "mon_service",
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;