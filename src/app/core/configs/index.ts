let API_URL;
switch (process.env.NODE_ENV) {
    //TODO : still need to specify FO URL to preview article in ticket MDP-610
    case 'production':
        API_URL = '{{API_URL}}';
        break;
    case 'testing':
    case 'development':
    case 'dev':
    default:
        API_URL = 'http://dev-api-load-balancer-1115137683.us-east-1.elb.amazonaws.com';
        break;
}

const cacheVersion = '10';
const siteName = 'Entertainment, schedule programs, celebrities, movies, serials, television programs - MBC.net';

const storageConfigs = {
    app: 'mbc_' + cacheVersion,
    page: 'page_' + cacheVersion
}

const getEndpoint = (endpoint: string) => {
    return API_URL + endpoint;
}

//debounceTime
const DEBOUNCE_TIME = 900;
const AUTO_SAVE_TIME = 5000;

export {
    getEndpoint,
    siteName,
    DEBOUNCE_TIME,
    AUTO_SAVE_TIME,

    storageConfigs
}
