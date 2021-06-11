class ResetPwdRequest {
    constructor(value) {
        this.email=value.email && value.email.toString();
        this.newpwd=value.newpwd && value.newpwd.toString();
        this.newcnfpwd=value.newcnfpwd && value.newcnfpwd.toString();

    }
};
class OtpResetRequest{
    constructor(value) {
        this.otp=value.otp && value.otp.toString();
        this.email=value.email && value.email.toString();
      }
};

class LoginRequest{
    constructor(value)
    {
        this.usrname=value.usrname && value.usrname.toString();
        this.pwd=value.pwd && value.pwd.toString();
    }
};

class SignupRequest{
    constructor(value)
    {
        this.pwd=value.pwd && value.pwd.toString();
        this.cnfpwd=value.cnfpwd && value.cnfpwd.toString();
        this.usrname=value.usrname && value.usrname.toString();
        this.email=value.email && value.email.toString();
        this.phnNum=value.phnNum && value.phnNum.toString();
    }
};

class OtpSignupRequest{
    constructor(value)
    {
        this.otp=value.otp && value.otp.toString();
        this.email=value.email && value.email.toString();
    }

};
module.exports = {
    ResetPwdRequest:ResetPwdRequest,
    OtpResetRequest:OtpResetRequest,
    LoginRequest:LoginRequest,
    SignupRequest:SignupRequest,
    OtpSignupRequest:OtpSignupRequest
};

