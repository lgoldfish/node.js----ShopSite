var express = require('express');
var router = express.Router();
var path=require("path")
var User=require(path.join(__dirname,"/../models/User"))
var Message=require(path.join(__dirname+"/../libs/Message"))
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get("/login",(req,res)=>{
	res.render("users/login")
})
router.get("/regist",(req,res)=>{
	res.render("users/regist")
})
router.post("/login",(req,res)=>{
	if(req.body["name"]&&req.body["password"]){
		var name=req.body["name"]
		var password=req.body["password"]
		User.findOne({name}).then((data)=>{
			if(data){
				if(password==data.password){
					res.cookie('username', data.name);
					// res.render("message/errorMessage",{
					// 	urlPath:"/",
					// 	message:"登录成功"
					// })
					Message.showSuccess("/","登录成功",res)
				}else {
					// res.render("message/errorMessage",{
					// urlPath:"/users/login",
					// message:"用户密码错误"
					// })
					Message.showError("用户密码错误",res)
				}
			}else {
				// res.render("message/errorMessage",{
				// 	urlPath:"/users/login",
				// 	message:"不存在该用户名称"
				// })
				Message.showError("不存在该用户名称",res)
			}
		},(err)=>{
			Message.showError("服务器错误,请求重试",res)
			// res.render("message/errorMessage",{
			// 	urlPath:"/users/login",
			// 	message:"服务器错误，请求重试"
			// })
		})
	}else {
		Message.showError("没有提交用户名和密码",res);
		// res.render("message/errorMessage",{
		// 	urlPath:"/users/login",
		// 	message:"没有提交用户名和密码"
		// })
	}
})
router.post("/regist",(req,res)=>{
	if(req.body["name"]&&req.body["password"]&&req.body.email){
		var name=req.body.name;
		User.findOne({name}).then((data)=>{
			if(data){
				res.render("message/errorMessage",{
					urlPath:"/users/regist",
					message:"用户已经存在"
				})
			}else {
				req.body.isAdmin=req.body.isAdmin?true:false
				if(req.body.name=="admin"){
					req.body.isAdmin = true;
				}
				User.create(req.body).then((data)=>{
					if(data){
						res.cookie("username",data.name)
						res.render("message/errorMessage",{
								urlPath:"/",
								message:"恭喜注册成功 跳转到主页"
						});
					}else {
						res.render("message/errorMessage",{
								urlPath:"/users/regist",
								message:"用户注册失败,请重试"
						});
					}
				})
			}
		},(err)=>{
			res.render("message/errorMessage",{
				urlPath:"/users/regist",
				message:"服务器发生错误"
			})
		})
	}else {
		res.render("message/errorMessage",{
				urlPath:"/users/regist",
				message:"没有提交注册的用户信息"
		})
	}
})
router.get("/loginout",(req,res)=>{
	res.clearCookie("username")
	res.redirect("/")
})
module.exports = router;
