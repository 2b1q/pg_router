/*
 * Create and exports configuration variables
 *
 * */

// Config container
const config = {};

// endPoints polymorphic curry function object instantiation
const service = type => {
    let names = {
        btc_rates: {
            host: "137.117.110.27",
            port: 8100,
            currencies: ["BTC", "LTC", "ETH", "BKX", "USD"],
            endpoint: "api/v1/"
        },
        btc_adapter: { host: "137.117.110.27", port: 8101, endpoint: "api/v1/" },
        ltc_adapter: { host: "137.117.110.27", port: 8102, endpoint: "api/v1/" }
    };
    // check if passed service name  exists
    let service = typeof names[type] == "undefined" ? undefined : names[type];
    return method => (typeof service == "undefined" ? "" : `http://${service.host}:${service.port}/${service.endpoint}${method}`);
};

/** Common config for all ENV */
const api_version = "v. 2.0",
    project = "BANKEX Payment-gateway-router",
    errors = {
        404: { errorCode: 404, errorMessage: "Not Found. Bad API URL" },
        401: { errorCode: 401, errorMessage: "SSO Authentication error. Bad Token" },
        409: { errorCode: 409, errorMessage: "Something went wrong during logout operation" }, //409 Conflict
        crash: err => Object({ errorCode: 500, errorMessage: err })
    };

// colorize console
const color = {
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    black: "\x1b[30m",
    red: "\x1b[31m",
    magenta: "\x1b[35m",
    white: "\x1b[37m"
};

/** Staging (default) environment */
config.staging = {
    node_types: ["btc", "ltc", "eth"],
    services: {
        btc_rates: service("btc_rates"),
        btc_adapter: service("btc_adapter"),
        ltc_adapter: service("ltc_adapter")
    },
    restricted_endpoints: [
        "address",
        "address/all",
        "address/new",
        "block",
        "block/hash",
        "rates",
        "rates/all",
        "account/new",
        "account/balance"
    ],
    restricted_services: ["ltc", "btc"], // restricted services
    api_version: api_version,
    errors: errors,
    project: project,
    /** ============= NEED TO BE SPECIFIED ============= */
    server: {
        port: 3006,
        ip: "0.0.0.0"
    },
    btc_main_net_server: {
        port: 8332
    },
    btc_test_net_server: {
        port: 18332
    },
    ltc_main_net_server: {
        port: 9332
    },
    ltc_test_net_server: {
        port: 19332
    },
    /** ============= NEED TO BE SPECIFIED ============= */
    store: {
        redis: {
            host: "redis", // redis server hostname
            port: 6379, // redis server port
            scope: "dev" // use scope to prevent sharing messages between "node redis rpc"
        },
        channel: {
            jrpc: wid => (typeof wid === "undefined" ? "pg_jrpc:" : "pg_jrpc:" + wid),
            auth: wid => (typeof wid === "undefined" ? "pg_auth:" : "pg_auth:" + wid),
            nm: wid => (typeof wid === "undefined" ? "pg_nm:" : "pg_nm:" + wid)
        }
    },
    color: color
};
/** END OF Staging (default) environment */

/** Production environment */
config.production = {};
/** END OF Production environment */

/** Dev environment */
config.dev = {
    node_types: ["btc", "ltc", "eth"],
    services: {
        btc_rates: service("btc_rates"),
        btc_adapter: service("btc_adapter"),
        ltc_adapter: service("ltc_adapter")
    },
    restricted_endpoints: [
        "address",
        "address/all",
        "address/new",
        "block",
        "block/hash",
        "rates",
        "rates/all",
        "account/new",
        "account/balance"
    ],
    restricted_services: ["ltc", "btc"], // restricted services
    api_version: api_version,
    errors: errors,
    project: project,
    /** ============= NEED TO BE SPECIFIED ============= */
    server: {
        port: 3006,
        ip: "0.0.0.0"
    },
    btc_main_net_server: {
        port: 8332
    },
    btc_test_net_server: {
        port: 18332
    },
    ltc_main_net_server: {
        port: 9332
    },
    ltc_test_net_server: {
        port: 19332
    },
    /** ============= NEED TO BE SPECIFIED ============= */
    store: {
        redis: {
            host: "redis", // redis server hostname
            port: 6379, // redis server port
            scope: "dev" // use scope to prevent sharing messages between "node redis rpc"
        },
        channel: {
            jrpc: wid => (typeof wid === "undefined" ? "pg_jrpc:" : "pg_jrpc:" + wid),
            auth: wid => (typeof wid === "undefined" ? "pg_auth:" : "pg_auth:" + wid),
            nm: wid => (typeof wid === "undefined" ? "pg_nm:" : "pg_nm:" + wid)
        }
    },
    color: color
};
/** END OF Dev environment */

// Determine passed ENV
const currentEnv = typeof process.env.NODE_ENV == "string" ? process.env.NODE_ENV.toLowerCase() : "";

// Check ENV to export (if ENV not passed => default ENV is 'staging')
const envToExport = typeof config[currentEnv] == "object" ? config[currentEnv] : config.staging;

// Exports config module
module.exports = envToExport;
