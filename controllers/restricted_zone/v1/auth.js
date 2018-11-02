const moment = require('moment'),
    cfg = require('../../../config/config'),
    project = cfg.project,
    API_VERSION = cfg.api_version,
    logger = require('../../../utils/logger')(module),
    cluster = require('cluster'),
    jwt = require('../../../models/jwt'),
    c = cfg.color,
    check = require('../../../utils/checker').cheker();

// current module
const _module_ = 'REST API Subscribe controller';
// cluster.worker.id
const wid = cluster.worker.id;

// worker id pattern
const wid_ptrn = (endpoint) =>
    `${c.green}worker[${wid}]${c.red}[JWT]${c.yellow}[${API_VERSION}]${c.cyan}[${_module_}]${c.red} > ${c.green}[${endpoint}] ${
        c.white
    }`;

// simple query logger
let logit = (req, msg = '') =>
    Object({
        msg: msg,
        api_version: API_VERSION,
        module: 'SSO AUTH REST API controller',
        project: project,
        post_params: req.body,
        get_params: req.query,
        timestamp: (() => moment())(),
        path: module.filename
            .split('/')
            .slice(-2)
            .join('/'),
    });

/** Get Authorization Token */
const getToken = (req) => {
    logger.auth(logit(req)); // log query data any way
    let { authorization } = req.headers; // Authorization
    if (!authorization) return check.get_msg().no_jwt; // invalid token
    return authorization;
};

/*
const newJWT = async (req, res) => {
    logger.auth(logit(req)); // log auth requests
    let tmp_tkn = req.query.tkn;
    let redirectUrl = req.query.redirectUrl;
    if (tmp_tkn) {
        let _jwt = await jwt.verifyTempToken(tmp_tkn);
        res.cookie('jwt', _jwt, cfg.cookie);
    }
    if (redirectUrl) res.redirect(redirectUrl);
    else res.redirect('/');
};
*/

/** REST AUTH */
exports.auth = async (req, res) => {
    console.log(`${wid_ptrn('auth')}`);
    let token = getToken(req);
    if (token.hasOwnProperty('errorCode')) return res.status(401).json(token);
    // check AUTH token
    try {
        // res.set('Authorization', 'Bearer ' + jwt_access_token).json(jwt_access_token);
        res.json({ token: await jwt.verifyTempToken(token) });
    } catch (e) {
        res.status(401).json(e);
    }
};

/** REST LOGOUT */
exports.logout = async (req, res) => {
    console.log(`${wid_ptrn('logout')}`);
    let token = getToken(req);
    if (token.hasOwnProperty('errorCode')) return res.status(401).json(token);
    // check AUTH token
    try {
        // res.set('Authorization', 'Bearer ' + jwt_access_token).json(jwt_access_token);
        let response = await jwt.ssoLogout(token);
        if (response.hasOwnProperty('errorCode')) return res.status(response.errorCode).json(response);
        res.json({ status: 'OK', msg: response });
    } catch (e) {
        res.status(401).json(e);
    }
};
