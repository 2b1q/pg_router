const { verifyAccessToken, decode } = require("../../../models/jwt"), // add verifyAccessToken method from jwt model
    moment = require("moment"),
    cfg = require("../../../config/config"),
    project = cfg.project,
    API_VERSION = cfg.api_version,
    logger = require("../../../utils/logger")(module),
    cluster = require("cluster"),
    c = cfg.color,
    check = require("../../../utils/checker").cheker();

// current module
const _module_ = "REST API Subscribe controller";
// cluster.worker.id
const wid = cluster.worker.id;
// worker id pattern
const wid_ptrn = endpoint =>
    `${c.green}worker[${wid}]${c.red}[Restricted Zone]${c.yellow}[${API_VERSION}]${c.cyan}[${_module_}]${c.red} > ${c.green}[${endpoint}] ${
        c.white
    }`;

// simple query logger
let logit = (req, msg = "") =>
    Object({
        msg: msg,
        api_version: API_VERSION,
        module: _module_,
        project: project,
        post_params: req.body,
        get_params: req.query,
        timestamp: (() => moment())(),
        path: module.filename
            .split("/")
            .slice(-2)
            .join("/")
    });

/** Get Authorization Token */
const getParams = (req, { check_addr }) => {
    logger.auth(logit(req)); // log query data any way
    let { authorization } = req.headers; // Authorization
    if (!authorization) return check.get_msg().no_jwt; // check if no JWT in Authorization header
    if (check_addr) {
        let addr = req.body.addr || req.query.addr; // dispatch addr parameter
        if (!addr) return check.get_msg().no_addr; // check if no addr parameter passed
        let caddr = check.cut0xClean(addr); // clear address
        if (!check.checkAddr(caddr)) return check.get_msg().bad_addr(addr); // check address format
        return {
            token: authorization,
            addr: caddr
        };
    }
    return {
        token: authorization
    };
};

/** REST API Subscribe */
exports.subscribe = (req, res) => {
    console.log(`${wid_ptrn("Subscribe")}`);
    let { token, addr, errorCode, errorMessage } = getParams(req, { check_addr: true });
    if (errorCode) {
        errorCode === 401 && res.status(401);
        errorCode === 400 && res.status(400);
        return res.json({ errorCode: errorCode, errorMessage: errorMessage });
    }

    // check access token And ADD subscribe
    verifyAccessToken(token)
        .then(jwt_access_token => {
            // get accountId from JWT
            let accountId = decode(jwt_access_token).authData.accountId;
            // Update user_subscriptions by accountId
            Mod_sub({ aid: accountId, addr: addr }).then(result => {
                // send subscribe result with Authorization Bearer
                if (result.error)
                    return res
                        .status(409) // setup 409 HTTP Status Code
                        .set("Authorization", jwt_access_token) // setup JWT Access Token to Authorization header
                        .json(check.get_msg().subscribe_fail); // send JSON payload
                res.set("Authorization", jwt_access_token).json(result);
            });
        })
        .catch(() => res.status(401).json(check.get_msg().no_jwt)); // invalid JWT

    // res.set('Authorization', token).json({ addr: addr });
};

/** REST API UnSubscribe */
exports.unSubscribe = (req, res) => {
    console.log(`${wid_ptrn("unSubscribe")}`);
    let { token, addr, errorCode, errorMessage } = getParams(req, { check_addr: true });
    if (errorCode) {
        errorCode === 401 && res.status(401);
        errorCode === 400 && res.status(400);
        return res.json({ errorCode: errorCode, errorMessage: errorMessage });
    }
    // check access token And ADD subscribe
    verifyAccessToken(token)
        .then(jwt_access_token => {
            // get accountId from JWT
            let accountId = decode(jwt_access_token).authData.accountId;
            // Update user_subscriptions by accountId
            Mod_unsub({ aid: accountId, addr: addr }).then(result => {
                // send subscribe result with Authorization Bearer
                if (result.error)
                    return res
                        .status(409) // setup 409 HTTP Status Code
                        .set("Authorization", jwt_access_token) // setup JWT Access Token to Authorization header
                        .json(check.get_msg().subscribe_fail); // send JSON payload
                res.set("Authorization", jwt_access_token).json(result);
            });
        })
        .catch(() => res.status(401).json(check.get_msg().no_jwt)); // invalid JWT
};

/** REST API ListSubscribe */
exports.listSubscribe = (req, res) => {
    console.log(`${wid_ptrn("ListSubscribe")}`);
    let { token, errorCode, errorMessage } = getParams(req, { check_addr: false });
    if (errorCode) {
        errorCode === 401 && res.status(401);
        errorCode === 400 && res.status(400);
        return res.json({ errorCode: errorCode, errorMessage: errorMessage });
    }
    // check access token And LIST subscribe
    verifyAccessToken(token)
        .then(jwt_access_token => {
            // get accountId from JWT
            let accountId = decode(jwt_access_token).authData.accountId;
            // Update user_subscriptions by accountId
            Mod_lssub({ aid: accountId }).then(result => {
                // send subscribe result with Authorization Bearer
                if (result.error)
                    return res
                        .status(409) // setup 409 HTTP Status Code
                        .set("Authorization", jwt_access_token) // setup JWT Access Token to Authorization header
                        .json(check.get_msg().subscribe_fail); // send JSON payload
                res.set("Authorization", jwt_access_token).json(result);
            });
        })
        .catch(() => res.status(401).json(check.get_msg().no_jwt)); // invalid JWT
};

/** REST restricted TEST JWT */
exports.restricted = (req, res) => {
    let secret_payload = {
        msg: "secret_payload "
    };
    console.log(`${wid_ptrn("restricted test")}`);
    let { token } = getParams(req);
    if (token.hasOwnProperty("errorCode")) return res.status(401).json(token);
    // check access token
    verifyAccessToken(token)
        .then(jwt_access_token => res.set("Authorization", jwt_access_token).json(secret_payload))
        .catch(() => res.status(401).json(check.get_msg().no_jwt)); // invalid JWT
};
