var express =require("express")
var router=express.Router()
var path=require("path")
var Book=require(path.join(__dirname,"../models/Book.js"))
var Cart=require(path.join(__dirname,"../models/Cart.js"))
var moment=require("moment")
router.get("/",(req,res)=>{
	Cart.find().sort({_id:-1}).then((data)=>{
		// console.log("data",data)
		var cartsshop=[];
		var EventEmitter=require("events").EventEmitter
		var event=new EventEmitter()
		event.on("next",addResult)
		// var j=0;
		function addResult(book){
			cartsshop.push(book)
			// j++;
			if(cartsshop.length==data.length){
				var total=0;
				for (var i=0; i<cartsshop.length;i++){
					total+=cartsshop[i].book.price*cartsshop[i].num;
				}
				res.render("carts/cart",{
					carts:cartsshop,
					total
				})
			}
		}
		for(let index in data){
			Book.findById(data[index].bookid).sort({_id:-1}).then((book)=>{
				var newObj={}
				// console.log("book",book)
				newObj.book=book;
				newObj.bookid=data[index].bookid;
				newObj.userid=data[index].userid;
				newObj.num=data[index].num;
				newObj._id=data[index]._id;
				newObj.createtime=moment(data[index].createtime).format("YYY-MM-DD hh:mm:ss:sss")
				event.emit("next",newObj)
			})
		}
	},(err)=>{
		res.send("查询发生错误"+err)
	}).catch((err)=>{
		res.send("捕获的错误"+err)
	})
})


// ---------------------------------------------------------------------------------------------
router.get("/add",(req,res)=>{
	console.log("userid:",req.query.userid);
	console.log("bookid:",req.query.bookid);
	if(!req.cookies.username){
		res.redirect("/users/login");
		return;
	}

	if(!req.query.userid || !req.query.bookid){
		res.send("没有提交参数");
		return;
	}

	Cart.findOne({bookid:req.query.bookid}).then((data)=>{
		if(data){
			console.log("已经存在商品:",data);
			data.num = data.num+1;
			var cartnum = data.num;
			Cart.update({bookid:req.query.bookid},{$set:{
				num:data.num
			}}).then((data)=>{
				Book.findById(req.query.bookid).then((mybook)=>{
					try{
						console.log("mybook",mybook)
						var newObj = mybook.toObject();
						console.log("newObj",newObj)
						newObj.cartnum = cartnum; 
						console.log("newObj.cartnum ",newObj)
					}catch(e){
						console.log("拷贝错误",e);
					}
					res.render("carts/cartAdd",{
						book:newObj
					})
				})
			},(err)=>{
				res.send("更新时发生错误");
			}).catch((err)=>{
				res.send("捕获的错误"+err);
			})
		}else {
			console.log("req.query01",req.query)
			req.query.num =1;
			req.query.createtime = new Date();
			console.log("req.query02",req.query)
			Cart.create(req.query).then((data)=>{
				if(data){
					Book.findById(req.query.bookid).then((mybook)=>{
						var newObj = {};
						newObj.title = mybook.title;
						newObj.price = mybook.price;
						newObj.img = mybook.img;
						newObj.cartnum = 1;
						newObj._id = mybook._id;
						console.log("newObj:",newObj);
						res.render("carts/cartAdd",{
							book:newObj
						})
					})
				}
			})
		}
	}).catch((err)=>{
		res.send("外层捕获的错误"+err);
	})
})
module.exports=router;