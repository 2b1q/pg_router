const router = require("express").Router(),
    { color: c, restricted_services } = require("../config/config"),
    { regUser, checkAuth, setRes } = require("../controllers/rpc/v1/rpc_auth"), // RPC auth module
    { get: clientGet } = require("../modules/adapter_proxy/adapter_clients"), // adapter proxy client module (direct)
    { getNodes, addNode, remNode, updNode } = require("../controllers/rpc/v1/rpc_node_manager"); // todo RPC NM module

/** api prefix */
const v1_ptrn = path => `/v1/${path}`; // v. 1 pattern
/** Restricted Zone endpoints */
// restricted_services stack IIFE (restricted_services) regexp
const v1_auth_regexp_ptrn = service => new RegExp("(/v1/" + service + "/)"); // v. 1 restricted ReExp pattern
const restricted_regexp = (rs => v1_auth_regexp_ptrn(rs.map(service => `${service}`).join("/)|(/v1/")))(restricted_services);
const restricted_zone = [restricted_regexp, v1_ptrn("rates"), v1_ptrn("rates/all"), v1_ptrn("rates/help")];
console.log("restricted_zone ", restricted_zone);
// AUTH middleware
router.get(restricted_zone, async (req, res) => {
    console.log(c.yellow, "Handle restricted route =>", c.cyan, req.path, c.white);
    console.log("req.url => ", req.url);
    let service = req.path.split("/");
    let adapter = service[2];
    let endpoint = typeof service[4] === "undefined" ? service[3] : service[3] + "/" + service[4];
    let params = req.query;
    let raw_param_string = req.url.split("?")[1];
    service = {
        adapter: adapter,
        endpoint: endpoint,
        parameters: params,
        param_string: raw_param_string
    };
    console.log(c.yellow, "service to proxy:", c.magenta, service, c.white);
    // if endpoint = 'help' -> redirect to constructed service url helper without AUTH
    if (endpoint === "help") return res.redirect(await clientGet(service));
    setRes(res); // setup response object to request timeout CB()
    checkAuth(req)
        .then(async () => {
            // await service request
            try {
                var { url, result } = await clientGet(service);
            } catch (e) {
                console.error("clientGet(service) error: ", e);
            }
            console.log("service URL :", url);
            res.json({ msg: "authorized", serviceUrl: url, result: result });
        })
        .catch(msg => {
            console.error(msg);
            res.status(401).json(msg);
        });
});

/** node management endpoints */
router.route(v1_ptrn("nodes")).get(getNodes); // get all nodes

// todo NM RPC interaction
// router.route(v1_ptrn("node")).get(getNodes); // get all nodes
//     .post(addNode) // add node
//     .delete(remNode) // remove node
//     .put(updNode); // update node

/** SSO reg/Logout endpoints */
router.post(v1_ptrn("user"), regUser); // reg new user OR get current if user exists
// router.get(v1_ptrn("logout"), logout); //  logout user by JWT
// router.delete(v1_ptrn("user"), deleteUser); //  delete user by JWT
// router.get(v1_ptrn("refresh"), refreshJWT); // get new JWT pair by refresh JWT

module.exports = router;
