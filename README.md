# POAP Websocket Service

This project is a service written in TypeScript that listens for newly minted POAPs (Proof of Attendance Protocol) on both the xDai and Ethereum mainnet networks. It collects additional information about the minted POAPs from the POAP API and sends it to a WebSocket. The goal of this project is to incentivize development using POAP and serve as a tool for future projects built on POAP.

## Features

- Listens to POAP smart contract events on xDai and Ethereum mainnet networks
- Gathers additional information on minted POAPs from POAP's API
- Sends POAP data to a WebSocket
- Supports retries on failed API requests with configurable retry count and delay

## Prerequisites

- Node.js (v12+)
- TypeScript
- An understanding of POAP, smart contracts, and WebSockets

## Installation

1. Clone the repository:

```
git clone https://github.com/Esteban-V/poap-ws-feed
```

2. Install dependencies:

```
cd poap-ws-feed
npm install
```

3. Create a `.env` file in the root directory and set the required environment variables:

```
XDAI_WS_PROVIDER=<Your xDai Websocket Provider>
MAINNET_WS_PROVIDER=<Your Ethereum Mainnet Websocket Provider>
POAP_CONTRACT=<POAP Contract Address>
POAP_API_BASEURL=<POAP API Base URL>
POAP_API_KEY=<Your POAP API Key>
WS_PORT=<Desired port for WS to run on>
```

4. Compile TypeScript:

```
npm run build
```


5. Run the service:

```
npm run start
```

## Usage

Use the WebSocket server to build applications that need real-time updates on minted POAPs, such as analytics tools, notification systems, or interactive visualizations.

## Contributing

We welcome contributions! Feel free to open issues and submit pull requests to improve the project.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
