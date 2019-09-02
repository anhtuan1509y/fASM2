var express = require('express');
var router = express.Router();

const expressSession = require('express-session')
const {check, validationResult} = require('express-validator')
const client = require('../pg')

let sess

router.get('/',(req,res)=>{
    sess = req.session
    if(sess.user){
        res.redirect('./list')
    } else{
    res.render('login')
    }
})


router.post('/',[
    check('user').isEmail().withMessage("This's not email"),
    check('password').isLength({min: 5, max:10}).withMessage("Require password has min 5 character and max is 10 character")
],(req,res)=>{
   var errors = validationResult(req)
   if(!errors.isEmpty()){
       if(errors.errors.length == 2){
           console.log( errors.errors)
           if(errors.errors[0].param == "user"){
            res.render('login',{Eremail:  errors.errors[0].msg, Erpass:  errors.errors[1].msg})
            console.log("vao 2")
           }else{
            console.log("vao pass 1")
            res.render('login',{Erpass: errors.errors[0].msg})
           }
       }else{
           console.log("alo: " +errors.errors[0].param)
           if(errors.errors[0].param == "user"){
            console.log("vao user")
            res.render('login',{Eremail: errors.errors[0].msg})
           }else{
            console.log("vao pass")

            res.render('login',{Erpass: "Wrong password or username"})
           }
       }
   } else{
    let user = req.body.user
    let password = req.body.password
    let sql = "Select * from accounts where username ='" + user + "'"
    client.query(sql)
    .then(result =>{
        if(result.rowCount == 0){
            res.render('login',{Erlogin: "Wrong username or password"})
        } else{
            let sql = "select * from accounts where username ='" + user +"'"
            client.query(sql)
            .then(result =>{
                sess = req.session
                sess.user = result.rows[0].username
                sess.pass = result.rows[0].password
                console.log(result.rows[0].password + " | " + password)
                if(result.rowCount == 1 && password == result.rows[0].password){
                    res.redirect('/list')
                    console.log(sess.user)
                    console.log(sess.pass)
                } else{
                    res.render('login',{Erlogin: "Wrong password or username"})
                }
            }) .catch(err =>{
                console.log(err)
            })
        }
    }) .catch(err =>{
        console.log(err)
    })
   }
})

router.get("/forgot",(req,res)=>{
    res.render('Pforgot')
})

router.post("/forgot",(req,res)=>{
    let email = req.body.email
    let sql = "select * from accounts where username ='" +  email + "'"
    client.query(sql)
    .then(result =>{ 
        if(result.rowCount == 1){
            console.log(result.rows.password)
            res.render("Pforgot",{pass: result.rows[0].password})
        } else{
            res.render("Pforgot",{Erpass: "Email does not exist"})
        }
    }) 
})

router.get('/list',(req,res)=>{
    sess = req.session
   if(sess.user){
    let sql = "Select * from products"
    client.query(sql)
    .then(result =>{
        console.log(result.rowCount)
        res.render('list', {lProduct: result, name: sess.user})
    }) .catch(err =>{
        console.log(err)
    })
   } else{
       res.redirect('./')
   }
})

router.get('/delete/:id',(req,res)=>{
    sess = req.session
    if(sess.user){
        let id = req.params.id
    let sql = "delete from products where id = '" + id + "'"
    client.query(sql)
    .then(result =>{
        if(result.rowCount == 1){
           res.redirect('../list')
        }
    }) .catch(err =>{
        console.log(err)
    })
    } else{
        res.redirect('./')
    }
})

router.get('/add',(req,res)=>{
    sess = req.session
    if(sess.user){
        console.log("add session: " + sess.user)
    res.render('add')
    } else{
        res.redirect('./')
    }
})

router.post('/add',(req,res)=>{
    let name = req.body.name
    let price = req.body.price
    let img = req.body.img
    let dsc = req.body.dsc

    let sql = "insert into products(name,price,img,dsc) values('"+ name +"','"+ price + "','" + img +"','" + dsc +"')"
    client.query(sql)
    .then(result =>{
        res.redirect('./list')
    }) .catch(err =>{
        console.log(err)
    })
})

router.get("/edit/:id",(req,res) =>{
    let id = req. params.id
    let sql  = "Select * from products where id = '" +  id + "'"
    client.query(sql)
    .then(result =>{
        res.render('edit',{product: result.rows[0]})
    }) .catch(err =>{
        console.log(err)
    })
})

router.post("/edit/:id",(req,res) =>{
    let id = req. params.id
    let name = req.body.name
    let price = req.body.price
    let img = req.body.img
    let dsc = req.body.dsc

    let sql  = "Update products set name = '"+ name + "', price ='" + price + "', img = '"+ img +"', dsc = '"+ dsc +"' where id = '" +  id + "'"
    client.query(sql)
    .then(result =>{
        res.redirect('../list')
    }) .catch(err =>{
        console.log(err)
    })
})

router.get('/create',(req,res) =>{
    res.render('create')
})

function checkEmailExist(email){
    console.log(email)
    let sql = "select * from accounts where username = '" + email +"'"
    client.query(sql)
    .then(result =>{
        if(result.rowCount == 0){
            console.log("vao chua ton tai")
            return true
        } else{
            console.log("vao da ton tai")
            return false
        }
    }) .catch(err =>{
        console.log(err)
    })
}

router.post('/create', [
    check('user').isEmail().withMessage("Require email").escape(),
    check('password').isLength({min: 5, max: 10}).withMessage("Need min 5 character an max 10 character")
] ,(req,res) =>{
    let errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors.errors)
        if(errors.errors.length == 2){
            res.render('create',{Eremail: errors.errors[0].msg, Erpass: errors.errors[1].msg})
        } else{
            if(errors.errors.param == 'user'){
                res.render('create',{Eremail: errors.errors[0].msg})
            } else{
                res.render('create',{Erpass: errors.errors[0].msg})
            }
        }
    } else{
        let user = req.body.user
        let password = req.body.password
        let sql = "select * from accounts where username = '" + user +"'"
        client.query(sql)
        .then(result =>{
            if(result.rowCount == 0){
               let sql = "insert into accounts(username, password, roles) values('"+ user +"','" + password +"','0')"
               client.query(sql)
               .then(result =>{
                   res.redirect('./')
               }) .catch(err =>{
                   console.log(err)
               })
            } else{
                console.log("Tai khoan da duoc tao")
                res.render('create',{exist: "Account has been exist"})
            }
        }) .catch(err =>{
            console.log(err)
        })
    }
})


module.exports = router;
