const router = require("express").Router(),
    { color: c } = require("../config/config"),
    { regUser, checkAuth } = require("../controllers/restricted_zone/v1/auth");

/** api prefix */
const v1_ptrn = path => `/v1/${path}`; // v. 1 pattern
const v1_auth_ptrn = (service, path) => v1_ptrn(`${service}/${path}`); // v. 1 restricted pattern
/** Restricted Zone endpoints */
const services = ["ltc", "btc"]; // restricted services
// restricted zone routes stack IIFE
const restricted_zone = (() => ["address", "block", "account"].map(route => services.map(service => v1_auth_ptrn(service, route))))();
// AUTH middleware
router.get(restricted_zone, (req, res) => {
    console.log(c.yellow, "Restricted routes STACK ACTIVATED\n", c.cyan, restricted_zone, c.white);
    let service = req.url.split("/");
    let adapter = service[2];
    let endpoint = service[3];
    console.log(
        c.magenta,
        {
            adapter: adapter,
            endpoint: endpoint
        },
        c.white
    );
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
