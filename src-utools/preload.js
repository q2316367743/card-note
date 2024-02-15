const axios = require("axios");
const preload = {
    axios: axios.create({
        adapter: 'http',
        timeout: 5000
    })
};

window.preload = preload;
