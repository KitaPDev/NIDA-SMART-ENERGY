import axios from "axios";

axios.interceptors.request.use(
	function (config) {
		config.baseURL = process.env.REACT_APP_API_BASE_URL;
		config.withCredentials = true;

		return config;
	},
	function (error) {
		return Promise.reject(error);
	}
);

axios.interceptors.response.use(
	(resp) => {
		if (resp.status === 401) {
			window.location.pathname = "/login";
		}

		return resp;
	},
	(err) => {
		return Promise.reject(err);
	}
);

export default {
	get: axios.get,
	post: axios.post,
};
