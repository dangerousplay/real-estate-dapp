import {createClient} from "urql";
import {graphqlUrl} from "./configuration";


export const urqlClient = createClient({
    url: graphqlUrl,
});