const express = require("express");
//const NodeCache = require('node-cache');
//const cache = new NodeCache({stdTTL: 10 * 24 * 60 * 60, checkperiod: 15 * 24 * 60 * 60});
const cache = require("../module/cachePool");
const router = express.Router();
const log4js = require("../module/logger");
const logger = log4js.logger("cheese", "info");
const query = require("../module/mysql_query");
const send_json = (res, val) => {
	if (res !== null) {
		res.header("Content-Type", "application/json");
		res.json(val);
	}
};

const problem_callback = (rows, res, source, id, sql) => {
	if (rows.length !== 0) {
		send_json(res, rows[0]);
		cache.set("source/id/" + source + id + sql, rows[0], 60 * 60);
	}
	else {
		const obj = {
			status: "error",
			statement: "problem not found"
		};
		send_json(res, obj);
	}
};

const no_privilege = {
	status: "error",
	statement: "Permission Denied"
};

router.get("/module/search/:val", function (req, res) {
	const val = "%" + req.params.val + "%";
	const _res = cache.get("/module/search/" + req.session.isadmin + val);
	if (_res === undefined) {
		if (val.length < 3) {
			const obj = {
				msg: "ERROR",
				statement: "Value too short!"
			};
			send_json(res, obj);
			return;
		}
		query("SELECT * FROM problem WHERE " + (req.session.isadmin ? "" : " defunct='N' AND") +
			" problem_id LIKE ? OR title LIKE ? OR source LIKE ? OR description LIKE ? OR label LIKE ?", [val, val, val, val, val], function (rows) {
			for (let i in rows) {
				rows[i]["url"] = "/newsubmitpage.php?id=" + rows[i]["problem_id"];
			}
			const result = {
				items: rows
			};
			send_json(res, result);
			cache.set("/module/search/" + req.session.isadmin + val, result, 10 * 24 * 60 * 60);
		});
	}
	else {
		send_json(res, _res);
	}
});

router.get("/:source/:id", function (req, res, next) {
	const id = parseInt(req.params.id);
	if (isNaN(id)) {
		next();
	}
	else {
		next("route");
	}
}, function (req, res) {
	const errmsg = {
		status: "error",
		statement: "invalid parameter id"
	};
	send_json(res, errmsg);
});

router.get("/:source/:id/:sid", function (req, res, next) {
	const id = parseInt(req.params.id);
	const sid = parseInt(req.params.sid);
	if (isNaN(sid) || isNaN(id)) {
		next();
	}
	else {
		next("route");
	}
}, function (req, res) {
	const errmsg = {
		status: "error",
		statement: "invalid parameter id or sid"
	};
	send_json(res, errmsg);
});

const make_cache = (id, source, res, req) => {
	logger.info(id);
	let sql;
	if (req.session.isadmin) {
		if (source.length === 0) {
			sql = "SELECT * FROM problem WHERE problem_id=?";
			query(sql, [id], (rows) => {
				problem_callback(rows, res, source, id, sql);
			});
		}
		else {
			sql = "SELECT * FROM vjudge_problem WHERE problem_id=? AND source=?";
			query(sql, [id, source], (rows) => {
				problem_callback(rows, res, source, id, sql);
			});
		}
	}
	else {
		if (source.length === 0) {
			sql = `SELECT * FROM problem WHERE problem_id = ? and defunct = 'N'
			 and  problem_id NOT IN (SELECT problem_id FROM contest_problem WHERE 
			 contest_id IN (SELECT contest_id FROM contest WHERE end_time > NOW() 
			 OR private = 1`;
			query(sql, [id])
				.then(rows => {
					problem_callback(rows, res, source, id, sql);
				});
		}
		else {
			sql = `SELECT * FROM vjudge_problem WHERE problem_id = ? and source = ? and defunct = 'N' 
			and CONCAT(problem_id,source) NOT IN (SELECT CONCAT(problem_id,source) FROM contest_problem 
			where contest_id IN (SELECT contest_id FROM contest WHERE end_time > NOW()
			OR private = 1`;
			query(sql, [id, source])
				.then(rows => {
					problem_callback(rows, res, source, id, sql);
				});
		}
	}
};

router.get("/:source/:id", function (req, res) {
	const source = req.params.source === "local" ? "" : req.params.source.toUpperCase();
	const id = parseInt(req.params.id);
	const _res = cache.get("source/id/" + source + id);
	if (_res === undefined) {
		make_cache(id, source, res, req);
	}
	else {
		send_json(res, _res);
		make_cache(id, source, null, req);
	}
});

router.post("/:source/:id", function (req, res) {
	const problem_id = parseInt(req.params.id);
	if (req.session.isadmin) {
		let json;
		try {
			json = req.body.json;
			console.log(json);
			query(`update problem set title = ?,time_limit = ?,memory_limit = ?,description = ?,input = ?,output = ?,
			sample_input = ?,sample_output = ?,hint = ? where problem_id = ?`,
				[json.title, json.time, json.memory, json.description, json.input,
					json.output, json.sampleinput, json.sampleoutput, json.hint,
					problem_id])
				.then(row => {
					console.log(row);
				})
				.catch(err => {
					logger.fatal(err);
					console.log(err);
				});
			send_json(res, {
				status: "OK"
			});
		}
		catch (e) {
			logger.fatal(e);
			send_json(res, {
				status: "error",
				statement: "parse error"
			});
		}
	}
	else {
		send_json(res, {
			status: "error",
			statement: "illegal request"
		});
	}
});

router.get("/:source/:id/:sid", function (req, res) {
	const source = req.params.source === "local" ? "" : req.params.source.toUpperCase();
	const id = parseInt(req.params.id);
	const sid = parseInt(req.params.sid);
	const _res = cache.get("source/id/" + source + id + "/" + sid);
	if (_res === undefined) {
		if (source.length === 0) {
			query("SELECT * FROM problem WHERE problem_id=?", [id]).then(async (rows) => {
				await query("SELECT source,user_id FROM source_code WHERE solution_id=?", [sid]).then(async (rows2) => {
					const user_id = rows2[0].user_id;
					if (!req.session.isadmin && user_id !== req.session.user_id) {
						send_json(res, no_privilege);
					}
					else {
						let obj = rows[0];
						obj.code = rows2[0].source;
						cache.set("source/id/" + source + id + "/" + sid, rows[0], 10 * 24 * 60 * 60);
						send_json(res, obj);
					}
				});
			});
		}
		else {
			query("SELECT * FROM vjudge_problem WHERE problem_id=? AND source=?", [id, source])
				.then(async (rows) => {
					await query("SELECT source,user_id FROM vjudge_source_code WHERE solution_id=?", [sid])
						.then(async (rows2) => {
							const user_id = rows2[0].user_id;
							if (!req.session.isadmin && user_id !== req.session.user_id) {
								send_json(res, no_privilege);
							}
							else {
								let obj = rows[0];
								obj.code = rows2[0].source;
								cache.set("source/id/" + source + id + "/" + sid, rows[0], 10 * 24 * 60 * 60);
								send_json(res, obj);
							}
						});
				});
		}
	}
	else {
		send_json(res, _res);
	}
});


module.exports = router;
