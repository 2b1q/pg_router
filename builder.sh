#!/usr/bin/env bash

target_dir="/tmp/pgr"
key="aEB2wU7LPAcaKb7ajRgu" # only reading access
pg_router="git clone https://2b1q:$key@bitbucket.org/bankexlab/payment-gateway-router.git"
pg_nm="git clone https://2b1q:$key@bitbucket.org/bankexlab/payment-gateway-node-manager.git"
pg_auth="git clone https://2b1q:$key@bitbucket.org/bankexlab/payment-gateway-auth.git"
pg_json_rpc_proxy="git clone https://2b1q:$key@bitbucket.org/bankexlab/payment-gateway-jrpc-proxy.git"

clone(){
 echo "starting clone PGR repos..."
 echo "cloning PG_ROUTER repo..."
 $pg_router && echo "Done!\nCloning PG_NM repo..." && \
 $pg_nm && echo "Done!\nCloning PG_AUTH repo..." && \
 $pg_auth && echo "Done!\nCloning PG_JSON-RPC_proxy repo..." && \
 $pg_json_rpc_proxy && echo "Done!\n"
}

install(){
 mkdir -p $target_dir && cd $target_dir && \
 echo "Remove current repos..." && rm -rf $target_dir/* && \
 clone
 copy_cfg && \
 cp $target_dir/*/pg_stack.yml $target_dir && \
 docker-compose -f pg_stack.yml build
}


copy_cfg(){
 echo "Copying configs..."
 if [ -e $target_dir/pg_stack.yml ]; then
    rm $target_dir/pg_stack.yml
 fi
 for f in $target_dir/*; do
   echo "Copy $f/config/config-example.js -> $f/config/config.js"
   cp $f/config/config-example.js $f/config/config.js
 done
}

case "$1" in
  up)
   if [ -e $target_dir/pg_stack.yml ]; then
      echo "starting PGR stack" && \
      cd $target_dir && \
      docker-compose -f pg_stack.yml up
   else
      echo "stack components not installed" && \
      echo "Usage: $0 install"
   fi
   ;;
  down)
     if [ -e $target_dir/pg_stack.yml ]; then
        echo "stopping PGR stack" && \
        cd $target_dir && \
        docker-compose -f pg_stack.yml down
     else
        echo "stack components not installed" && \
        echo "Usage: $0 install"
     fi
    ;;
  install)
    echo "installing PGR stack" && \
    install
    ;;
  *)
    echo "Usage: $0 {up|down|install}"
    ;;
esac
