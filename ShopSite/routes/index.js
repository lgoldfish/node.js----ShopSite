var express = require('express');
var router = express.Router();
var path = require("path")
var Book = require(path.join(__dirname, "../models/Book.js"))
var User = require(path.join(__dirname, "/../models/User"))
router.get('/', function(req, res, next) {

    // 分页--------------------
    var page = req.query.page || 1;
    var pageCount = 4;
    // ------------------------
    var books = null;
    Book.count().then((aCount) => {
        Book.find().skip((page-1)*pageCount).limit(pageCount).sort({ _id: -1 }).then((data) => {
            books = data;
            var username = null;
            if (req.cookies.username) {
                username = req.cookies.username;
                User.findOne({ name: username }).then((data) => {
                    if (data) {
                        res.render('index', { 
                            books, 
                            title: "诚品书店 BookStore",
                            username,
                            isAdmin: data.isAdmin,
                            booksCount:Math.ceil(aCount/pageCount),
                            currentPage:page,userid:data._id
                        })
                    } else {
                        res.render('index', { books, title: "诚品书店 BookStore", username, isAdmin: false,booksCount:Math.ceil(aCount/pageCount),currentPage:page,userid:data._id});
                    }
                }, () => {
                    res.render('index', { books, title: "诚品书店 BookStore", username, isAdmin: false,booksCount:Math.ceil(aCount/pageCount),currentPage:page,userid:data._id });
                })
            } else {
                res.render('index', { books, title: "诚品书店 BookStore", username, isAdmin: false,booksCount:Math.ceil(aCount/pageCount),currentPage:page,userid:data._id });
            }
        }, (err) => {
            console.log("查询数据库失败")
        })
    }, (err) => {
        res.send("查询数据总条数失败")
    })
})

router.get("/detail/:id", (req, res, next) => {
    Book.findById(req.params.id)
        .then((data) => {
            res.render("detail", { data })
            console.log("888888",data)
        }, (err) => {
            next()
        })
})
module.exports = router;
