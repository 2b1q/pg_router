/*
* REST controller
* AUTH check
* regNew user
* */
const moment = require("moment"),
    { project, api_version: API_VERSION, color: c } = require("../../../config/config"),
    { api_requests: log_api, error: log_err } = require("../../../utils/logger")(module),
    cluster = require("cluster"),
    { newUser, checkAuth: auth } = require("../../../models/auth"), // auth module
    check = require("../../../utils/checker").cheker();

// current module
const _module_ = "REST API Auth controller";
// cluster.worker.id
const wid = cluster.worker.id;

// worker id pattern
const wid_ptrn = endpoint =>
    `${c.green}worker[${wid}]${c.red}[AUTH]${c.yellow}[${API_VERSION}]${c.cyan}[${_module_}]${c.red} > ${c.green}[${endpoint}] ${c.white}`;

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

/**
 * Check Auth for REST request (not JSON-RPC)
 * */
exports.checkAuth = req =>
    new Promise(async (resolve, reject) => {
        console.log(`${wid_ptrn("checkAuth")}`);
        // log req params
        log_api(logit(req));
        // dispatch user creds sync
        try {
            var { user, pass } = await check.get_creds(req.headers, { rpc: false });
        } catch (e) {
            log_err(e);
            return reject(e);
        }
        // check AUTH and resolve or reject
        auth(user, pass)
            .then(msg => resolve(msg))
            .catch(err => reject(err));
    });

/**
 * Reg new user
 * OR
 * Get current JWT (access + refresh) if user exists
 * */
exports.regUser = async (req, res) => {
    console.log(`${wid_ptrn("regUser")}`);
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
    // create new user OR return exist
    newUser(user, pass)
        .then(userObject => res.json(userObject))
        .catch(e => {
            log_err(e);
            res.status(401).json(e);
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
