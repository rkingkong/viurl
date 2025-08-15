export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
export const WEB3_NETWORK = process.env.REACT_APP_NETWORK || 'sepolia';

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    web3Login: '/auth/web3-login',
    profile: '/auth/profile',
    refresh: '/auth/refresh',
    logout: '/auth/logout'
  },
  posts: {
    create: '/posts/create',
    list: '/posts',
    verify: '/posts/verify',
    vote: '/posts/vote'
  },
  tokens: {
    balance: '/tokens/balance',
    claim: '/tokens/claim',
    transfer: '/tokens/transfer'
  }
};