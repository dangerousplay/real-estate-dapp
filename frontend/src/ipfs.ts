import { create } from 'ipfs-http-client'
import {ipfsApiUrl} from "./configuration";

export const ipfsClient = create({ url: ipfsApiUrl })