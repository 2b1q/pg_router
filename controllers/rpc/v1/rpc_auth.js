/*
 * REST controller
 * AUTH check (RPC)
 * regNew user (RPC)
 * */
const moment = require("moment"),
    { project, api_version: API_VERSION, color: c, store } = require("../../../config/config"),
    { redis: redis_cfg, channel } = store,
    rpc = require("../../../modules/rpc"), // RPC wrapper
    { api_requests: log_api, error: log_err } = require("../../../utils/logger")(module),
    cluster = require("cluster"),
    // { newUser, checkAuth: auth } = require("../../../modules/auth/v1/auth"), // auth module
    check = require("../../../utils/checker").cheker();

// current module
const _module_ = "REST API Auth controller";
// cluster.worker.id
const wid = cluster.worker.id;
// worker id pattern
const wid_ptrn = endpoint =>
    `${c.green}worker[${wid}]${c.yellow}[${API_VERSION}]${c.cyan}[${_module_}]${c.red} > ${c.green}[${endpoint}] ${c.white}`;
const wid_err_ptrn = endpoint =>
    `${c.green}worker[${wid}]${c.yellow}[${API_VERSION}]${c.cyan}[${_module_}]
${c.red}[ERROR] ${endpoint}] ${c.white}`;
// simple query logger
let logit = (req, msg = "") =>
    Object({
        msg: msg,
        api_version: API_VERSION,
        module: "AUTH API controller",
        project: project,
        post_params: req.body,
        get_params: req.query,
        url_pathL: req.url,
        timestamp: (() => moment())(),
        path: module.filename
            .split("/")
            .slice(-2)
            .join("/")
    });

// setup RPC channel
const node_rpc_channel = channel.auth("master"); // connect to master channel
// init RPC channel
rpc.init(node_rpc_channel);
// emit controller pass payload to rpc model
exports.emit = payload => {
    console.log(wid_ptrn("emit payload"));
    rpc.emit(node_rpc_channel, payload);
};
exports.setRes = res => rpc.setRes(res); // need for NM AUTH requests

/**
 * Check Auth for REST request (not JSON-RPC)
 * */
exports.checkAuth = req =>
    new Promise(async (resolve, reject) => {
        console.log(wid_ptrn("checkAuth"));
        // log req params
        log_api(logit(req));
        // dispatch user creds sync
        try {
            var { user, pass } = await check.get_creds(req.headers, { rpc: false });
        } catch (e) {
            log_err(e);
            return reject(e);
        }
        // emit RPC to AUTH service => 'auth' method
        console.log(wid_ptrn("emit payload"));
        let payload = {
            method: "auth",
            user,
            pass
        };

        /*
         * RPC emitter
         * arg1 - channel
         * arg2 - payload
         * arg3 - callback
         *  */
        rpc.emit(node_rpc_channel, payload, (err, data) => {
            console.log(wid_ptrn("got RPC callback"));
            rpc.setRes(null); // clear res object
            if (err) return reject(err);
            console.log(data);
            resolve(data);
        });
    });

/**
 * Reg new user
 * OR
 * Get current JWT (access + refresh) if user exists
 * */
exports.regUser = async (req, res) => {
    console.log(wid_ptrn("regUser"));
    // log req params
    log_api(logit(req));
    // dispatch user creds sync
    try {
        var { user, pass } = await check.get_creds(req.headers, { rpc: false });
    } catch (e) {
        log_err(e);
        return res.status(401).json(e);
    }
    console.log(`${c.green}regUser: ${c.magenta}${user}${c.green} pass: ${c.magenta}${pass}${c.green}${c.white}`);
    // set response object to RPC module (RPC for timeout handler)
    rpc.setRes(res);
    // emit RPC to AUTH service => 'regUser' method
    console.log(wid_ptrn("emit payload"));
    let payload = {
        method: "regUser",
        user,
        pass
    };

    /*
     * RPC emitter
     * arg1 - channel
     * arg2 - payload
     * arg3 - callback
     *  */
    rpc.emit(node_rpc_channel, payload, (err, data) => {
        console.log(wid_ptrn("got RPC callback"));
        rpc.setRes(null); // clear res object
        if (err) return res.status(401).json(err);
        console.log(data);
        res.json(data);
    });
};

/**
 * LOGOUT user by JWT
 * */
// exports.logout = async (req, res) => {
//     console.log(`${wid_ptrn("logout")}`);
//     let token = getToken(req);
//     if (token.hasOwnProperty("errorCode")) return res.status(401).json(token);
//     // check AUTH token
//     try {
//         // res.set('Authorization', 'Bearer ' + jwt_access_token).json(jwt_access_token);
//         let response = await jwt.ssoLogout(token);
//         if (response.hasOwnProperty("errorCode")) return res.status(response.errorCode).json(response);
//         res.json({ status: "OK", msg: response });
//     } catch (e) {
//         res.status(401).json(e);
//     }
// };
