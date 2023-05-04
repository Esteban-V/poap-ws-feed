const config = {
  web3Options: {
    reconnect: {
      auto: true,
      delay: 5000, // ms
      maxAttempts: 20,
      onTimeout: false,
    },
  },
  zeroX: "0x0000000000000000000000000000000000000000",
};

export default config
