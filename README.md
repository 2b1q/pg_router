# payment-gateway-router [PGR]
- common entry point to interact with BTL/LTC nodes
- request routing by auth params (node user/pass)
- transparent node proxying 
- balancing
- reg/auth
### Prerequisites
PGR requires
- [Node.js](https://nodejs.org/) v4+ to run.
- config.js 
- docker
### Install and Run
```sh
$ git clone https://2b1q@bitbucket.org/bankexlab/payment-gateway-router.git
$ cd payment-gateway-router
$ docker-compose -f stack.yml up -d
$ npm i -s
$ npm start
```
### cURL LTC/BTC request
Use basic cURL json-rpc request to get data from node
BTC node json-rpc request:
```sh
$ curl 'http://btc_user:pwd@localhost:3006/' -H 'Content-Type: application/json' --data-binary $'{\n    "jsonrpc": "1.0",\n    "method": "getdifficulty",\n    "params": []\n}'
{"result":7184404942701.792,"error":null,"id":null}
```
LTC node json-rpc request:
```sh
$ curl 'http://ltc_user:pwd@localhost:3006/' -H 'Content-Type: application/json' --data-binary $'{\n    "jsonrpc": "1.0",\n    "method": "getdifficulty",\n    "params": []\n}' 
{"result":8349684.848687358,"error":null,"id":null}
```
HTTP header 'content-type' could be any -H 'content-type: text/plain;' OR -H 'Content-Type: application/json'
