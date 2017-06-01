var express=require("express")
var router=express.Router()
var path=require("path")
var Book=require(path.join(__dirname,"../models/Book.js"))
var fs=require("fs")
var multer=require("multer")
var upload=multer({dest:"public/images/"})
var User=require(path.join(__dirname,"../models/User.js"))
// 后台主页路由-----------------------------
router.get("/",(req,res)=>{
	var page=req.query.page||1;
	var pageCount=5;
	var books=null;
	Book.count().then((aCount) => {
    Book.find({}).skip((page-1)*pageCount).limit(pageCount).sort({ _id: -1 }).then((data) => {
    	books = data;
        var username = null;
        if (req.cookies.username) {
            username = req.cookies.username;
            User.findOne({ name: username }).then((data) => {
            	console.log(data)
                if (data) {
                    res.render('shops/index', { books, title: "诚品书店 BookStore", username:req.cookies.username, isAdmin: data.isAdmin,booksCount:Math.ceil(aCount/pageCount),currentPage:page});
                    } else {
                        res.render('shops/index', { books, title: "诚品书店 BookStore", username:req.cookies.username, isAdmin: false,booksCount:Math.ceil(aCount/pageCount),currentPage:page});
                    }
                }, (e) => {
                    res.render('shops/index', { books, title: "诚品书店 BookStore", username:req.cookies.username, isAdmin: false,booksCount:Math.ceil(aCount/pageCount),currentPage:page });
                })
            } else {
                res.render('shops/index', { books, title: "诚品书店 BookStore", username:req.cookies.username, isAdmin: false,booksCount:Math.ceil(aCount/pageCount),currentPage:page });
            }
        }, (err) => {
            console.log("查询数据库失败")
        })
    }, (err) => {
        res.send("查询数据总条数失败")
    })
})
//商品添加路由-----------------------------
router.get("/insert",(req,res)=>{
	res.render("shops/insert")
})
router.post("/insert",upload.single("shopimage"),(req,res)=>{
	console.log(req.file)
	console.log(req.body)
	if(req.file){
		var extname=path.extname(req.file.originalname)
		var oldPath="public/images/"+req.file.filename;
		var newPath="public/images/"+req.file.filename+extname;
		console.log(oldPath,newPath)
		fs.rename(oldPath,newPath,(err,data)=>{
			if(err){
				res.render("message/errorMessage",{
					urlPath:"/shops/insert",
					message:"图片上传成功 修改失败"
				})
			}else{
				req.body.img=req.file.filename+extname;
				Book.create(req.body).then((data)=>{
					if(data){
						res.render("message/errorMessage",{
							urlPath:"/shops/",
							message:"数据插入成功"
						})
					}else {
						res.render("message/errorMessage",{
							urlPath:"/shops/insert",
							message:"数据插入失败"
						})
					}
				},(err)=>{
					res.render("message/errorMessage",{
							urlPath:"/shops/insert",
							message:"数据插入时发生错误"
					})
				})
			}
		})
	}else {
		res.render("message/errorMessage",{
						urlPath:"/shops/insert",
						message:"图片上传失败 请求重试"
		})
	}
})
// 商品修改路由----------------------------
router.get("/update/:id",(req,res)=>{
	Book.findById(req.params.id).then((data)=>{
		res.render("shops/update",{book:data})
	},(err)=>{
		res.render("message/errorMessage",{
			urlPath:"/shops/",
			message:"商品查询失败，请重试"
		})
	})
})
router.post("/update",upload.single("modifyimage"),(req,res)=>{
	if(req.file){
		var extname=path.extname(req.file.originalname)
		var oldPath="public/images/"+req.file.filename;
		var newPath="public/images/"+req.file.filename+extname;
		fs.rename(oldPath,newPath,(err,data)=>{
			if(err){
				fs.unlink(oldPath)
				res.render("message/errorMessage",{
					urlPath:"/shops/",
					message:"图片上传成功修改失败"
				})
			}else {
				var originalname=req.body.img;
				req.body.img=req.file.filename+extname;
				Book.update({_id:req.body._id},{$set:req.body}).then((data)=>{
					if(data){
						fs.unlink("public/images/"+originalname)
						res.render("message/errorMessage",{
							urlPath:"/shops/",
							message:"商品信息修改成功"
						})
					}else {
						fs.unlink("public/images/"+req.body.img)
						res.render("message/errorMessage",{
							urlPath:"/shops/update",
							message:"商品信息修改失败,请重试"
						})
					}
				},
				(err)=>{
					fs.unlink("public/images/"+req.body.img)
					res.render("message/errorMessage",{
						urlPath:"/shops/update",
						message:"商品信息修改失败，请重试"
					})
				})
			}
		})
	}else {
		Book.update({_id:req.body._id},{$set:req.body})
		.then((data)=>{
			res.render("message/errorMessage",{
			urlPath:"/shops/",
			message:"商品修改成功,跳转到主页"
		})
		},(err)=>{
			res.render("message/errorMessage",{
			urlPath:"/shops/update",
			message:"商品修改失败,请重试"
			})
		})
	}
})
//商品删除路由------------------------------
router.get("/remove/:id/:imgname",(req,res)=>{
	Book.remove({_id:req.params.id}).then((data)=>{
		if(data){
			fs.unlink("public/images/"+req.params.imgname)
			res.render("message/errorMessage",{
				urlPath:"/shops/",
				message:"商品删除成功"
			})
		}else {
			res.render("message/errorMessage",{
				urlPath:"/shops/",
				message:"删除条件不对,但是数据库删除失败"
			})
		}
	},(err)=>{
		res.render("message/errorMessage",{
			urlPath:"/shops/",
			message:"商品删除失败，条件数据类型不对"
		})
	})
})
module.exports=router;