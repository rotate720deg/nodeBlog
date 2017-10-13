var express = require('express');
var router = express.Router();
var PostModel = require('../models/posts');
var checkLogin = require('../middlewares/check.js').checkLogin;

//GET /posts 所有用户或特定用户的文章页
// eg: get /posts?author=xxx
router.get('/',function(req,res,next){
	res.render('posts');
});

//POST /posts 发表一篇文章
router.post('/', checkLogin, function(req,res,next){
	var author = req.session.user._id;
});

//get /posts/create 发表文章页
router.get('/create', checkLogin, function(req,res,next){
	res.render('create');
});

//get /posts/:postId 单独一篇文章
router.get('/:postId',function(req,res,next){
	res.send(req.flash());
});

//get /posts/:postId/edit 更新文章页
router.get('/:postId/edit',checkLogin, function(req,res,next){
	res.send(req.flash());
});

//post /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit',checkLogin, function(req,res,next){
	res.send(req.flash());
});

//get /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove',checkLogin, function(req,res,next){
	res.send(req.flash());
});

//post /posts/:postId/comment 创建一条留言
router.post('/:postId/comment',checkLogin, function(req,res,next){
	res.send(req.flash());
});

//get /post/"postId/comment/:commentId/remove 删除一条留言
router.get('/:postId/comment/:commentId/remove',checkLogin, function(req,res,next){
	res.send(req.flash());
}); 

module.exports = router;