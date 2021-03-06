#!/bin/bash
unset npm_config_prefix
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" || {
  echo "you need nvm (https://github.com/creationix/nvm)"; exit 1
}
[ ! -d "./node_modules" ] && ./init.sh

nvm --version 1>/dev/null 2>&1
[ $? -ne 0 ] && echo "you need nvm (https://github.com/creationix/nvm)" && exit 1

nvm use $(cat ./.nvmrc)
nvm run $*
nvm use default
