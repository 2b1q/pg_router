/**
 * check AUTH model
 * */

/** Check json-rpc node client AUTH */
exports.node = (user, pass, node_type) =>
    new Promise((resolve, reject) => {
        if (user && pass && node_type) return resolve();
        else return reject();
    });

/** Check adapter client by JWT */
exports.adapter = token => new Promise((resolve, reject) => {});
