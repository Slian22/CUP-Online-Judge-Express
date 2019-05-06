const [error] = require("../module/const_var");
const client = require("../module/redis");
const contest_mode = require("./contest_mode");
const ban_check = require("./ban_check");
const generateToken = require("./generate_token");
module.exports = async (req, res, next) => {
	if (process.env.NODE_ENV === "local") {
		if (!req.session.auth) {
			req.session.auth = true;
			req.session.isadmin = true;
			req.session.user_id = "2016011253";
			req.session.nick = "Ryan Lee";
			req.session.avatar = false;
		}
		return next();
	}
	if (!req.session.auth) {
		const original_cookie = req.cookies;
		//req.cookies is an object
		const token = original_cookie["token"];
		const newToken = original_cookie["newToken"];
		const user_id = original_cookie["user_id"];
		//get token and user_id from cookie
		if (typeof user_id === "string") {//whether user_id is string or not,maybe it is an undefined variable
			//const original_token = await memcache.get(user_id + "token");
			const original_token = await client.lrangeAsync(`${user_id}token`, 0, -1);
			const new_token_list = await client.lrangeAsync(`${user_id}newToken`, 0, -1);
			if (original_token.indexOf(token) !== -1 || new_token_list.indexOf(newToken) !== -1) {
				// if (token === original_token) {//check token
				const login_action = require("../module/login_action");
				await login_action(req, user_id);
				generateToken(req, res);
				return await ban_check(req, res,await contest_mode(req, res, next));
			}
			else {
				return res.json(error.nologin);
			}
		}
		else {
			return res.json(error.nologin);
		}

	}
	else {
		generateToken(req, res);
		return await ban_check(req, res,await contest_mode(req, res, next));
	}
};
