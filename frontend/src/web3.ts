import Web3 from "web3";
import Web3Modal from "web3modal";

const providerOptions = {
    /* See Provider Options Section */
};

export const web3Modal = new Web3Modal({
    network: "localhost", // optional
    cacheProvider: true, // optional
    providerOptions // required
});

export const web3c = web3Modal.connect().then(p => new Web3(p));

