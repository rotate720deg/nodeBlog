var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var config = require('config-lite')(__dirname);
var routes = require('./routes');
var pkg = require('./package');
var winston = require('winston');
var expressWinston = require('express-winston');
var formidable = require('express-formidable');


var app = express();

//设置模板目录
app.set('views',path.join(__dirname,'views'));

//设置模板引擎
app.set('view engine','ejs');

//设置静态目录 
app.use(express.static(path.join(__dirname,'public')));

//session中间件
app.use(session({
	name: config.session.key,//设置cookie中保存session id的字段名称
	secret: config.session.secret,//通过设置secret来计算hash值并放在cookie中，使产生的signedCookie防篡改
	resave: true,//强制更新session
	saveUninitialized: false,//设置为false,强制创建一个session，即使用户未登录
	cookie: {
		maxAge: config.session.maxAge //过期时间，过期后cookie中的session id自动删除
	},
	store: new MongoStore({ //将session 储存到mogodb
		url: config.mongodb //mongodb地址
	})

}));

//flash中间件，用来显示已通知
//
app.use(flash());
//
//处理表单及文件上传的中间件
app.use(formidable({
  uploadDir: path.join(__dirname, 'public/img'),//上传文件夹
  keepExtensions: true,// 保留后缀
  multiples: true, // req.files to be arrays of files 
}));

//设置模板全局变量
app.locals.blog = {
	title: pkg.name,
	description: pkg.description
};

//添加模板必须的三个变量
app.use(function(req,res,next){
	res.locals.user = req.session.user;
	res.locals.success = req.flash('success').toString();
	res.locals.error = req.flash('error').toString();
	next();
});

//请求日志
app.use(expressWinston.logger({
	transports: [
		new (winston.transports.Console)({
			json: true,
			colorize: true
		}),
		new winston.transports.File({
			filename: 'logs/success.log'
		})
	]
}))

//路由
routes(app);

//错误日志
app.use(expressWinston.errorLogger({
	transports: [
		new winston.transports.Console({
			json: true,
			colorize: true
		}),
		new winston.transports.File({
			filename: 'logs/error.log'
		})
	]
}))

//处理错误
app.use(function(err,req,res,next){
	res.render('error',{
		error: err
	})
})

//监听端口
if (module.parent) {
	//如果index被require，则导出require
	module.exports = app;
} else {
	const port = process.env.PORT || config.port;
	console.log(config.mongodb)
	app.listen(config.port, function(){
		console.log(`${pkg.name} listening on port ${config.port}`);
	})
}
