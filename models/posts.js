var marked = require('marked');
var Post = require('../lib/mongo').Post;
var CommentModel = require('./comments');

//将post 的 content 从 markdown 转换为 html\
Post.plugin('contentToHtml',{
	afterFind: function(posts){
		return posts.map(function(post){
			post.content = marked(post.content);
			return post;
		})
	},
	afterFindOne: function(post){
		post.content = marked(post.content);
		return post;
	}
});

//给 post 添加留言数 commentsCount
Post.plugin('addCommentCount', {
	afterFind: function(posts){
		return Promise.all(posts.map(function(post){
			return CommentModel.getCommentsCount(post._id)
			.then(function(commentsCount){
				post.commentsCount = commentsCount;
				return post;
			});
		}));
	},
	afterFindOne: function(post){
		if(post){
			return CommentModel.getCommentsCount(post._id)
			.then(function(commentsCount){
				post.commentsCount = commentsCount;
				return post;
			});
		}
		return post;
	}
})
module.exports = {
	//创建一篇文章
	create: function create(post){
		return Post.create(post).exec();
	},

	//通过文章id获取一篇文章
	getPostById: function getPostById(postId){
		return Post
		.findOne({_id: postId})
		.populate({path: 'author', model: 'User'})
		.addCreateAt()
		.addCommentCount()
		.contentToHtml()
		.exec();
	},

	//按创建时间降序获取所有用户文章或某个用户的所有文章
	getPosts: function getPosts(author){
		var query = {};
		if (author) {
			query.author = author;
		}
		return Post
		.find(query)
		.populate({path: 'author', model: 'User'})
		.sort({_id: -1})
		.addCreateAt()
		.addCommentCount()
		.contentToHtml()
		.exec();
	},

	//通过文章 id 给 pv 加 1
	incPv: function incPv(postId){
		return Post
		.update({_id: postId},{$inc:{pv: 1}})
		.exec()
	},

	//通过文章iD获取一篇原生文章（编辑文章）
	getRawPostId: function getRawPostId(postId){
		return Post
		.findOne({_id: postId})
		.populate({path: 'author', model: 'User'})
		.exec();
	},

	//通过用户id 和文章 id 更新一篇文章
	updatePostById: function updatePostById(postId, author, data){
		return Post.update({author: author, _id: postId},{$set: data}).exec();
	},

	//通过用户id 和文章id 删除一篇文章
	delPostById: function delPostById(postId, author){
		return Post.remove({author: author, _id: postId})
		.exec()
		.then(function(res){
			//文章删除后，再删除文章下的留言
			if(res.result.ok && res.result.n > 0){
				return CommentModel.delCommentsByPostId(postId);
			}
		})
	}
};