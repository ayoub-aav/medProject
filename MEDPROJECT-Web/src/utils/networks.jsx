const networks = {
    ganache: {
        chainId: `0x${Number(1337).toString(16)}`, // Default Chain ID for Ganache
        chainName: "Ganache Localhost",
        nativeCurrency: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18
        },
        rpcUrls: ["http://127.0.0.1:7545"], // Ganache RPC URL
        blockExplorerUrls: [] // No block explorer for local Ganache
    }
};

export default networks