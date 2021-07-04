import axios from "axios";

const instance = axios.create({ baseURL: process.env.REACT_APP_API_BASE_URL });

instance.interceptors.request.use(
	function (config) {
		config.withCredentials = true;

		return config;
	},
	function (error) {
		return Promise.reject(error);
	}
);

instance.interceptors.response.use(
	(resp) => {
		return resp;
	},
	(err) => {
		let resp = err.response;
		if (!resp) {
			window.location.pathname = "/login";
			alert("Unable to connect to the server. Please try again.");
		}

		if (resp.status === 401 && window.location.pathname !== "/login") {
			window.location.pathname = "/login";
		}

		return Promise.reject(err);
	}
);

export default {
	get: instance.get,
	post: instance.post,
};
