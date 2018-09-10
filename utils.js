const eosjs2 = require("eosjs2");
const axios = require("axios");
const fetch = require("node-fetch"); // node only; not needed in browsers
const { TextDecoder, TextEncoder } = require("text-encoding"); // node only; not needed in browsers

const defaultPrivateKey = "5JcivURSrU113tRzHv5fELhhzApGTuPdN8zAam6uPi2cRKR333i"; // useraaaaaaaa
const rpc = new eosjs2.Rpc.JsonRpc("https://api.eosnewyork.io", { fetch });
const signatureProvider = new eosjs2.SignatureProvider([defaultPrivateKey]);
const api = new eosjs2.Api({
  rpc,
  signatureProvider,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder()
});

const test = async function() {
  try {
    const getInfo = async () => {
      const info = await axios({
        url: "http://172.105.224.240:8888/v1/chain/get_info",
        headers: {
          "Content-Type": "application/json"
        }
      });
      return info.data;
    };

    const getBlock = async head_block_num => {
      const blockInfo = await axios({
        method: "POST",
        url: "http://172.105.224.240:8888/v1/chain/get_block",
        headers: {
          "Content-Type": "application/json"
        },
        data: {
          block_num_or_id: head_block_num
        }
      });
      return blockInfo.data;
    };

    const getAbi = async () => {
      const reponse = await axios({
        method: "POST",
        url: 'http://172.105.224.240:8888/v1/chain/get_abi',
        headers: {
          "Content-Type": "application/json"
        },
        data: {
          account_name: "eosio",
          code_as_wasm: true
        }
      })
      return reponse.data
    };

    const info = await getInfo();
    const blockInfo = await getBlock(info.head_block_num);
    const abi = await getAbi()
    const result = await api.transact(
      {
        actions: [
          {
            account: "eosio",
            name: "transfer",
            authorization: [
              {
                actor: "g4ydomzwhage",
                permission: "owner"
              }
            ],
            data: {
              from: "g4ydomzwhage",
              to: "infinitotest",
              quantity: "0.0001 EOS",
              memo: ""
            }
          }
        ]
      },
      {
        blocksBehind: 3,
        expireSeconds: 30
      },
      info,
      blockInfo,
      abi
    );
  } catch (e) {
    console.log("Caught exception: " + e);
  }
};

test();
