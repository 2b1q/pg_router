const express = require("express"),
    { id: wid } = require("cluster").worker, // access to cluster.worker.id
    http = require("http"),
    bodyParser = require("body-parser"),
    jrpc = require("../controllers/rpc/v1/rpc_json-rpc_proxy"), // RPC interaction with PG_JSON-RPC
    { getBestNode } = require("../controllers/rpc/v1/rpc_node_manager"), // RPC interaction with PG_node_manager
    { setRes } = require("../modules/rpc"), // set response object to RPC module
    cfg = require("../config/config"),
    c = cfg.color,
    env = process.env.NODE_ENV;

/*
 * require applications ports
 * port1 - HTTP REST API
 *   > direct proxying to adapters endpoints (AUTH required)
 *   > AUTH (RPC service)
 *   > reg user (RPC service)
 *   > helpers proxy
 * port2 - HTTP JSON-RPC
 *   > BTC main-net JSON-RPC proxy (RPC with pg_jrpc service)(AUTH not required)
 *   > best node lookup (RPC service - pg_nm)
 * port3 - HTTP JSON-RPC
 *   > LTC main-net JSON-RPC proxy (RPC with pg_jrpc service)(AUTH not required)
 *   > best node lookup (RPC service - pg_nm)
 * port4 - HTTP JSON-RPC
 *   > BTC test-net JSON-RPC proxy (RPC with pg_jrpc service)(AUTH not required)
 *   > best node lookup (RPC service - pg_nm)
 * port5 - HTTP JSON-RPC
 *   > LTC test-net JSON-RPC proxy (RPC with pg_jrpc service)(AUTH not required)
 *   > best node lookup (RPC service - pg_nm)
 * */
const {
    server: { port: port1 }, // HTTP REST API
    btc_main_net_server: { port: port2 }, // JSON-RPC BTC main-net
    ltc_main_net_server: { port: port3 }, // JSON-RPC LTC main-net
    btc_test_net_server: { port: port4 },
    ltc_test_net_server: { port: port5 }
} = cfg;

// Normalize a port into a number, string, or false
function normalizePort(val) {
    let p = parseInt(val, 10);
    if (p >= 0) return p; // port number
    if (isNaN(p)) return val; // named pipe
    return false;
}
/**
 * init HTTP servers
 */
const restAppPort = normalizePort(port1); // HTTP REST API server port
const btcAppPort = normalizePort(port2); // HTTP JSON-RPC BTC-MAIN net SRV port
const ltcAppPort = normalizePort(port3); // HTTP JSON-RPC LTC-MAIN net SRV port
/** init express frameworks */
const app1 = express();
const app2 = express();
const app3 = express();

/**
 * configure express APP1 stack restAppPort
 * */
app1.use(bodyParser.json({ type: req => true })) // parse any Content-type as json
    .use(bodyParser.urlencoded({ extended: false }))
    // handle JSON parse error
    .use((err, req, res, next) => (err ? res.status(400).json({ error: "invalid json" }) : next()))
    .use((req, res, next) => {
        if (env !== "production") {
            console.log(`${c.green}WORKER[${c.cyan}${wid}${c.green}]${c.white}`);
            console.log(c.green, "req headers\n", c.white, req.headers);
            console.log(c.green, "req query\n", c.white, req.query);
            console.log(c.green, "req body\n", c.white, req.body);
            console.log(c.green, "req.url: ", c.white, req.url);
        }
        res.removeHeader("X-Powered-By"); // drop "X-Powered-By" header
        next();
    })
    .use("/api", require("../routes/services")) // attach API router
    .use((req, res) => res.status(404).json(cfg.errors["404"])) // Last ROUTE catch 404 and forward to error handler
    // error handler
    .use((err, req, res) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = env === "string" || env === "dev" ? err : {};
        res.status(err.status || 500);
        res.json(cfg.errors.crash(err));
        console.error(err.message);
    })
    .set("port", cfg.server.ip + ":" + restAppPort); // set HTTP server port

/**
 * configure express APP2 stack btcAppPort
 * */
app2.use(bodyParser.json({ type: req => true })) // parse any Content-type as json
    .use(bodyParser.urlencoded({ extended: false }))
    // handle JSON parse error
    .use((err, req, res, next) => (err ? res.status(400).json({ error: "invalid json" }) : next()))
    .use((req, res, next) => {
        if (env !== "production") {
            console.log(`${c.green}WORKER[${c.cyan}${wid}${c.green}]${c.white}`);
            console.log(c.green, "req headers\n", c.white, req.headers);
            console.log(c.green, "req query\n", c.white, req.query);
            console.log(c.green, "req body\n", c.white, req.body);
            console.log(c.green, "req.url: ", c.white, req.url);
        }
        res.removeHeader("X-Powered-By"); // drop "X-Powered-By" header
        next();
    })
    // proxying node-RPC requests
    .use(async (req, res, next) => {
        let { jsonrpc } = req.body;
        if (!jsonrpc) next();
        let type = "btc";
        setRes(res); // set response object for RPC response service timeOut error
        try {
            var cfg = await getBestNode(type); // request node config from NodeManager service by RedisRPC
        } catch (e) {
            return res.json({ error: e, result: null, id: null });
        }
        jrpc.emit({ ...req.body, node_type: type, config: cfg }, res);
    })
    .use((req, res) => res.status(404).json(cfg.errors["404"])) // Last ROUTE catch 404 and forward to error handler
    // error handler
    .use((err, req, res) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = env === "string" || env === "dev" ? err : {};
        res.status(err.status || 500);
        res.json(cfg.errors.crash(err));
        console.error(err.message);
    })
    .set("port", cfg.server.ip + ":" + btcAppPort); // set HTTP server port

