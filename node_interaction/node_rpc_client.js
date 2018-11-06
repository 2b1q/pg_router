const cfg = require("../config/config"),
    { nodes, api_version: API_VERSION, project, color: c } = cfg,
    moment = require("moment"),
    { Client } = require("bitcoin"),
    { node: auth } = require("../models/auth"), // auth module
    { api_requests: log_api, error: log_err } = require("../utils/logger")(module);

// empty response pattern
let empty = Object({ result: null, error: null, id: null });

// simple query logger
let logit = (req, msg = "") =>
    Object({
        msg: msg,
        api_version: API_VERSION,
        module: "address controller",
        project: project,
        req_headers: req.headers,
        post_params: req.body,
        get_params: req.query,
        timestamp: (() => moment())(), // UTC timestamp
        path: module.filename
            .split("/")
            .slice(-2)
            .join("/")
    });

/** common node request wrapper*/
const nodeRequester = (node_type, method, params) =>
    new Promise(resolve => {
        let cmd = Object([{ method: method, params: params }]);
        console.log("cmd: ", cmd);
        // define node type
        let con = typeof nodes[node_type] === "object" ? nodes[node_type] : undefined;
        // construct connection
        if (con) {
            // construct node client connection Object
            let client = new Client(con);
            client.cmd(cmd, (err, data) => {
                if (err) return resolve(empty);
                console.log(`${c.green}[${c.magenta}${node_type}${c.green}] node data: ${c.white}`, data);
                resolve({ result: data, error: null, id: null });
            });
        } else resolve(empty); // no config for this node_type
    });

// proxy client
exports.proxy = (req, res) => {
    // log req params
    log_api(logit(req));
    let { method, params } = req.body;
    console.log("method: ", method);
    console.log("params: ", params);

    let user, pass, node_type;
    let { authorization } = req.headers;
    if (authorization) {
        let Authorization = authorization.split(" ");
        /** Base64 decoder*/
        if (Authorization[0] === "Basic") {
            let buff = new Buffer(Authorization[1], "base64");
            let text = buff.toString("ascii");
            let up = text.split(":");
            let node_user = up[0].split("_"); // dispatch user and node_type
            node_type = node_user[0] || "btc";
            user = node_user[1];
            pass = up[1]; // dispatch pass
        }
    }
    // check node Authorization
    auth(user, pass, node_type)
        .then(async () => {
            console.log(
                `${c.green}[${c.magenta}${node_type}${c.green}] Get data for user: ${c.magenta}${user}${c.green}, pass: ${
                    c.magenta
                }${pass}${c.white}`
            );
            res.json(await nodeRequester(node_type, method, params));
        })
        .catch(e => {
            log_err(e);
            res.status(401).json({});
        });
};
