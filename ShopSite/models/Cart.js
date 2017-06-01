var mongoose=require("mongoose")
var Car=mongoose.model("Car",{
	userid:String,
	bookid:String,
	num:Number,
	createtime:Date
})
module.exports=Car;