const app = require("express"),
    router = app.Router(),
    { regUser, checkAuth } = require("../controllers/restricted_zone/v1/auth");

/** api prefix */
const v1_ptrn = path => `/v1/${path}`; // v. 1 pattern
/** Restricted Zone endpoints */
// restricted routes stack IIFE
const restricted_routes = (() => ["btc", "ltc"].map(route => v1_ptrn(route)))();
// AUTH middleware
router.get(restricted_routes, (req, res) => {
    console.log("Restricted routes STACK ACTIVATED");
    checkAuth(req)
        .then(() => res.json({ msg: "authorized" }))
        .catch(msg => res.status(401).json(msg));
});

/** SSO reg/Logout endpoints */
router.post(v1_ptrn("user"), regUser); // reg new user OR get current if user exists
// router.get(v1_ptrn("logout"), logout); //  logout user by JWT
// router.delete(v1_ptrn("user"), deleteUser); //  delete user by JWT
// router.get(v1_ptrn("refresh"), refreshJWT); // get new JWT pair by refresh JWT

module.exports = router;