/**
 * configure express APP3 stack ltcAppPort
 * */
app3.use(bodyParser.json({ type: req => true })) // parse any Content-type as json
    .use(bodyParser.urlencoded({ extended: false }))
    // handle JSON parse error
    .use((err, req, res, next) => (err ? res.status(400).json({ error: "invalid json" }) : next()))
    .use((req, res, next) => {
        if (env !== "production") {
            console.log(`${c.green}WORKER[${c.cyan}${wid}${c.green}]${c.white}`);
            console.log(c.green, "req headers\n", c.white, req.headers);
            console.log(c.green, "req query\n", c.white, req.query);
            console.log(c.green, "req body\n", c.white, req.body);
            console.log(c.green, "req.url: ", c.white, req.url);
        }
        res.removeHeader("X-Powered-By"); // drop "X-Powered-By" header
        next();
    })
    // proxying node-RPC requests
    .use(async (req, res, next) => {
        let { jsonrpc } = req.body;
        if (!jsonrpc) next();
        let type = "ltc";
        setRes(res); // set response object for RPC response service timeOut error
        try {
            var cfg = await getBestNode(type); // request node config from NodeManager service by RedisRPC
        } catch (e) {
            return res.json({ error: e, result: null, id: null });
        }
        jrpc.emit({ ...req.body, node_type: type, config: cfg }, res);
    })
    .use((req, res) => res.status(404).json(cfg.errors["404"])) // Last ROUTE catch 404 and forward to error handler
    // error handler
    .use((err, req, res) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = env === "string" || env === "dev" ? err : {};
        res.status(err.status || 500);
        res.json(cfg.errors.crash(err));
        console.error(err.message);
    })
    .set("port", cfg.server.ip + ":" + ltcAppPort); // set HTTP server port

/** Create HTTP servers */
const server1 = http.createServer(app1); // create HTTP server for REST API requests
const server2 = http.createServer(app2); // create HTTP server for JSON-RPC requests
const server3 = http.createServer(app3); // create HTTP server for JSON-RPC requests
server1.listen(restAppPort); // Listen Node server on provided port
server2.listen(btcAppPort); // Listen Node server on provided port
server3.listen(ltcAppPort); // Listen Node server on provided port

/** Server1 events ['error', 'listening'] handler */
server1
    .on("error", error => {
        if (error.syscall !== "listen") throw error;
        let addr = server1.address();
        let bind = typeof addr === "string" ? "pipe " + addr : addr.port;
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case "EADDRINUSE":
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }) // server event hanlers 'on.error'
    .on("listening", () => {
        let addr = server1.address();
        let bind = typeof addr === "string" ? "pipe " + addr : addr.port;
        console.log(`${c.cyan}WORKER[${wid}] ${c.yellow}REST API ${c.cyan}server listen port ${c.yellow}${bind}${c.white}`);
    });

/** Server2 events ['error', 'listening'] handler */
server2
    .on("error", error => {
        if (error.syscall !== "listen") throw error;
        let addr = server2.address();
        let bind = typeof addr === "string" ? "pipe " + addr : addr.port;
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case "EADDRINUSE":
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }) // server event handlers 'on.error'
    .on("listening", () => {
        let addr = server2.address();
        let bind = typeof addr === "string" ? "pipe " + addr : addr.port;
        console.log(
            `${c.cyan}WORKER[${wid}] ${c.magenta}JSON-RPC BTC MAIN net ${c.cyan}server proxy listen port ${c.yellow}${bind}${c.white}`
        );
    });

/** Server3 events ['error', 'listening'] handler */
server3
    .on("error", error => {
        if (error.syscall !== "listen") throw error;
        let addr = server3.address();
        let bind = typeof addr === "string" ? "pipe " + addr : addr.port;
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case "EADDRINUSE":
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }) // server event handlers 'on.error'
    .on("listening", () => {
        let addr = server3.address();
        let bind = typeof addr === "string" ? "pipe " + addr : addr.port;
        console.log(
            `${c.cyan}WORKER[${wid}] ${c.magenta}JSON-RPC LTC MAIN net ${c.cyan}server proxy listen port ${c.yellow}${bind}${c.white}`
        );
    });
