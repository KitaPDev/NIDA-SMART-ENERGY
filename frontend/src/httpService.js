import axios from "axios";

const instance = axios.create({baseURL: process.env.REACT_APP_API_BASE_URL})

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
	get: instance.get,
	post: instance.post,
};
