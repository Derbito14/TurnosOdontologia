import axios from 'axios';

const api = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '') || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// If the URL was provided without protocol, prepend https://
if (api.defaults.baseURL && !api.defaults.baseURL.startsWith('http')) {
    api.defaults.baseURL = `https://${api.defaults.baseURL}`;
}

console.log("Connectando a API en:", api.defaults.baseURL);

export default api;
