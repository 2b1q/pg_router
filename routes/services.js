const router = require("express").Router(),
    { regUser, logout } = require("../controllers/restricted_zone/v1/auth");
// { subscribe, listSubscribe, unSubscribe } = require("../controllers/restricted_zone/v1/gateway");

const v1_ptrn = path => `/v1/${path}`; // v. 1 pattern

/** REST API v.1.0 endpoints
 * - routing by path
 */

/** SSO reg/Logout endpoints */
router.post(v1_ptrn("user"), regUser); // reg new user OR get current if user exists
router.get(v1_ptrn("logout"), logout); //  logout user by JWT
// router.delete(v1_ptrn("user"), deleteUser); //  delete user by JWT
// router.get(v1_ptrn("refresh"), refreshJWT); // get new JWT pair by refresh JWT

/** Restricted Zone endpoints */

module.exports = router;
