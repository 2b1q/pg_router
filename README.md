# payment-gateway-router [PGR]
- common entry point to interact with BTL/LTC nodes
- request routing by auth params (node user/pass)
- transparent node proxying 
- balancing
- auth
### Prerequisites
PGR requires
- [Node.js](https://nodejs.org/) v4+ to run.
- config.js 
- sso_secret.pub
### Installation
```sh
$ git clone https://2b1q@bitbucket.org/bankexlab/payment-gateway-router.git
$ cd payment-gateway-router
$ npm i -s
$ npm start
```
### cURL LTC/BTC request
Use LTC user/passs to get data from LTC node
or use BTC user/pass to get data from BTC node
```sh
$ curl 'http://btcUser:btcPass@localhost:3006/' -H 'Content-Type: application/json' --data-binary $'{\n    "jsonrpc": "1.0",\n    "method": "getdifficulty",\n    "params": []\n}'
{"result":7184404942701.792,"error":null,"id":null}
$ curl 'http://ltcUser:ltcPass@localhost:3006/' -H 'Content-Type: application/json' --data-binary $'{\n    "jsonrpc": "1.0",\n    "method": "getdifficulty",\n    "params": []\n}' 
{"result":8349684.848687358,"error":null,"id":null}
```
