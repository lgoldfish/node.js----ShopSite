var mongoose=require("mongoose")
var Book=mongoose.model("Book",{
		title:String,
		num:Number,
		price:Number,
		img:String,
		author:String,
		decriction:String
})
module.exports=Book;