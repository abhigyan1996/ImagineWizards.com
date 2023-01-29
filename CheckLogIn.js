
let checkLogIn=function(req,res,next)
{
    if(req.user && req.user.EMAIL)
    {
        next();
    }
    else
    {
    //   res.render('signup');  
        let response = {status:"NotLoggedIn"};
        res.send(response)
        return;
    }
}
module.exports={
    checkLogIn:checkLogIn
}