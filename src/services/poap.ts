import fetch, { Headers } from "node-fetch";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import config from "../config";
import axios from "axios";
import axiosRetry from "axios-retry";
import WebSocketServer from "ws";
import poapAbi from "../abi/poap.json";
import { Network } from "../types/networks";
import { Action } from "../types/actions";
import { powerEmoji } from "../utils/poap";

const { XDAI_WS_PROVIDER, MAINNET_WS_PROVIDER, POAP_CONTRACT, POAP_API_KEY, POAP_API_BASEURL } = process.env;

export const init = (wss: WebSocketServer.Server) => {
  if (!XDAI_WS_PROVIDER || !MAINNET_WS_PROVIDER) {
    throw new Error('Missing Websocket Provider');
  }

  if (!POAP_CONTRACT) {
    throw new Error("Missing POAP Contract Address");
  }

  const web3xDai = new Web3(new Web3.providers.WebsocketProvider(XDAI_WS_PROVIDER, config.web3Options));

  const web3Mainnet = new Web3(new Web3.providers.WebsocketProvider(MAINNET_WS_PROVIDER, config.web3Options));

  axiosRetry(axios, {
    retries: 3, // retry request 3 times
    retryDelay: (retryCount) => {
      console.log(`Retry attempt: ${retryCount}`);
      return retryCount * 4000; // time interval between retries
    },
    retryCondition: (error) => {
      if (!error.response) return true;
      // retry on any network error, or 4xx or 5xx status codes
      return error.response.status >= 400;
    },
  });

  subscribeToTransfer(wss, web3xDai, POAP_CONTRACT, Network.XDAI);
  subscribeToTransfer(wss, web3Mainnet, POAP_CONTRACT, Network.MAINNET);
};

const subscribeToTransfer = (
  wss: WebSocketServer.Server,
  web3: Web3,
  address: string,
  network: Network
) => {
  let lastHash = "";
  console.log(`Subscribing to ${network} - ${address}`);

  const PoapContract = new web3.eth.Contract(poapAbi as AbiItem[], address);
  PoapContract.events
    .Transfer(null)
    .on("data", async (result: any) => {
      const { returnValues: { tokenId }, transactionHash: txHash } = result;

      console.log(`Transfer on ${network} - Token #${tokenId} - Hash: ${txHash}`);

      if (lastHash === txHash) return;

      try {
        const poapInfo = await getPOAPInfo(tokenId, result);

        wss.clients.forEach((client: WebSocketServer) => {
          client.send(JSON.stringify(poapInfo));
        });

        lastHash = txHash;
      } catch (e) {
        console.error("Error sending WebSocket message", e);
      }
    })
    .on("connected", (subscriptionId: number) => {
      console.log(`Connected to ${network} - ${subscriptionId}`);
    })
    .on("changed", (log: string) => {
      console.log(`Changed to ${network} - ${log}`);
    })
    .on("error", (error: any) => {
      console.error(`Error on ${network} - ${error}`);
    });
};

export const getTokenInfo = (tokenId: number | string) => {
  const url = `${POAP_API_BASEURL}/token/${tokenId}`;
  return fetch(url, {
    method: "GET",
    headers: getApiHeaders(),
  }).then((response) => response.json());
};

export const getAddressInfo = (address: string) => {
  const url = `${POAP_API_BASEURL}/actions/scan/${address}`;
  return fetch(url, {
    method: "GET",
    headers: getApiHeaders(),
  }).then((response) => response.json());
};

export const getENS = (address: string) => {
  const url = `${POAP_API_BASEURL}/actions/ens_lookup/${address}`;
  return fetch(url, {
    method: "GET",
    headers: getApiHeaders(),
  }).then((response) => response.json());
};

function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
} 

export const getPOAPInfo = async (tokenId: number | string, data: any) => {
  let tokenData, ens, poapPower;
  await delay(5000); // POAP API is not fast enough to get the token info	
  try {
    tokenData = await getTokenInfo(tokenId);
    const addressPoaps = await getAddressInfo(tokenData.owner);
    poapPower = addressPoaps.length;
    const ensLookup = await getENS(tokenData.owner);
    ens = ensLookup.valid ? ensLookup.ens : undefined;
  } catch (e) {
    console.error("Error getting token info", e);
    poapPower = 0;
  }

  const { from: fromAddress, to: toAddress } = data.returnValues;
  const action =
    fromAddress === config.zeroX
      ? Action.MINT
      : toAddress === config.zeroX
      ? Action.BURN
      : Action.TRANSFER;

  return {
    ...tokenData,
    poapPower,
    powerEmoji: powerEmoji(poapPower),
    action,
    ens,
  };
};

const getApiHeaders = () => {
  const requestHeaders = new Headers();
  requestHeaders.set('x-api-key', POAP_API_KEY || '');
  return requestHeaders;
};
