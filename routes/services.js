const router = require("express").Router(),
    auth_controller = require("../controllers/restricted_zone/v1/auth"),
    { subscribe, listSubscribe, unSubscribe } = require("../controllers/restricted_zone/v1/gateway");

const v1_ptrn = path => `/v1/${path}`; // v. 1 pattern

/** REST API v.1.0 endpoints
 * - routing by path
 */

/** SSO Auth/Logout endpoints */
router.get(v1_ptrn("auth"), auth_controller.auth);
router.get(v1_ptrn("logout"), auth_controller.logout);

/** Restricted Zone endpoints */

module.exports = router;
