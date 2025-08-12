import axios from 'axios';

const base_url=Number(import.meta.env.VITE_IN_PROD)===0?`${import.meta.env.VITE_LOCAL_SERVER}/user`:`${import.meta.env.VITE_PROD_SERVER}/user`

const client_server=axios.create({
    baseURL:base_url
});

export default client_server;