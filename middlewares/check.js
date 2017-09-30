module.exports = {
	checkLogin: function checkLogin(req,res,next){
		if(!req.session.user){
			req.flash({'error':'未登录'});
			return res.redirect('/signin');
		}
		next();
	},
}