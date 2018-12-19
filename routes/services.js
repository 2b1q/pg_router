const router = require("express").Router(),
    { color: c, restricted_services, node_types } = require("../config/config"),
    { regUser, checkAuth, setRes } = require("../controllers/rpc/v1/rpc_auth"), // RPC auth module
    { get: clientGet } = require("../modules/adapter_proxy/adapter_clients"), // adapter proxy client module (direct)
    { nodes, nodesByType, getNodeByHid, addNode, rmNodeByHid } = require("../controllers/rpc/v1/rpc_node_manager"); // todo RPC NM module

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

/*
 * (NM) Node management endpoints
 * NM_1_APIs: CRUD - node config (add/delete/update/get node config to check from NM service)
 * NM_2_APIs: CRD - Create/Read/Delete Azure nodes API (Create/Delete/Read Azure node config)
 * NM_3_APIs: Start/Stop node API
 * */
/*
 * NM_1_APIs
 * */
// GET nodes by type routers [ '/v1/node/btc', '/v1/node/ltc', '/v1/node/eth' ]
router.route(node_types.map(node => v1_ptrn(`node/${node}`))).get(nodesByType);
// GET all nodes
router.route(v1_ptrn("nodes")).get(nodes);
// CRUD node config to check from NM service
router
    .route(v1_ptrn("node"))
    .get(getNodeByHid) // get config node by node hash or node id
    .post(addNode) // add node
    .delete(rmNodeByHid); // remove node
//     .put(updNode); // update node

/*
 * todo NM_2_APIs
 * */

/*
 * todo NM_3_APIs
 * */

/** SSO reg/Logout endpoints */
router.post(v1_ptrn("user"), regUser); // reg new user OR get current if user exists
// router.get(v1_ptrn("logout"), logout); //  logout user by JWT
// router.delete(v1_ptrn("user"), deleteUser); //  delete user by JWT
// router.get(v1_ptrn("refresh"), refreshJWT); // get new JWT pair by refresh JWT

module.exports = router;
