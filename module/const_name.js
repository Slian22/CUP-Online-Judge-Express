module.exports = {
	language_name:{
		local:["C11","C++17","Pascal","Java","Ruby","Bash","Python 2","PHP","Perl",
			"C#","Objective-C","FreeBasic","Schema","Clang","Clang++","Lua","JavaScript","Go",
			"Python 3","C++11","C++98","C99","Kotlin","Other Language"],
		hdu:["G++","","C++","GCC","","JAVA"],
		poj:["G++","GCC","JAVA","Pascal","C++","C","Fortran"],
		uva:["","ANSI C","JAVA","C++","Pascal","C++11","Python 3"],
		jsk:["C","C++","C++14","Java","Python","Python3","Ruby","Blockly","Octave"]
	},
	language_suffix:{
		local:["c","cpp","pas","java","rb","sh","py","php","perl","cs","objc","fbc","","c","cpp","lua",
			"js","go","py","cpp","cpp","c","kt"]
	},
	language_template:{
		local:["c_cpp","c_cpp","pascal","java","ruby","bash","python","php",
			"perl","csharp","objectivec","text","scheme","c_cpp","c_cpp","lua",
			"javascript","go","python","c_cpp","c_cpp","c_cpp","java",
			"python","python"]
	},
	langmask:138676,
	judge_color:["waiting", "running", "compiling", "running",
		"accepted", "wrong_answer", "wrong_answer", "time_limit_exceeded",
		"memory_limit_exceeded", "output_limit_exceeded", "runtime_error",
		"compile_error", "running", "running", "running","wrong_answer"],
	icon_list:["hourglass half", "spinner", "spinner", "spinner",
		"checkmark", "minus", "remove", "clock", "microchip",
		"print", "bomb", "code", "spinner", "spinner", "spinner","remove"],
	result:{
		cn:["等待","等待重判","编译中","运行并评判","答案正确","格式错误","答案错误","时间超限","内存超限","输出超限","运行错误","编译错误","编译成功","运行完成","已加入队列","提交被服务器拒绝",""],

	},
	language:{
		cn:{
			status:{
				solution_id:"运行号",
				user:"用户",
				user_id:"帐号",
				nick:"昵称",
				problem_id:"问题",
				result:"结果",
				language:"语言",
				contest_id:"竞赛号",
				memory:"内存",
				time:"耗时",
				length:"长度",
				submit_time:"提交时间",
				judger:"判题机"
			},
			ranklist:{
				rank:"名次",
				user:"用户名",
				nick:"昵称",
				accept:"通过",
				submit:"提交",
				ratio:"通过率",
				vjudge_accept:"VJ通过"
			}
		},
		jp:{
			status:{
				solution_id:"ランニングナンバー",
				user:"ユーサー",
				user_id:"アカウント",
				nick:"ニック",
				problem_id:"問題番号",
				result:"結果",
				language:"言語",
				contest_id:"コンテスト番号",
				memory:"メモリー",
				time:"時間",
				length:"長さ",
				submit_time:"提出時間",
				judger:"審判するコンピューター"
			}
		}
	}
};