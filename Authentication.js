
let IsLoggedIn=function(req,res,next)
{
    if(req.user && req.user.EMAIL)
    {
        next();
    }
    else
    {
      res.render('signup');  
    }
}
module.exports={
    IsLoggedIn:IsLoggedIn
}