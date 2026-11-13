import axios from 'axios';

const env =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : (typeof globalThis !== 'undefined' && globalThis.process ? globalThis.process.env : {});

const base_url =
  Number(env?.VITE_IN_PROD) === 0
    ? `${env?.VITE_LOCAL_SERVER || 'http://localhost:9080'}/user`
    : `${env?.VITE_PROD_SERVER || 'http://localhost:9080'}/user`;

const client_server = axios.create({
  baseURL: base_url,
});

export default client_server;