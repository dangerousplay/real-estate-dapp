import {createClient} from "urql";


export const urqlClient = createClient({
    url: 'http://127.0.0.1:8000/subgraphs/name/dangerousplay/realestate',
});