/* Checker singleton pattern with closures
 *  - handy tools
 *  - get client msgs object
 */
const check_module_singleton = (() => {
    let instance; // keep reference to instance
    // init instance
    let initSingleton = () => {
        // private constants
        const cfg = require("../config/config");
        // client msgs
        const msg = {
            not_found: { head: {}, rows: [] }, // API v.2 & API v.1
            404: { errorCode: 404, errorMessage: "Not found", head: {}, rows: [] }, // API v.2
            block_not_found: { errorCode: 404, errorMessage: "Block not found" }, // API v.2
            transaction_not_found: { errorCode: 404, errorMessage: "Transaction not found" }, // API v.2
            wrong_block: { errorCode: 400, errorMessage: "Wrong block number" }, // API v.2
            no_offset: { errorCode: 400, errorMessage: 'parameter "offset" not found or wrong' }, // API v.2
            no_size: { errorCode: 400, errorMessage: 'parameter "size" not found or wrong' }, // API v.2
            no_addr: { errorCode: 400, errorMessage: 'parameter "addr" not found' }, // API v.2
            no_jwt: { errorCode: 401, errorMessage: "invalid token" }, // API v.2
            wrong_addr: { errorCode: 400, errorMessage: 'Wrong "addr" property' }, // API v.2
            no_blockNumber: { error: "blockNumber not found" }, // API v.2
            bad_search_parameter: q => Object({ errorCode: 400, errorMessage: `Wrong "q" property: "${q}"` }), // API v.2
            bad_hash: hash => Object({ errorCode: 400, errorMessage: `Bad Hash value "${hash}"` }), // API v.2
            bad_addr: addr => Object({ errorCode: 400, errorMessage: `Bad addr value "${addr}"` })
        };
        // construct res object
        let send_response = function(res, msg, status) {
            res.status(status);
            res.json(msg);
        };
        // check hash from client request
        let check_Hash = chash => (chash.length === 64 ? true : false);
        // check addr from client request
        let check_addr = caddr => (caddr.length === 40 ? true : false);
        // check listId from client request
        let check_listId = listId => (Object.values(cfg.list_type).includes(listId) ? true : false);
        // check ModuleId from client request
        let check_moduleId = moduleId => (Object.values(cfg.modules).includes(moduleId) ? true : false);
        // check entityId from client request
        let check_entityId = (entityId = 0) => (entityId !== 0 ? true : false);
        // check block from client request
        let check_block = block => (block > 0 ? true : false);
        // check address from client request
        let check_addr_exist = (address, res) => {
            return address.length === 40 ? true : send_response(res, msg.wrong_addr, 404);
        };

        // hash operations
        // cut '0x' from hash string
        let cut_0x = hash => (typeof hash === "string" ? hash.split("0x").pop() : "");

        // remove unexpected chars from hex
        let clean_Hex = hash => (typeof hash === "string" ? hash.replace(/[^a-fA-F0-9]+/g, "") : "");

        // cut '0x' then remove unexpected chars from hex
        let cut0x_Clean = hash => clean_Hex(cut_0x(hash)).toLowerCase();

        // get user/pass/node_type from req.headers
        const getCreds = headers => {
            let { authorization } = headers;
            let user, pass, node_type;
            if (authorization) {
                let Authorization = authorization.split(" ");
                /** Base64 decoder*/
                if (Authorization[0] === "Basic") {
                    let buff = new Buffer(Authorization[1], "base64");
                    let text = buff.toString("ascii");
                    let up = text.split(":");
                    let node_user = up[0].split("_"); // dispatch user and node_type
                    node_type = node_user[0] || "btc";
                    user = node_user[1];
                    pass = up[1]; // dispatch pass
                    return {
                        user: user,
                        pass: pass,
                        node_type: node_type
                    };
                }
            }
            return {
                user: undefined,
                pass: undefined,
                node_type: undefined
            };
        };

        // public interface
        return {
            get_msg: () => msg, // get client msgs object
            get_creds: headers => getCreds(headers), // get user/pass/node_type from req.headers
            cut0xClean: hash => cut0x_Clean(hash), // cut '0x' then remove unexpected chars from hex
            cut0x: hash => cut_0x(hash), // cut '0x'
            checkHash: chash => check_Hash(chash), // check hash from client request
            checkAddr: caddr => check_addr(caddr), // check address from client request
            block: block => check_block(block), // check block from client request
            addr: (address, res) => check_addr_exist(address, res) // check IS address exists from client request
        };
    };
    return {
        getInstance: () => {
            if (!instance) instance = initSingleton();
            return instance;
        }
    };
})();

module.exports.cheker = () => check_module_singleton.getInstance();
