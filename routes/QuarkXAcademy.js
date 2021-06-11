const express = require("express");
const router = express.Router();
router.use(express.json());
const mongoose = require("mongoose");
const USER_PREMIUM_COLLECTION =require("../models/USER_PREMIUM_COLLECTION");
const All_QUESTIONS_COLLECTION =require("../models/ALL_QUESTIONS_COLLECTION");
const STUDENT_PERFORMANCE_COLLECTION = require("../models/STUDENT_PERFORMANCE_COLLECTION");
const STUDENT_LEADERBOARD_COLLECTION = require("../models/STUDENT_LEADERBOARD_COLLECTION");
const CHAPTER_IMG_COLLECTION = require("../models/CHAPTER_IMG_COLLECTION");
const CONCEPT_IMG_COLLECTION = require("../models/CONCEPT_IMG_COLLECTION");
const COURSE_IMG_COLLECTION = require ("../models/COURSE_IMG_COLLECTION");
const USER_PROFILE_COLLECTION = require ("../models/USER_PROFILE_COLLECTION");


const moment=require("moment");
var {IsLoggedIn}=require("../Authentication");
const ALL_QUESTIONS_COLLECTION = require("../models/ALL_QUESTIONS_COLLECTION");
const { Console } = require("winston/lib/winston/transports");


router.post("/TrialPurchase",IsLoggedIn, async function (req, res, next) {
     try
    {
        if(req.body.Class==null || req.body.Course==null)
        {
            res.render('error');
            //logger
            return;
        }
        
        let ExpiryDate=moment(new Date()).add(7, 'd');
        //      

        let premiumData = await USER_PREMIUM_COLLECTION.findOne({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, EMAIL: req.user.EMAIL});
        let trialFlag = 0;
        if(premiumData) {
            trialFlag = 1;
        }

        if(trialFlag == 0) {
            let ObjUserPremiumCollection=new USER_PREMIUM_COLLECTION({
                TRIAL_FLAG:1,
                EXPIRY_DATE_TIME:ExpiryDate,
                EMAIL:req.user.EMAIL,
                CLASS_ID:req.body.Class,
                COURSE_ID:req.body.Course
            });
            
        await ObjUserPremiumCollection.save();
        }
           
            
            let MyCoursesArr = await USER_PREMIUM_COLLECTION.find({EMAIL:req.user.EMAIL});

            // if(MyCoursesArr.length == 0) {
            //     res.send("You have not yet subscribed to any course");
            //     return;
            // }
    
            let availableCourses=[];
            let availableClasses = [];
    
            let currentDateTime = moment(Date.now());
            var timediffinsec;
            let y = 0;
    
            for(let i=0;i<MyCoursesArr.length;i++)
            {
                timediffinsec = parseInt(moment.duration(currentDateTime.diff(MyCoursesArr[i] && MyCoursesArr[i].EXPIRY_DATE_TIME)).asSeconds(),10);
                if(timediffinsec < 0) {
                    availableCourses[y++] = MyCoursesArr[i].COURSE_ID;
                    availableClasses[y++] = MyCoursesArr[i].CLASS_ID;
                }
            }
      
        //     if(availableCourses.length == 0 || availableClasses.length == 0) {
        //         res.send("Your Subscription has expired");
        //         return;
        //      }
            
            let allCourses =await COURSE_IMG_COLLECTION.find({CLASS_ID: { $in: availableClasses }, COURSE_ID: { $in: availableCourses }});

            // res.send("You have subscribed courses available");
            res.render('MyCourses',{allCourses:allCourses, username:req.body.username});
            return;
     

            // res.send("Details are successfully saved in premium table");
            // return;
            
     }
    catch(err)
    {
      res.render('error');
      return;
      //logger
    }
});


router.get("/MyCourses", IsLoggedIn, async function(req, res, next) {
    try{
        
        //Fetch User Name
        let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
        let username = userStr.USERNAME;
        username = username.substr(0, username.indexOf(' '));
        
        let MyCoursesArr = await USER_PREMIUM_COLLECTION.find({EMAIL:req.user.EMAIL});

        if(MyCoursesArr.length == 0) {
            let allCourses =await COURSE_IMG_COLLECTION.find({});  
            res.render('ViewAllCourses', {Courses: allCourses, loginFlag: 1, username: username});  
            return;
        }

        let availableCourses=[];
        let availableClasses = [];

        let currentDateTime = moment(Date.now());
        var timediffinsec;
        let y = 0;

        for(let i=0;i<MyCoursesArr.length;i++)
        {
            timediffinsec = parseInt(moment.duration(currentDateTime.diff(MyCoursesArr[i] && MyCoursesArr[i].EXPIRY_DATE_TIME)).asSeconds(),10);
            if(timediffinsec < 0) {
                availableCourses[y++] = MyCoursesArr[i].COURSE_ID;
                availableClasses[y++] = MyCoursesArr[i].CLASS_ID;
            }
        }

        if(availableCourses.length == 0 || availableClasses.length == 0) {
            let allCourses =await COURSE_IMG_COLLECTION.find({});  
            res.render('ViewAllCourses', {Courses: allCourses, loginFlag: 1, username: username});  
            return;
        }
        
        let allCourses =await COURSE_IMG_COLLECTION.find({CLASS_ID: { $in: availableClasses }, COURSE_ID: { $in: availableCourses }});

       // res.send("You have subscribed courses available");
        if (allCourses) {
            res.render('MyCourses',{allCourses:allCourses, username:username});
            return;
        }

        else {
            res.send("Select A Course you want to buy wala page");
        }
       return;
    }
       // 
    catch(err)
    {
      res.send("Error occured");
      //logger
      return;
    }
})


router.post("/PostQuestions", IsLoggedIn, async function(req, res, next){
    try{

        if(!req.body.Class || !req.body.Course || !req.body.Chapter || !req.body.Concept || !req.body.Question
            || !req.body.optA || !req.body.optB || !req.body.optC || !req.body.optD || !req.body.CorrectOption
            || !req.body.Explanation || !req.body.ChapNum || !req.body.ConceptNum)
            
        {
            res.send("Invalid Request Parameters");
            //logger
            return;
        }

        if(req.user.EMAIL != "abhigyankashyap82@gmail.com") {
            res.send("You are not an admin");
            return;
        }

        let Ques_Img_flag = (req.body.QImage.length>0)?1:0;;
        let Ans_img_flag = (req.body.AnsImg.length>0)?1:0;

        let PostAllQuestionsObj = new All_QUESTIONS_COLLECTION({
            CLASS_ID: req.body.Class,
            COURSE_ID: req.body.Course,
            CHAPTER_ID: req.body.Chapter,
            CONCEPT_ID: req.body.Concept,
            QUESTION: req.body.Question,
           // QUESTION_ID: req.body.QuestionID,
            Q_IMG: req.body.QImage,
            OptionA: req.body.optA,
            OptionB: req.body.optB,
            OptionC: req.body.optC,
            OptionD: req.body.optD,
            CORRECT_OPT: req.body.CorrectOption,
            EXPLANATION: req.body.Explanation,
            EXPLANATION_IMAGE: req.body.AnsImg,
            SCORE: req.body.Score,
            QUESTION_IMG_FLAG: Ques_Img_flag,
            ANS_IMG_FLAG: Ans_img_flag,
            CHAPTER_NUM:req.body.ChapNum,
            CONCEPT_NUM:req.body.ConceptNum
        });

        try
        {
            await PostAllQuestionsObj.save();
            res.send('Question is successfully submitted');
            return;
            //logger
        }
        catch(err)
        {
            res.send("DB Error");
            //logger
           return;

        }
    }

    catch(err){
        res.send("Error Occured");
        //logger
        return;
    }
})


router.post("/PostCoursesImages", IsLoggedIn, async function(req, res, next){
    try{

        if(!req.body.Class || !req.body.Course || !req.body.CourseImg || !req.body.BuyCourseImg || !req.body.Price)
            
        {
            res.render("error");
            //logger
            return;
        }

        if(req.user.EMAIL != "abhigyankashyap82@gmail.com") {
            res.send("You are not an admin");
            return;
        }

        let PostCourseImgsObj = new COURSE_IMG_COLLECTION({
            CLASS_ID: req.body.Class,
            COURSE_ID: req.body.Course,
            COURSE_IMG : req.body.CourseImg,
            BUY_COURSE_IMG : req.body.BuyCourseImg,
            PRICE: req.body.Price
        });

        try
        {
            await PostCourseImgsObj.save();
            res.send('Course image is successfully submitted');
            //logger
        }
        catch(err)
        {
            res.send("DB Error");
            //logger
        }

    }

    catch(err){
        res.send("Error Occured");
        //logger
    }
})


router.post("/PostChapterImages", IsLoggedIn, async function(req, res, next){
    try{

        if(!req.body.Class || !req.body.Course || !req.body.Chapter || !req.body.ChapImg || !req.body.ChapNum)
            
        {
            res.send("Invalid Request Parameters");
            //logger
        }

        if(req.user.EMAIL != "abhigyankashyap82@gmail.com") {
            res.send("You are not an admin");
            return;
        }

        let PostChapImgsObj = new CHAPTER_IMG_COLLECTION({
            CLASS_ID: req.body.Class,
            COURSE_ID: req.body.Course,
            CHAPTER_ID: req.body.Chapter,
            CHAPTER_IMG : req.body.ChapImg,
            CHAPTER_NUM: req.body.ChapNum
        });

        try
        {
            await PostChapImgsObj.save();
            res.send('Chapter details is successfully submitted');
            //logger
        }
        catch(err)
        {
            res.send("DB Error");
            //logger
        }

    }

    catch(err){
        res.send("Error Occured");
        //logger
    }
})


router.post("/PostConceptImages", IsLoggedIn, async function(req, res, next){
    try{

        if(!req.body.Class || !req.body.Course || !req.body.Chapter || !req.body.Concept|| !req.body.ConceptImg || !req.body.ChapNum || !req.body.ConceptNum)
            
        {
            res.send("Invalid Request Parameters");
            //logger
        }

        if(req.user.EMAIL != "abhigyankashyap82@gmail.com") {
            res.send("You are not an admin");
            return;
        }

        let PostConceptImgsObj = new CONCEPT_IMG_COLLECTION({
            CLASS_ID: req.body.Class,
            COURSE_ID: req.body.Course,
            CHAPTER_ID: req.body.Chapter,
            CONCEPT_ID: req.body.Concept,
            CONCEPT_IMG: req.body.ConceptImg,  
            CHAPTER_NUM: req.body.ChapNum,
            CONCEPT_NUM: req.body.ConceptNum
        });

        try
        {
            await PostConceptImgsObj.save();
            res.send('Concept image is successfully submitted');
            //logger
        }
        catch(err)
        {
            res.send("DB Error");
            //logger
        }

    }

    catch(err){
        res.send("Error Occured");
        //logger
    }
})


router.post('/SolveQuestions', IsLoggedIn, async function(req, res, next) {

    try
    {
     //Class, course, concept, chapter, concept   
     if(!req.body.Concept || !req.body.Chapter || !req.body.Course  || !req.body.Class || !req.body.ChapNum || !req.body.ConceptNum)
     {
         res.json({ResMsg:"Invalid Request Parameters"});
         return;
     }

     //Fetch User Name
     let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
     let username = userStr.USERNAME;
     username = username.substr(0, username.indexOf(' '));

    let AttemptedQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class, EMAIL:req.user.EMAIL});
    let AttemptedQuestionArray=[];
    for(let i=0;i<AttemptedQuestionList.length;i++)
    {
        AttemptedQuestionArray.push(AttemptedQuestionList[i].QUESTION_ID );
    }

    let NewQuestion=await All_QUESTIONS_COLLECTION.findOne({QUESTION_ID: { $nin: AttemptedQuestionArray },CONCEPT_ID:req.body.Concept, CHAPTER_ID:req.body.Chapter, COURSE_ID:req.body.Course, CLASS_ID:req.body.Class});
    if(NewQuestion)
    {
        let Attempts = parseInt(NewQuestion.SCORE.split(" ")[1]);
        let corrects= parseInt(NewQuestion.SCORE.split(" ")[0]);
        let level = 0;     
        level = corrects/Attempts;
        if(Attempts==0) {
            level = 1;
        }        
   
        res.render('SolveQuestions',{Question:NewQuestion.QUESTION,OptionA:NewQuestion.OptionA ,OptionB:NewQuestion.OptionB,OptionC:NewQuestion.OptionC,OptionD:NewQuestion.OptionD,CorrectOption:NewQuestion.CORRECT_OPT ,Explanation:NewQuestion.EXPLANATION,QuestionImg:NewQuestion.Q_IMG ,ExplainationImg:NewQuestion.EXPLANATION_IMAGE,QuestionId:NewQuestion.QUESTION_ID, Ques_Img_flag:NewQuestion.QUESTION_IMG_FLAG, Ans_img_flag:NewQuestion.ANS_IMG_FLAG, Concept:NewQuestion.CONCEPT_ID, Chapter:NewQuestion.CHAPTER_ID, Class:NewQuestion.CLASS_ID, Course:NewQuestion.COURSE_ID, ShowAnswer:0, submittedInput:"", ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, username: username, level: level});
        return;
    }
    else
    {
        //no more questions
        res.render('error');   
        return;
    }
    }
        
    catch(err)
    {
        //something went wrong
        res.json({ResMsg:`Error occured- ${err.message}`});
        return;
    }
})

router.post('/SubmitAnswer', IsLoggedIn, async function(req, res, next) {
    try{
        if(!req.body.quesID || !req.body.Concept || !req.body.Course || !req.body.Class || !req.body.Chapter || !req.body.ChapNum || !req.body.ConceptNum)
         {
            res.send("Invalid Request Parameters");
            return;
            //logger
         }
         
         //Fetch User Name
         let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
         let username = userStr.USERNAME;
         username = username.substr(0, username.indexOf(' '));

        //  console.log(req.body.inputAns);

         //NEWLY ADDED. LAST QUESTION ON SUBMIT WILL REFLECT ON LEADERBOARD IF NOT PROCEEDED.
         let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});          
         let SolvedQList =await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL});
         
        //  let CorrectQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:1});
        //  let SkipQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, INPUT_OPT:"SKIPPED"});     
        //  let WrongQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:0}); 

        //  let CorrectQuestionList=[];
        //  let SkipQuestionList=[];
        //  let WrongQuestionList=[];

        //  for (let i = 0; i<SolvedQList.length;i++) {

        //     if(SolvedQList[i].CORRECT_FLAG == 1) {
        //         CorrectQuestionList.push(SolvedQList[i]);
        //     }
        //     else if(SolvedQList[i].CORRECT_FLAG == 0) {
        //         WrongQuestionList.push(SolvedQList[i]);
        //     }
        //     else if(SolvedQList[i].CORRECT_FLAG == 2) {
        //         SkipQuestionList.push(SolvedQList[i]);
        //     }
        // }

         //Update on Leaderboard only if concept is complete
        if (SolvedQList.length == TotalQuestionList.length) {
            await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
            let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1}).select().populate('LeaderBoardToProfileJoin');
            //let LeaderboardListTopTen=LeaderBoardList.slice(0,10);

            let userRank=0;

            for(let i=0;i<LeaderBoardList.length;i++)
            {
                if(LeaderBoardList[i].EMAIL==req.user.EMAIL)
                {
                    userRank=i+1;
                    break;
                }
            }
            console.log(userRank);
        }
        // NEQLY ADDED TILL HERE
         
         let studentPerformanceObj = new STUDENT_PERFORMANCE_COLLECTION({
            CLASS_ID: req.body.Class,
            COURSE_ID: req.body.Course,
            CHAPTER_ID: req.body.Chapter,
            CONCEPT_ID: req.body.Concept,
            QUESTION_ID: req.body.quesID,
            EMAIL:req.user.EMAIL,
            INPUT_OPT: req.body.inputAns || "SKIPPED",
            CORRECT_FLAG: req.body.CorrectFlag,
            CHAPTER_NUM:  req.body.ChapNum,
            CONCEPT_NUM: req.body.ConceptNum
         })

         try{
             await studentPerformanceObj.save();
              //if(req.body.restartReamining==5)
            //{
                
                let quesDetails=await All_QUESTIONS_COLLECTION.findOne({QUESTION_ID: req.body.quesID});
                let AttemptStr = quesDetails.SCORE.split(" ")[1];
                let correctStR= quesDetails.SCORE.split(" ")[0];
                
                AttemptStr=parseInt(AttemptStr)+1;

                if(req.body.CorrectFlag==1) {
                    correctStR=parseInt(correctStR)+1;  
                }

                let ScoreStr = correctStR.toString()+" "+AttemptStr.toString();
                await All_QUESTIONS_COLLECTION.updateOne({QUESTION_ID: req.body.quesID},{$set:{SCORE:ScoreStr}});
         }
         catch(err) {
             res.render('error');
         }

        try {
            if (!req.body.inputAns) {
                try{
                    let AttemptedQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class, EMAIL:req.user.EMAIL});
                    let AttemptedQuestionArray=[];
                    for(let i=0;i<AttemptedQuestionList.length;i++)
                    {
                        AttemptedQuestionArray.push(AttemptedQuestionList[i].QUESTION_ID );
                    }

                    let NewQuestion=await All_QUESTIONS_COLLECTION.findOne({QUESTION_ID:{ $nin: AttemptedQuestionArray }, CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class});
                    if(NewQuestion)
                    {
                        let Attempts = parseInt(NewQuestion.SCORE.split(" ")[1]);
                        let corrects= parseInt(NewQuestion.SCORE.split(" ")[0]);
                        let level = 0;     
                        level = corrects/Attempts;
                        if(Attempts==0) {
                            level = 1;
                        }
                        res.render('SolveQuestions',{Question:NewQuestion.QUESTION,OptionA:NewQuestion.OptionA ,OptionB:NewQuestion.OptionB,OptionC:NewQuestion.OptionC,OptionD:NewQuestion.OptionD,CorrectOption:NewQuestion.CORRECT_OPT ,Explanation:NewQuestion.EXPLANATION,QuestionImg:NewQuestion.Q_IMG ,ExplainationImg:NewQuestion.EXPLANATION_IMAGE,QuestionId:NewQuestion.QUESTION_ID, Ques_Img_flag:NewQuestion.QUESTION_IMG_FLAG, Ans_img_flag:NewQuestion.ANS_IMG_FLAG, Concept:NewQuestion.CONCEPT_ID, Chapter:NewQuestion.CHAPTER_ID, Class:NewQuestion.CLASS_ID, Course:NewQuestion.COURSE_ID, ShowAnswer:0, submittedInput:"", ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, username: username, level:level});
                        return;
                    }
                    else
                    {
                        try
                    {
                        let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});          
                        let SolvedQList =await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL}).select().populate('PerformanceToAllQuestionCollectionJoin');
                
                        let TotalEasyQueLength=0,TotalMediumQueLength=0,TotalHardQueLength=0;
                        let QuestionScore=0;
                        for (let i=0;i<TotalQuestionList.length;i++)
                        {
                         QuestionScore=parseInt(TotalQuestionList[i].SCORE.split(" ")[0])/parseInt(TotalQuestionList[i].SCORE.split(" ")[1]);
                
                         if((QuestionScore>0.75 && QuestionScore<=1) || TotalQuestionList[i].SCORE.split(" ")[1]==0){
                            TotalEasyQueLength++;
                          }
                  
                          else if(QuestionScore>0.25 && QuestionScore<=0.75){
                            TotalMediumQueLength++;
                          }
                          else if(QuestionScore>=0 && QuestionScore<=0.25){
                            TotalHardQueLength++;
                          }
                        }
                
                        let SolvedEasyQueLength=0,SolvedMediumQueLength=0,SolvedHardQueLength=0;
                
                        let CorrectEasyQLength=0, WrongEasyQLength=0, SkipEasyQLength = 0
                        let CorrectMediumQLength=0, WrongMediumQLength=0, SkipMediumQLength = 0
                        let CorrectHardQLength=0, WrongHardQLength=0, SkipHardQLength = 0
                
                
                        for (let i = 0; i<SolvedQList.length;i++) {
                            QuestionScore=parseInt(SolvedQList[i].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[0])/ parseInt(SolvedQList[i].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[1]);
                            console.log(parseInt(SolvedQList[i].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[0]));
                
                            if((QuestionScore>0.75 && QuestionScore<=1) || SolvedQList[i].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[1]==0){
                                SolvedEasyQueLength++;  //total easy solved
                                if(SolvedQList[i].CORRECT_FLAG == 1) {
                                    CorrectEasyQLength++;    //total correct easy
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 0) {
                                    WrongEasyQLength++;
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 2) {
                                    SkipEasyQLength++;
                                }
                             }
                     
                             else if(QuestionScore>0.25 && QuestionScore<=0.75){
                                SolvedMediumQueLength++;
                                if(SolvedQList[i].CORRECT_FLAG == 1) {
                                    CorrectMediumQLength++;    
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 0) {
                                    WrongMediumQLength++;
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 2) {
                                    SkipMediumQLength++;
                                }
                             }
                             
                             else if(QuestionScore>=0 && QuestionScore<=0.25){
                                SolvedHardQueLength++;
                                if(SolvedQList[i].CORRECT_FLAG == 1) {
                                    CorrectHardQLength++;    
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 0) {
                                    WrongHardQLength++;
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 2) {
                                    SkipHardQLength++;
                                }
                            }
                        }
                
                    let CorrectQuestionLength= CorrectEasyQLength + CorrectMediumQLength + CorrectHardQLength;
                    let SkipQuestionLength= SkipEasyQLength + SkipMediumQLength + SkipHardQLength;
                    let WrongQuestionLength= WrongEasyQLength + WrongMediumQLength + WrongHardQLength;
           
                   
                    var correctScore = CorrectQuestionLength * 4;
                    var wrongScore = -(WrongQuestionLength * 1);
                    var accuracy = 0;

                    accuracy = correctScore + wrongScore;
                     
                    await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
                    let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1}).select().populate('LeaderBoardToProfileJoin');
                    let LeaderboardListTopTen=LeaderBoardList.slice(0,10);

                    let userRank=0;

                    for(let i=0;i<LeaderBoardList.length;i++)
                    {
                        if(LeaderBoardList[i].EMAIL==req.user.EMAIL)
                        {
                            userRank=i+1;
                            break;
                        }
                    }
                             
                    //res.status(200).json({ ErrCode: 0, ResMsg: "Data insertion Successful."});
                     
                    //Newly Added for Restarts
                    let leaderboardData = await STUDENT_LEADERBOARD_COLLECTION.findOne({CHAPTER_ID:req.body.Chapter, CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CONCEPT_ID: req.body.Concept, EMAIL: req.user.EMAIL});
                    let restarts = leaderboardData.RESTARTS;

                    res.render('ConceptDashboardComplete',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionLength, 
                        SkippedQuestions: SkipQuestionLength, WrongQuestions: WrongQuestionLength,
                        Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, username:username, restarts: restarts,
                        CorrectEasyQLength:CorrectEasyQLength, WrongEasyQLength:WrongEasyQLength, SkipEasyQLength:SkipEasyQLength, CorrectMediumQLength:CorrectMediumQLength, WrongMediumQLength:WrongMediumQLength, SkipMediumQLength:SkipMediumQLength, CorrectHardQLength:CorrectHardQLength, WrongHardQLength:WrongHardQLength,
                        SkipHardQLength:SkipHardQLength
                      });
                     return;
                    }

                    catch(err)
                    {
                        console.log("DB Connection Error: "+err.message);
                        res.status(200).json({ ErrCode: 7, ResMsg: "DB Connection Error"});
                        return;
                    }
                       // res.send("Concept Completed");
                    }
                }
                catch(err) {
                  console.log(err);
                }
            }

            else {
                try{
                    let NewQuestion=await All_QUESTIONS_COLLECTION.findOne({QUESTION_ID:req.body.quesID, CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class});
                    if(NewQuestion)
                    {
                        let Attempts = parseInt(NewQuestion.SCORE.split(" ")[1]);
                        let corrects= parseInt(NewQuestion.SCORE.split(" ")[0]);
                        let level = 0;     
                        level = corrects/Attempts;
                        if(Attempts==0) {
                            level = 1;
                        }
                        res.render('SolveQuestions',{Question:NewQuestion.QUESTION,OptionA:NewQuestion.OptionA ,OptionB:NewQuestion.OptionB,OptionC:NewQuestion.OptionC,OptionD:NewQuestion.OptionD,CorrectOption:NewQuestion.CORRECT_OPT ,Explanation:NewQuestion.EXPLANATION,QuestionImg:NewQuestion.Q_IMG ,ExplainationImg:NewQuestion.EXPLANATION_IMAGE,QuestionId:NewQuestion.QUESTION_ID, Ques_Img_flag:NewQuestion.QUESTION_IMG_FLAG, Ans_img_flag:NewQuestion.ANS_IMG_FLAG, Concept:NewQuestion.CONCEPT_ID, Chapter:NewQuestion.CHAPTER_ID, Class:NewQuestion.CLASS_ID, Course:NewQuestion.COURSE_ID, ShowAnswer:1, submittedInput:req.body.inputAns, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, username: username, level:level});
                        return;
                    }
                    else
                    {
                        try
                    {
                        let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});          
                        let SolvedQList =await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL}).select().populate('PerformanceToAllQuestionCollectionJoin');
                
                        let TotalEasyQueLength=0,TotalMediumQueLength=0,TotalHardQueLength=0;
                        let QuestionScore=0;
                        for (let i=0;i<TotalQuestionList.length;i++)
                        {
                         QuestionScore=parseInt(TotalQuestionList[i].SCORE.split(" ")[0])/parseInt(TotalQuestionList[i].SCORE.split(" ")[1]);
                
                         if((QuestionScore>0.75 && QuestionScore<=1) || TotalQuestionList[i].SCORE.split(" ")[1]==0){
                            TotalEasyQueLength++;
                          }
                  
                          else if(QuestionScore>0.25 && QuestionScore<=0.75){
                            TotalMediumQueLength++;
                          }
                          else if(QuestionScore>=0 && QuestionScore<=0.25){
                            TotalHardQueLength++;
                          }
                        }
                
                        let CorrectQuestionList=[];
                        let SkipQuestionList=[];
                        let WrongQuestionList=[];
                        let SolvedEasyQueLength=0,SolvedMediumQueLength=0,SolvedHardQueLength=0;
                
                        let CorrectEasyQLength=0, WrongEasyQLength=0, SkipEasyQLength = 0
                        let CorrectMediumQLength=0, WrongMediumQLength=0, SkipMediumQLength = 0
                        let CorrectHardQLength=0, WrongHardQLength=0, SkipHardQLength = 0
                
                
                        for (let i = 0; i<SolvedQList.length;i++) {
                            QuestionScore=parseInt(SolvedQList[i].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[0])/ parseInt(SolvedQList[i].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[1]);
                            console.log(parseInt(SolvedQList[i].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[0]));
                
                            if((QuestionScore>0.75 && QuestionScore<=1) || SolvedQList[i].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[1]==0){
                                SolvedEasyQueLength++;  //total easy solved
                                if(SolvedQList[i].CORRECT_FLAG == 1) {
                                    CorrectEasyQLength++;    //total correct easy
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 0) {
                                    WrongEasyQLength++;
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 2) {
                                    SkipEasyQLength++;
                                }
                             }
                     
                             else if(QuestionScore>0.25 && QuestionScore<=0.75){
                                SolvedMediumQueLength++;
                                if(SolvedQList[i].CORRECT_FLAG == 1) {
                                    CorrectMediumQLength++;    
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 0) {
                                    WrongMediumQLength++;
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 2) {
                                    SkipMediumQLength++;
                                }
                             }
                             
                             else if(QuestionScore>=0 && QuestionScore<=0.25){
                                SolvedHardQueLength++;
                                if(SolvedQList[i].CORRECT_FLAG == 1) {
                                    CorrectHardQLength++;    
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 0) {
                                    WrongHardQLength++;
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 2) {
                                    SkipHardQLength++;
                                }
                            }
                        }
                

                    let CorrectQuestionLength= CorrectEasyQLength + CorrectMediumQLength + CorrectHardQLength;
                    let SkipQuestionLength= SkipEasyQLength + SkipMediumQLength + SkipHardQLength;
                    let WrongQuestionLength= WrongEasyQLength + WrongMediumQLength + WrongHardQLength;
                                 
                    var correctScore = CorrectQuestionLength * 4;
                    var wrongScore = -(WrongQuestionLength * 1);
                    var accuracy = 0;

                    accuracy = correctScore + wrongScore;
                   
                    await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
                    let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1}).select().populate('LeaderBoardToProfileJoin');
                    let LeaderboardListTopTen=LeaderBoardList.slice(0,10);
     
                    let userRank=0;
     
                    for(let i=0;i<LeaderBoardList.length;i++)
                    {
                        if(LeaderBoardList[i].EMAIL==req.user.EMAIL)
                        {
                         userRank=i+1;
                         break;
                        }
                    }
                    
                    let leaderboardData = await STUDENT_LEADERBOARD_COLLECTION.findOne({CHAPTER_ID:req.body.Chapter, CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CONCEPT_ID: req.body.Concept, EMAIL: req.user.EMAIL});
                    let restarts = leaderboardData.RESTARTS;

                    //res.status(200).json({ ErrCode: 0, ResMsg: "Data insertion Successful."});
                     
                       res.render('ConceptDashboardComplete',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionLength, 
                        SkippedQuestions: SkipQuestionLength, WrongQuestions: WrongQuestionLength,
                        Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, username:username, restarts:restarts,
                        CorrectEasyQLength:CorrectEasyQLength, WrongEasyQLength:WrongEasyQLength, SkipEasyQLength:SkipEasyQLength, CorrectMediumQLength:CorrectMediumQLength, WrongMediumQLength:WrongMediumQLength, SkipMediumQLength:SkipMediumQLength, CorrectHardQLength:CorrectHardQLength, WrongHardQLength:WrongHardQLength,
                        SkipHardQLength:SkipHardQLength
                      });
                     return;
                    }

                    catch(err)
                    {
                        console.log("DB Connection Error: "+err.message);
                        res.status(200).json({ ErrCode: 7, ResMsg: "DB Connection Error"});
                        return;
                    }
                     //   res.send("Concept Completed");
                    }
                }
                catch (err) {
                    console.log(err);
                }
            }
    }
        catch (err) {
            console.log(err);
        }
    }
    catch (err) {
        console.log(err);
    }
});

router.post('/NextQuestion', IsLoggedIn, async function(req, res, next) {
    try{
        if(!req.body.Concept || !req.body.Course || !req.body.Class || !req.body.Chapter || !req.body.ChapNum || !req.body.ConceptNum)
         {
            res.send("Invalid Request Parameters");
            //logger
            return;
         }
         
         //Fetch User Name
       let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
       let username = userStr.USERNAME;
       username = username.substr(0, username.indexOf(' '));


        try {
            let AttemptedQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class, EMAIL:req.user.EMAIL});
            let AttemptedQuestionArray=[];
            for(let i=0;i<AttemptedQuestionList.length;i++)
            {
                AttemptedQuestionArray.push(AttemptedQuestionList[i].QUESTION_ID );
            }

            let NewQuestion=await All_QUESTIONS_COLLECTION.findOne({QUESTION_ID:{ $nin: AttemptedQuestionArray }, CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class});
            if(NewQuestion)
            {
                let Attempts = parseInt(NewQuestion.SCORE.split(" ")[1]);
                let corrects= parseInt(NewQuestion.SCORE.split(" ")[0]);
                let level = 0;     
                level = corrects/Attempts;
                if(Attempts==0) {
                    level = 1;
                }
                res.render('SolveQuestions',{Question:NewQuestion.QUESTION,OptionA:NewQuestion.OptionA ,OptionB:NewQuestion.OptionB,OptionC:NewQuestion.OptionC,OptionD:NewQuestion.OptionD,CorrectOption:NewQuestion.CORRECT_OPT ,Explanation:NewQuestion.EXPLANATION,QuestionImg:NewQuestion.Q_IMG ,ExplainationImg:NewQuestion.EXPLANATION_IMAGE,QuestionId:NewQuestion.QUESTION_ID, Ques_Img_flag:NewQuestion.QUESTION_IMG_FLAG, Ans_img_flag:NewQuestion.ANS_IMG_FLAG, Concept:NewQuestion.CONCEPT_ID, Chapter:NewQuestion.CHAPTER_ID, Class:NewQuestion.CLASS_ID, Course:NewQuestion.COURSE_ID, ShowAnswer:0, submittedInput:"", ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, username: username, level:level});
                return;
            }
            else
            {
                try
                    {
                        let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});          
                        let SolvedQList =await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL}).select().populate('PerformanceToAllQuestionCollectionJoin');
                
                        let TotalEasyQueLength=0,TotalMediumQueLength=0,TotalHardQueLength=0;
                        let QuestionScore=0;
                        for (let i=0;i<TotalQuestionList.length;i++)
                        {
                         QuestionScore=parseInt(TotalQuestionList[i].SCORE.split(" ")[0])/parseInt(TotalQuestionList[i].SCORE.split(" ")[1]);
                
                         if((QuestionScore>0.75 && QuestionScore<=1) || TotalQuestionList[i].SCORE.split(" ")[1]==0){
                            TotalEasyQueLength++;
                          }
                  
                          else if(QuestionScore>0.25 && QuestionScore<=0.75){
                            TotalMediumQueLength++;
                          }
                          else if(QuestionScore>=0 && QuestionScore<=0.25){
                            TotalHardQueLength++;
                          }
                        }
                
                        let CorrectQuestionList=[];
                        let SkipQuestionList=[];
                        let WrongQuestionList=[];
                        let SolvedEasyQueLength=0,SolvedMediumQueLength=0,SolvedHardQueLength=0;
                
                        let CorrectEasyQLength=0, WrongEasyQLength=0, SkipEasyQLength = 0
                        let CorrectMediumQLength=0, WrongMediumQLength=0, SkipMediumQLength = 0
                        let CorrectHardQLength=0, WrongHardQLength=0, SkipHardQLength = 0
                
                
                        for (let i = 0; i<SolvedQList.length;i++) {
                            QuestionScore=parseInt(SolvedQList[i].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[0])/ parseInt(SolvedQList[i].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[1]);
                            console.log(parseInt(SolvedQList[i].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[0]));
                
                            if((QuestionScore>0.75 && QuestionScore<=1) || SolvedQList[i].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[1]==0){
                                SolvedEasyQueLength++;  //total easy solved
                                if(SolvedQList[i].CORRECT_FLAG == 1) {
                                    CorrectEasyQLength++;    //total correct easy
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 0) {
                                    WrongEasyQLength++;
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 2) {
                                    SkipEasyQLength++;
                                }
                             }
                     
                             else if(QuestionScore>0.25 && QuestionScore<=0.75){
                                SolvedMediumQueLength++;
                                if(SolvedQList[i].CORRECT_FLAG == 1) {
                                    CorrectMediumQLength++;    
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 0) {
                                    WrongMediumQLength++;
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 2) {
                                    SkipMediumQLength++;
                                }
                             }
                             
                             else if(QuestionScore>=0 && QuestionScore<=0.25){
                                SolvedHardQueLength++;
                                if(SolvedQList[i].CORRECT_FLAG == 1) {
                                    CorrectHardQLength++;    
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 0) {
                                    WrongHardQLength++;
                                }
                                else if(SolvedQList[i].CORRECT_FLAG == 2) {
                                    SkipHardQLength++;
                                }
                            }
                        }
                
                    let CorrectQuestionLength= CorrectEasyQLength + CorrectMediumQLength + CorrectHardQLength;
                    let SkipQuestionLength= SkipEasyQLength + SkipMediumQLength + SkipHardQLength;
                    let WrongQuestionLength= WrongEasyQLength + WrongMediumQLength + WrongHardQLength;
                                     
                    var correctScore = CorrectQuestionLength * 4;
                    var wrongScore = -(WrongQuestionLength * 1);
                    var accuracy = 0;

                    accuracy = correctScore + wrongScore;
                   
                    await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
                    let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1}).select().populate('LeaderBoardToProfileJoin');
                    let LeaderboardListTopTen=LeaderBoardList.slice(0,10);
     
                    let userRank=0;
     
                    for(let i=0;i<LeaderBoardList.length;i++)
                    {
                        if(LeaderBoardList[i].EMAIL==req.user.EMAIL)
                        {
                         userRank=i+1;
                         break;
                        }
                    }

                    let leaderboardData = await STUDENT_LEADERBOARD_COLLECTION.findOne({CHAPTER_ID:req.body.Chapter, CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CONCEPT_ID: req.body.Concept, EMAIL: req.user.EMAIL});
                    let restarts = leaderboardData.RESTARTS;

                    //res.status(200).json({ ErrCode: 0, ResMsg: "Data insertion Successful."});
                     
                       res.render('ConceptDashboardComplete',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionLength, 
                        SkippedQuestions: SkipQuestionLength, WrongQuestions: WrongQuestionLength,
                        Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, username:username, restarts:restarts,
                        CorrectEasyQLength:CorrectEasyQLength, WrongEasyQLength:WrongEasyQLength, SkipEasyQLength:SkipEasyQLength, CorrectMediumQLength:CorrectMediumQLength, WrongMediumQLength:WrongMediumQLength, SkipMediumQLength:SkipMediumQLength, CorrectHardQLength:CorrectHardQLength, WrongHardQLength:WrongHardQLength,
                        SkipHardQLength:SkipHardQLength
                      });
                     return;
                    }

                    catch(err)
                    {
                        console.log("DB Connection Error: "+err.message);
                        res.status(200).json({ ErrCode: 7, ResMsg: "DB Connection Error"});
                        return;
                    }
                //res.send("Concept Completed");
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    catch (err) {
        console.log(err);
    }
});


router.post('/ReviewAnswers', IsLoggedIn, async function(req,res,next) {
    try{
        if(!req.body.quesNum || !req.body.Concept || !req.body.Course || !req.body.Class || !req.body.Chapter || !req.body.ChapNum || !req.body.ConceptNum
            || !req.body.easyCorrect || !req.body.easyWrong || !req.body.easySkipped || !req.body.easyUnattemptedLength || !req.body.difficultCorrect || !req.body.difficultWrong
            || !req.body.difficultSkipped || !req.body.difficultUnattemptedLength || !req.body.restarts || !req.body.Price
            )
        {
           res.send("Invalid Request Parameters");
           return;
           //logger
        }

        let AttemptedQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class, EMAIL:req.user.EMAIL}).sort({ANSWER_DATE_TIME: -1});
        let AttemptedQuestionArray=[];
        let submittedInputArray=[];
        for(let i=0;i<AttemptedQuestionList.length;i++)
        {
            AttemptedQuestionArray.push(AttemptedQuestionList[i].QUESTION_ID);
            submittedInputArray.push(AttemptedQuestionList[i].INPUT_OPT);
        }

        let quesId = AttemptedQuestionArray[req.body.quesNum];
        let submittedInput = submittedInputArray[req.body.quesNum];
        let quesNum = req.body.quesNum;

        let NewQuestion =await All_QUESTIONS_COLLECTION.findOne({QUESTION_ID:quesId, CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class});
        if (NewQuestion) {
            quesNum++;
            res.render('ReviewAnswers',{Question:NewQuestion.QUESTION,OptionA:NewQuestion.OptionA ,OptionB:NewQuestion.OptionB,OptionC:NewQuestion.OptionC,OptionD:NewQuestion.OptionD,CorrectOption:NewQuestion.CORRECT_OPT ,Explanation:NewQuestion.EXPLANATION,QuestionImg:NewQuestion.Q_IMG ,ExplainationImg:NewQuestion.EXPLANATION_IMAGE,QuestionId:NewQuestion.QUESTION_ID, Ques_Img_flag:NewQuestion.QUESTION_IMG_FLAG, Ans_img_flag:NewQuestion.ANS_IMG_FLAG, Concept:NewQuestion.CONCEPT_ID, Chapter:NewQuestion.CHAPTER_ID, Class:NewQuestion.CLASS_ID, Course:NewQuestion.COURSE_ID, submittedInput:submittedInput, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme,quesNum: quesNum, restarts: req.body.restarts,
                easyCorrect:req.body.easyCorrect, easyWrong:req.body.easyWrong, easySkipped:req.body.easySkipped, easyUnattemptedLength:req.body.easyUnattemptedLength, difficultCorrect:req.body.difficultCorrect, difficultWrong:req.body.difficultWrong, difficultSkipped:req.body.difficultSkipped, difficultUnattemptedLength:req.body.difficultUnattemptedLength, username:req.body.username, Price:req.body.Price});
            return;
        }

        else {
            var CorrectQuestionLength = parseInt(req.body.easyCorrect) + parseInt(req.body.difficultCorrect);
            var WrongQuestionLength = parseInt(req.body.difficultWrong) + parseInt(req.body.easyWrong);
            var SkipQuestionLength = parseInt(req.body.easySkipped) + parseInt(req.body.difficultSkipped); 

            let easyUnattemptedLength = parseInt(req.body.easyUnattemptedLength);
            let difficultUnattemptedLength = parseInt(req.body.difficultUnattemptedLength);

            var totalQuestions = CorrectQuestionLength + WrongQuestionLength + SkipQuestionLength + easyUnattemptedLength + difficultUnattemptedLength;

            var correctScore = CorrectQuestionLength * 4;
            var wrongScore = -(WrongQuestionLength * 1);
            var accuracy = 0;

            accuracy = correctScore + wrongScore;
            
            let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1}).select().populate('LeaderBoardToProfileJoin');
            let userRank=0;

            for(let i=0;i<LeaderBoardList.length;i++)
            {
                if(LeaderBoardList[i].EMAIL==req.user.EMAIL)
                {
                    userRank=i+1;
                    break;
                }
            }

            let LeaderboardListTopTen=LeaderBoardList.slice(0,10);   
            
            if(totalQuestions == AttemptedQuestionList.length)
                {
                    res.render('ConceptDashboardComplete',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:totalQuestions,CorrectQuestions:CorrectQuestionLength, 
                        SkippedQuestions: SkipQuestionLength, WrongQuestions: WrongQuestionLength,
                        Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, username:req.body.username, restarts:req.body.restarts,
                        easyUnattemptedLength:easyUnattemptedLength, difficultUnattemptedLength:difficultUnattemptedLength,
                        easyCorrect: req.body.easyCorrect, easyWrong:req.body.easyWrong, easySkipped:req.body.easySkipped, difficultCorrect:req.body.difficultCorrect,difficultWrong:req.body.difficultWrong,difficultSkipped:req.body.difficultSkipped, Price:req.body.Price
                    });  
                    return;
                }
    
            res.render('ConceptDashboard',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:totalQuestions,CorrectQuestions:CorrectQuestionLength, 
                    SkippedQuestions: SkipQuestionLength, WrongQuestions: WrongQuestionLength,
                    Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, username:req.body.username, restarts:req.body.restarts,
                    easyUnattemptedLength:easyUnattemptedLength, difficultUnattemptedLength:difficultUnattemptedLength,
                    easyCorrect: req.body.easyCorrect, easyWrong:req.body.easyWrong, easySkipped:req.body.easySkipped, difficultCorrect:req.body.difficultCorrect,difficultWrong:req.body.difficultWrong,difficultSkipped:req.body.difficultSkipped, Price:req.body.Price
                });
            return;
        }
    }

    catch(err)
    {
        //logger
        res.render('error');
    }
});

router.post('/ShowChapters', IsLoggedIn, async function(req,res,next) {
    try
    {
        if(!(req.body.ClassId && req.body.CourseId && req.body.Price))
        {
            res.json({ResMsg:"Invalid request parameters"});
            return;
        }
       // let ChaptersArr=await All_QUESTIONS_COLLECTION.distinct("CHAPTER_ID",{CLASS_ID:req.body.ClassId,COURSE_ID:req.body.CourseId});
    
       //Fetch User Name
       let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
       let username = userStr.USERNAME;
       username = username.substr(0, username.indexOf(' '));

        let ChapArr = await CHAPTER_IMG_COLLECTION.find({CLASS_ID:req.body.ClassId,COURSE_ID:req.body.CourseId}).sort({CHAPTER_NUM: 1});  
        let Chapter = null;

        //Newly Addded 
        let ChapterName = [];
        for(let i=0; i<ChapArr.length;i++) {
            ChapterName[i] = ChapArr[i].CHAPTER_ID;
        }
        let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.ClassId, COURSE_ID: req.body.CourseId, CHAPTER_ID: { $in: ChapterName}}).sort({CHAPTER_NUM: 1});          
        let SolvedQuestionsList = await STUDENT_PERFORMANCE_COLLECTION.find({EMAIL:req.user.EMAIL, CLASS_ID: req.body.ClassId, COURSE_ID: req.body.CourseId, CHAPTER_ID: { $in: ChapterName}}).sort({CHAPTER_NUM: 1});
      
        let CorrectQuestionLength=0;
        let SkipQuestionLength=0;
        let WrongQuestionLength=0;

        for (let i = 0; i<SolvedQuestionsList.length;i++) {

           if(SolvedQuestionsList[i].CORRECT_FLAG == 1) {
               CorrectQuestionLength++;
           }
           else if(SolvedQuestionsList[i].CORRECT_FLAG == 0) {
                WrongQuestionLength++;
           }
           else if(SolvedQuestionsList[i].CORRECT_FLAG == 2) {
               SkipQuestionLength++;
           }
       }
       
        var a = [],
        b = [],
        prev;

        let allChapterNumber = [];
        for (let i=0;i<TotalQuestionList.length;i++) {
            allChapterNumber[i] = (TotalQuestionList[i].CHAPTER_NUM);    //Not possible for numbers >= 10
            //to be replaced by chap num
        }

        allChapterNumber.sort(function(a,b){return a - b});
        //To find frequency of numbers in an array
        for (var i = 0; i < allChapterNumber.length; i++) {
            if (allChapterNumber[i] !== prev) {
              a.push(allChapterNumber[i]);
              b.push(1);
            } else {
              b[b.length - 1]++;
            }
            prev = allChapterNumber[i];
          }
          
          console.log(a,b);
          
          var a1 = [],
          b1 = [],
          prev1;
          let solvedChapterNumber = [];
          for (let i=0;i<SolvedQuestionsList.length;i++) {
            solvedChapterNumber[i] = (SolvedQuestionsList[i].CHAPTER_NUM);
            //should be replaced by chap num
          }
          solvedChapterNumber.sort(function(a,b){return a - b});
        //To find frequency of numbers in an array
          for (var i = 0; i < solvedChapterNumber.length; i++) {
            if (solvedChapterNumber[i] !== prev1) {
              a1.push(solvedChapterNumber[i]);
              b1.push(1);
            } else {
              b1[b1.length - 1]++;
            }
            prev1 = solvedChapterNumber[i];
          }

          console.log(a1,b1);

          let SolvedPercent = [];   //Solved Percent For All Concepts In Array

         SolvedPercent.length = TotalQuestionList.length;
         for (let i=0;i<TotalQuestionList.length;i++) {
            SolvedPercent[i] = 0;
        }
         for (let i=0;i<TotalQuestionList.length;i++) {
             SolvedPercent[a1[i] - 1] = (b1[i] / b[a1[i] - 1]) * 100;
         }
        console.log("SolvedPercent", SolvedPercent);
         
        let premiumData = await USER_PREMIUM_COLLECTION.findOne({EMAIL:req.user.EMAIL, CLASS_ID: req.body.ClassId, COURSE_ID: req.body.CourseId});
        let trialFlag = premiumData.TRIAL_FLAG;

        if(trialFlag == 1) {
            res.render('AllChaptersTrial',{Concepts: ChapArr, ClassId:req.body.ClassId, CourseId:req.body.CourseId, SolvedPercent: SolvedPercent, TotalConcepts: ChapArr.length, username: username, CorrectQuestionLength:CorrectQuestionLength, WrongQuestionLength:WrongQuestionLength, SkipQuestionLength:SkipQuestionLength, TotalQuestionLength: TotalQuestionList.length, Price:req.body.Price});
         }
        else {
            res.render('ChaptersConcepts',{Concepts: ChapArr, ClassId:req.body.ClassId, CourseId:req.body.CourseId, SolvedPercent: SolvedPercent, TotalConcepts: ChapArr.length, username: username, CorrectQuestionLength:CorrectQuestionLength, WrongQuestionLength:WrongQuestionLength, SkipQuestionLength:SkipQuestionLength, TotalQuestionLength:TotalQuestionList.length, Price:0});
        }
        return;
    }
    catch(err)
    {
        //logger
        res.render('error');
    }

});

router.post('/ShowConcepts', IsLoggedIn, async function(req,res,next) {
    try
    {
        if(!(req.body.ClassId && req.body.CourseId && req.body.ChapterId && req.body.ChapNum && req.body.Price))
        {
            res.json({ResMsg:"Invalid request parameters"});
            return;
        }
       // let ConceptsArr=await All_QUESTIONS_COLLECTION.distinct("CONCEPT_ID",{CLASS_ID:req.body.ClassId,COURSE_ID:req.body.CourseId,CHAPTER_ID:req.body.ChapterId});
       
       //Fetch User Name
       let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
       let username = userStr.USERNAME;
       username = username.substr(0, username.indexOf(' '));

       //NEWLY ADDED. Don't Show Concepts if Course is not subscribed.

       let premiumData = await USER_PREMIUM_COLLECTION.findOne({EMAIL:req.user.EMAIL, CLASS_ID: req.body.ClassId, COURSE_ID: req.body.CourseId});
       let trialFlag = premiumData.TRIAL_FLAG;

       if((trialFlag == 1) && (req.body.ChapNum>3)) {
            res.send("Upgrade your plan to unlock the full course.")
        }

        let ConceptsArr = await CONCEPT_IMG_COLLECTION.find({CLASS_ID:req.body.ClassId,COURSE_ID:req.body.CourseId, CHAPTER_ID:req.body.ChapterId}).sort({CONCEPT_NUM: 1});  
        let Concept = null;

        let ConceptName = [];

        for(let i=0; i<ConceptsArr.length;i++) {
            ConceptName[i] = ConceptsArr[i].CONCEPT_ID;
        }

        //Newly Addded
        let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.ClassId, COURSE_ID: req.body.CourseId, CHAPTER_ID: req.body.ChapterId, CONCEPT_ID:{ $in: ConceptName}}).sort({CONCEPT_NUM: 1});          
        let SolvedQuestionsList = await STUDENT_PERFORMANCE_COLLECTION.find({EMAIL:req.user.EMAIL, CLASS_ID: req.body.ClassId, COURSE_ID: req.body.CourseId, CHAPTER_ID: req.body.ChapterId, CONCEPT_ID:{ $in: ConceptName}}).sort({CONCEPT_NUM: 1});

        let CorrectQuestionLength=0;
        let SkipQuestionLength=0;
        let WrongQuestionLength=0;

        for (let i = 0; i<SolvedQuestionsList.length;i++) {

           if(SolvedQuestionsList[i].CORRECT_FLAG == 1) {
               CorrectQuestionLength++;
           }
           else if(SolvedQuestionsList[i].CORRECT_FLAG == 0) {
                WrongQuestionLength++;
           }
           else if(SolvedQuestionsList[i].CORRECT_FLAG == 2) {
               SkipQuestionLength++;
           }
       }

        var a = [],
        b = [],
        prev;

        let allConceptNumber = [];
        for (let i=0;i<TotalQuestionList.length;i++) {
            allConceptNumber[i] = (TotalQuestionList[i].CONCEPT_NUM);
        }
        allConceptNumber.sort(function(a,b){return a - b});
        //To find frequency of numbers in an array
        for (var i = 0; i < allConceptNumber.length; i++) {
            if (allConceptNumber[i] !== prev) {
              a.push(allConceptNumber[i]);
              b.push(1);
            } else {
              b[b.length - 1]++;
            }
            prev = allConceptNumber[i];
          }
          
          console.log(a,b);

          var a1 = [],
          b1 = [],
          prev1;
          let solvedConceptNumber = [];
          for (let i=0;i<SolvedQuestionsList.length;i++) {
            solvedConceptNumber[i] = (SolvedQuestionsList[i].CONCEPT_NUM);
          }
          solvedConceptNumber.sort(function(a,b){return a - b});
        //To find frequency of numbers in an array
          for (var i = 0; i < solvedConceptNumber.length; i++) {
            if (solvedConceptNumber[i] !== prev1) {
              a1.push(solvedConceptNumber[i]);
              b1.push(1);
            } else {
              b1[b1.length - 1]++;
            }
            prev1 = solvedConceptNumber[i];
          }

          console.log(a1, b1);
          
          let SolvedPercent = [];   //Solved Percent For All Concepts In Array

         SolvedPercent.length = TotalQuestionList.length;
         for (let i=0;i<TotalQuestionList.length;i++) {
            SolvedPercent[i] = 0;
        }
         for (let i=0;i<TotalQuestionList.length;i++) {
             SolvedPercent[a1[i] - 1] = (b1[i] / b[a1[i] - 1]) * 100;
         }
        console.log("SolvedPercent", SolvedPercent);
        
        res.render('AllConcepts',{Concepts:ConceptsArr,CourseId:req.body.CourseId, ChapterId:req.body.ChapterId, ClassId:req.body.ClassId, SolvedPercent: SolvedPercent, TotalConcepts: ConceptsArr.length, username: username, ChapNum: req.body.ChapNum, CorrectQuestionLength:CorrectQuestionLength, WrongQuestionLength:WrongQuestionLength, SkipQuestionLength:SkipQuestionLength, TotalQuestionLength:TotalQuestionList.length, Price:req.body.Price});
        //  res.json({ResMsg:ConceptsArr});
        return;
    }
    catch(err)
    {
        //logger
        res.render('error');
    }

});


router.post('/ConceptPerformance', IsLoggedIn, async function(req,res,next) {

    try{

        if(!(req.body.Class && req.body.Course && req.body.Chapter && req.body.Concept && req.body.ChapNum && req.body.ConceptNum && req.body.Price)) {
            res.render('error');
            return;
        }

        let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});          
        
        TotalQuestionList.sort(function (b,a){
            return ((parseInt(a.SCORE.split(" ")[0])/parseInt(a.SCORE.split(" ")[1]))-((b.SCORE.split(" ")[0])/parseInt(b.SCORE.split(" ")[1])))
            }) ;
            
             ///////////////////////////////////////
             let allQuestionsScoreList = [];
             for(let i=0;i<TotalQuestionList.length;i++)
             {
                allQuestionsScoreList.push(parseInt(TotalQuestionList[i].SCORE.split(" ")[0])/parseInt(TotalQuestionList[i].SCORE.split(" ")[1]))
                console.log("i",allQuestionsScoreList[i]);
             }
             ///////////////////////////////////////
        
             //All questions sorted in descending based on Score.
        
             let easyQList=TotalQuestionList.slice(0,TotalQuestionList.length/2);
             let difficultQList=TotalQuestionList.slice(TotalQuestionList.length/2,TotalQuestionList.length);
            //EASY ARRAY            DIFFICULT ARRAY        is made.
        
             let SolvedQList=await STUDENT_PERFORMANCE_COLLECTION.find({CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class, EMAIL:req.user.EMAIL}).sort({ANSWER_DATE_TIME: -1}).select().populate('PerformanceToAllQuestionCollectionJoin');
             // Last most attempted question is fetched
            let easyCorrect = 0, easyWrong = 0, easySkipped = 0;
            let difficultCorrect = 0, difficultWrong = 0, difficultSkipped = 0;

            ///////////
             easyQList = easyQList.filter(easyQListEle =>!SolvedQList.find(SolvedQListEle =>
                { 
                    if(SolvedQListEle.QUESTION_ID === easyQListEle.QUESTION_ID) 
                    {
                        if(SolvedQListEle.CORRECT_FLAG=="1")
                        {
                            easyCorrect++;
                        }
                        else if(SolvedQListEle.CORRECT_FLAG=="0")
                        {
                            easyWrong++;
                        }
                        else if(SolvedQListEle.CORRECT_FLAG=="2")
                        {
                            easySkipped++;
                        }
                        return true;
                    }
                })
             );

             difficultQList = difficultQList.filter(difficultQListEle => !SolvedQList.find(SolvedQListEle => 
                {
                   if (SolvedQListEle.QUESTION_ID === difficultQListEle.QUESTION_ID)
                   {
                    if(SolvedQListEle.CORRECT_FLAG=="1")
                    {
                        difficultCorrect++;
                    }
                    else if(SolvedQListEle.CORRECT_FLAG=="0")
                    {
                        difficultWrong++;
                    }
                    else if(SolvedQListEle.CORRECT_FLAG=="2")
                    {
                        difficultSkipped++;
                    }
                    return true;
                   }
                } ));
             // attempted questions are removed from easy and difficult question list 

        let CorrectQuestionLength = easyCorrect + difficultCorrect;
        let WrongQuestionLength = difficultWrong + easyWrong;
        let SkipQuestionLength = easySkipped + difficultSkipped; 

        let easyUnattemptedLength = easyQList.length;
        let difficultUnattemptedLength = difficultQList.length;
        
        var correctScore = CorrectQuestionLength * 4;
        var wrongScore = -(WrongQuestionLength * 1);
        var accuracy = 0;

        accuracy = correctScore + wrongScore;
        
        //Update on Leaderboard if stopped only if concept is complete
        if (SolvedQList.length == TotalQuestionList.length) {
            await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
            let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1}).select().populate('LeaderBoardToProfileJoin');
            //let LeaderboardListTopTen=LeaderBoardList.slice(0,10);

            let userRank=0;

            for(let i=0;i<LeaderBoardList.length;i++)
            {
                if(LeaderBoardList[i].EMAIL==req.user.EMAIL)
                {
                    userRank=i+1;
                    break;
                }
            }
            console.log(userRank);
        }

        let LeaderBoardList1 = await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1}).select().populate('LeaderBoardToProfileJoin');
        let LeaderboardListTopTen=LeaderBoardList1.slice(0,10);

        let userRank=0;

        for(let i=0;i<LeaderBoardList1.length;i++)
        {
            if(LeaderBoardList1[i].EMAIL==req.user.EMAIL)
            {
             userRank=i+1;
             break;
            }
        }
    
        //res.status(200).json({ ErrCode: 0, ResMsg: "Data insertion Successful."});
        let leaderboardData = await STUDENT_LEADERBOARD_COLLECTION.findOne({CHAPTER_ID:req.body.Chapter, CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CONCEPT_ID: req.body.Concept, EMAIL: req.user.EMAIL});
        let restarts = 0;
        if(leaderboardData) {
            restarts = leaderboardData.RESTARTS;
        }
        else {
            restarts = 4;
        }

        if(TotalQuestionList.length == SolvedQList.length)
            {
                res.render('ConceptDashboardComplete',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionLength, 
                    SkippedQuestions: SkipQuestionLength, WrongQuestions: WrongQuestionLength,
                    Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, username:req.body.username, restarts:restarts,
                    easyUnattemptedLength:easyUnattemptedLength, difficultUnattemptedLength:difficultUnattemptedLength,
                    easyCorrect: easyCorrect, easyWrong:easyWrong, easySkipped:easySkipped, difficultCorrect:difficultCorrect,difficultWrong:difficultWrong,difficultSkipped:difficultSkipped, Price: req.body.Price
                    });  
                return;
            }
   
        res.render('ConceptDashboard',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionLength, 
            SkippedQuestions: SkipQuestionLength, WrongQuestions: WrongQuestionLength,
            Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, username:req.body.username, restarts:restarts,
            easyUnattemptedLength:easyUnattemptedLength, difficultUnattemptedLength:difficultUnattemptedLength,
            easyCorrect: easyCorrect, easyWrong:easyWrong, easySkipped:easySkipped, difficultCorrect:difficultCorrect,difficultWrong:difficultWrong,difficultSkipped:difficultSkipped, Price: req.body.Price
            });
        }
    
    catch(err)
        {
            res.render('error');
        }
});

router.post('/ResetConcept', IsLoggedIn, async function(req, res) {

    try{
        if(!(req.body.Class && req.body.Course && req.body.Chapter && req.body.Concept && req.body.ChapNum && req.body.ConceptNum && req.body.Price && req.body.TotalQuestions)) {
            res.render('error');
            return;
        }

        let SolvedQList=await STUDENT_PERFORMANCE_COLLECTION.find({CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class, EMAIL:req.user.EMAIL}).sort({ANSWER_DATE_TIME: -1}).select().populate('PerformanceToAllQuestionCollectionJoin');

        if(SolvedQList.length == req.body.TotalQuestions) {
                let leaderboardData = await STUDENT_LEADERBOARD_COLLECTION.findOne({CHAPTER_ID:req.body.Chapter, CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CONCEPT_ID: req.body.Concept, EMAIL: req.user.EMAIL});
                if(leaderboardData && (leaderboardData.RESTARTS==0))
                {
                    res.send('No more restarts left for this concept.');
                    return;
                }

                await STUDENT_LEADERBOARD_COLLECTION.updateOne({CHAPTER_ID:req.body.Chapter, CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CONCEPT_ID: req.body.Concept, EMAIL: req.user.EMAIL},{RESTARTS:leaderboardData.RESTARTS-1},{upsert: true, setDefaultsOnInsert: false});
            
                await STUDENT_PERFORMANCE_COLLECTION.deleteMany({CHAPTER_ID:req.body.Chapter, CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CONCEPT_ID: req.body.Concept, CHAPTER_NUM: req.body.ChapNum, CONCEPT_NUM: req.body.ConceptNum, EMAIL: req.user.EMAIL});
                var accuracy = 0;
                var restarts = leaderboardData.RESTARTS-1;
                await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
       }
     
        let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1}).select().populate('LeaderBoardToProfileJoin');
        let LeaderboardListTopTen=LeaderBoardList.slice(0,10);
                //Add try catch may be?
        let userRank=0;

        for(let i=0;i<LeaderBoardList.length;i++)
            {
                if(LeaderBoardList[i].EMAIL==req.user.EMAIL)
                   {
                    userRank=i+1;
                    break;
                   }
            }
                              
        res.render('ConceptDashboard', {LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:req.body.TotalQuestions,CorrectQuestions:0, 
            SkippedQuestions: 0, WrongQuestions: 0,
            Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, username:req.body.username, restarts:restarts,
            easyUnattemptedLength:0, difficultUnattemptedLength:0,
            easyCorrect: 0, easyWrong:0, easySkipped:0, difficultCorrect:0,difficultWrong:0,difficultSkipped:0, Price: req.body.Price
            });
        return;
        }

    catch(err) {
        res.render('error');
    }
})

router.post('/OrderDetails', IsLoggedIn, async function(req, res) {
    try{
        if(!(req.body.Class && req.body.Course && req.body.Price && req.body.orderId)) {
            res.render('error');
            return;
        }

             //Fetch User Name
    //    let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
    //    let username = userStr.USERNAME;
    //    username = username.substr(0, username.indexOf(' '));

        let selectedCourse =await COURSE_IMG_COLLECTION.findOne({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course});
        let DbPrice = selectedCourse.PRICE;

        let premiumData = await USER_PREMIUM_COLLECTION.findOne({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, EMAIL: req.user.EMAIL});
        let trialFlag = 0;
        if(premiumData) {
            trialFlag = 1;
        }

        if ((DbPrice * 100) != req.body.Price) {
            res.render('error');
            return;
        }

        res.render('OrderDetails', {Class:req.body.Class, Course:req.body.Course, Price:req.body.Price, FullPrice:4999, orderId:req.body.orderId, CourseImg: selectedCourse.BUY_COURSE_IMG, Email: req.user.EMAIL, username: req.body.username, trialFlag: trialFlag});
        return;

    }
    catch(err) {
        res.render('error');
    }
});


router.post('/SolveAdaptiveQuestions', IsLoggedIn, async function(req, res, next) {
    try
    {
     //Class, course, concept, chapter, concept   
     if(!req.body.Concept || !req.body.Chapter || !req.body.Course  || !req.body.Class || !req.body.ChapNum || !req.body.ConceptNum || !req.body.restarts || !req.body.Price)
     {
         res.json({ResMsg:"Invalid Request Parameters"});
         return;
     }
     
     //fetch after sort
    let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});      
    TotalQuestionList.sort(function (b,a){
    return ((parseInt(a.SCORE.split(" ")[0])/parseInt(a.SCORE.split(" ")[1]))-((b.SCORE.split(" ")[0])/parseInt(b.SCORE.split(" ")[1])))
    }) ;
    
     ///////////////////////////////////////
     let allQuestionsScoreList = [];
     for(let i=0;i<TotalQuestionList.length;i++)
     {
        allQuestionsScoreList.push(parseInt(TotalQuestionList[i].SCORE.split(" ")[0])/parseInt(TotalQuestionList[i].SCORE.split(" ")[1]))
        console.log("i",allQuestionsScoreList[i]);
     }
     ///////////////////////////////////////

     //All questions sorted in descending based on Score.

     let easyQList=TotalQuestionList.slice(0,TotalQuestionList.length/2);
     let difficultQList=TotalQuestionList.slice(TotalQuestionList.length/2,TotalQuestionList.length);
    //EASY ARRAY            DIFFICULT ARRAY        is made.

     let SolvedQList=await STUDENT_PERFORMANCE_COLLECTION.find({CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class, EMAIL:req.user.EMAIL}).sort({ANSWER_DATE_TIME: -1}).select().populate('PerformanceToAllQuestionCollectionJoin');
     // Last most attempted question is fetched

     if(SolvedQList.length==0) {
        let NewQuestiontoDisplay = TotalQuestionList[0];
        res.render('SolveQuestions',{Question:NewQuestiontoDisplay.QUESTION,OptionA:NewQuestiontoDisplay.OptionA ,OptionB:NewQuestiontoDisplay.OptionB,OptionC:NewQuestiontoDisplay.OptionC,OptionD:NewQuestiontoDisplay.OptionD,CorrectOption:NewQuestiontoDisplay.CORRECT_OPT ,Explanation:NewQuestiontoDisplay.EXPLANATION,QuestionImg:NewQuestiontoDisplay.Q_IMG ,ExplainationImg:NewQuestiontoDisplay.EXPLANATION_IMAGE,QuestionId:NewQuestiontoDisplay.QUESTION_ID, Ques_Img_flag:NewQuestiontoDisplay.QUESTION_IMG_FLAG, Ans_img_flag:NewQuestiontoDisplay.ANS_IMG_FLAG, Concept:NewQuestiontoDisplay.CONCEPT_ID, Chapter:NewQuestiontoDisplay.CHAPTER_ID, Class:NewQuestiontoDisplay.CLASS_ID, Course:NewQuestiontoDisplay.COURSE_ID, ShowAnswer:0, submittedInput:"", ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, username: req.body.username, restarts:req.body.restarts, Price:req.body.Price});
        //render first question of Total Question List 
        return; 
     }

     ///////////
     easyQList = easyQList.filter(easyQListEle =>!SolvedQList.find(SolvedQListEle => (SolvedQListEle.QUESTION_ID === easyQListEle.QUESTION_ID) ));
     difficultQList = difficultQList.filter(difficultQListEle => !SolvedQList.find(SolvedQListEle => (SolvedQListEle.QUESTION_ID === difficultQListEle.QUESTION_ID) ));
     // attempted questions are removed from easy and difficult question list 


    //Fetch score of easy last easy question
    let lastEasyQScore =easyQList.length>0 ?parseInt(easyQList[easyQList.length-1].SCORE.split(" ")[0])/parseInt(easyQList[easyQList.length-1].SCORE.split(" ")[1]): 0;
       
    let lastAttemptedQuestionScore=parseInt(SolvedQList[0].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[0])/ parseInt(SolvedQList[0].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[1]);
    let NewQuestiontoDisplay=null;

     //EASY C       EASY W/S       DIFF C       DIFF W/S


     //irrespective of last question being correct or wrong, because any one of the lists are exhausted
    if(easyQList.length==0 && difficultQList.length>0)
    {
        NewQuestiontoDisplay=difficultQList[0]; 
    }
    else if(difficultQList.length==0 && easyQList.length>0)
    {
        NewQuestiontoDisplay=easyQList[0]; 
    }
    
    //If both lists are available, last attempted question was difficult
    else if (lastAttemptedQuestionScore <= lastEasyQScore) {  
         
        if(SolvedQList[0].CORRECT_FLAG=="1" ) 
        {
            NewQuestiontoDisplay=difficultQList[0];              //if difficult corr, show diff
        }
        else
        {
            NewQuestiontoDisplay=easyQList[0];                  //difficult wong/skip, show correct
        }
    }
    
    //if both lists are available, last attempted question was easy 
    else if (lastAttemptedQuestionScore > lastEasyQScore) {  
         
        if(SolvedQList[0].CORRECT_FLAG=="1" ) 
        {
            NewQuestiontoDisplay=difficultQList[0];              //if difficult corr, show diff
        }
        else
        {
            NewQuestiontoDisplay=easyQList[0];                  //difficult wong/skip, show correct
        }
    }
  

    //Most easiest or least difficult is shown by taking 0 index from the array 

    if(!NewQuestiontoDisplay){
        //render page with no question available message

        easyQList=TotalQuestionList.slice(0,TotalQuestionList.length/2);
        difficultQList=TotalQuestionList.slice(TotalQuestionList.length/2,TotalQuestionList.length);
     
        let easyCorrect = 0, easyWrong = 0, easySkipped = 0;
        let difficultCorrect = 0, difficultWrong = 0, difficultSkipped = 0;

        ///////////
         easyQList = easyQList.filter(easyQListEle =>!SolvedQList.find(SolvedQListEle =>
            { 
                if(SolvedQListEle.QUESTION_ID === easyQListEle.QUESTION_ID) 
                {
                    if(SolvedQListEle.CORRECT_FLAG=="1")
                    {
                        easyCorrect++;
                    }
                    else if(SolvedQListEle.CORRECT_FLAG=="0")
                    {
                        easyWrong++;
                    }
                    else if(SolvedQListEle.CORRECT_FLAG=="2")
                    {
                        easySkipped++;
                    }
                    return true;
                }
            })
         );

         difficultQList = difficultQList.filter(difficultQListEle => !SolvedQList.find(SolvedQListEle => 
            {
               if (SolvedQListEle.QUESTION_ID === difficultQListEle.QUESTION_ID)
               {
                if(SolvedQListEle.CORRECT_FLAG=="1")
                {
                    difficultCorrect++;
                }
                else if(SolvedQListEle.CORRECT_FLAG=="0")
                {
                    difficultWrong++;
                }
                else if(SolvedQListEle.CORRECT_FLAG=="2")
                {
                    difficultSkipped++;
                }
                return true;
               }
            } ));
         // attempted questions are removed from easy and difficult question list 

        let CorrectQuestionLength = easyCorrect + difficultCorrect;
        let WrongQuestionLength = difficultWrong + easyWrong;
        let SkipQuestionLength = easySkipped + difficultSkipped; 

        let easyUnattemptedLength = easyQList.length;
        let difficultUnattemptedLength = difficultQList.length;
        
        var correctScore = CorrectQuestionLength * 4;
        var wrongScore = -(WrongQuestionLength * 1);
        var accuracy = 0;

        accuracy = correctScore + wrongScore;
        
        await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
        let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1}).select().populate('LeaderBoardToProfileJoin');
        //let LeaderboardListTopTen=LeaderBoardList.slice(0,10);
        let userRank=0;

        for(let i=0;i<LeaderBoardList.length;i++)
        {
            if(LeaderBoardList[i].EMAIL==req.user.EMAIL)
            {
                userRank=i+1;
                break;
            }
        }

        let LeaderboardListTopTen=LeaderBoardList.slice(0,10);   
                
        res.render('ConceptDashboardComplete',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionLength, 
            SkippedQuestions: SkipQuestionLength, WrongQuestions: WrongQuestionLength,
            Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, username:req.body.username, restarts:req.body.restarts,
            easyUnattemptedLength:easyUnattemptedLength, difficultUnattemptedLength:difficultUnattemptedLength,
            easyCorrect: easyCorrect, easyWrong:easyWrong, easySkipped:easySkipped, difficultCorrect:difficultCorrect,difficultWrong:difficultWrong,difficultSkipped:difficultSkipped, Price:req.body.Price
            }); 
    }  
    
    else
    {           
        res.render('SolveQuestions',{Question:NewQuestiontoDisplay.QUESTION,OptionA:NewQuestiontoDisplay.OptionA ,OptionB:NewQuestiontoDisplay.OptionB,OptionC:NewQuestiontoDisplay.OptionC,OptionD:NewQuestiontoDisplay.OptionD,CorrectOption:NewQuestiontoDisplay.CORRECT_OPT ,Explanation:NewQuestiontoDisplay.EXPLANATION,QuestionImg:NewQuestiontoDisplay.Q_IMG ,ExplainationImg:NewQuestiontoDisplay.EXPLANATION_IMAGE,QuestionId:NewQuestiontoDisplay.QUESTION_ID, Ques_Img_flag:NewQuestiontoDisplay.QUESTION_IMG_FLAG, Ans_img_flag:NewQuestiontoDisplay.ANS_IMG_FLAG, Concept:NewQuestiontoDisplay.CONCEPT_ID, Chapter:NewQuestiontoDisplay.CHAPTER_ID, Class:NewQuestiontoDisplay.CLASS_ID, Course:NewQuestiontoDisplay.COURSE_ID, ShowAnswer:0, submittedInput:"", ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, username: req.body.username, restarts:req.body.restarts, Price:req.body.Price});
        return;
         //render qusetion page
    }
}
catch(err) {
        res.render('SolveQuestions',{Question:NewQuestiontoDisplay.QUESTION,OptionA:NewQuestiontoDisplay.OptionA ,OptionB:NewQuestiontoDisplay.OptionB,OptionC:NewQuestiontoDisplay.OptionC,OptionD:NewQuestiontoDisplay.OptionD,CorrectOption:NewQuestiontoDisplay.CORRECT_OPT ,Explanation:NewQuestiontoDisplay.EXPLANATION,QuestionImg:NewQuestiontoDisplay.Q_IMG ,ExplainationImg:NewQuestiontoDisplay.EXPLANATION_IMAGE,QuestionId:NewQuestiontoDisplay.QUESTION_ID, Ques_Img_flag:NewQuestiontoDisplay.QUESTION_IMG_FLAG, Ans_img_flag:NewQuestiontoDisplay.ANS_IMG_FLAG, Concept:NewQuestiontoDisplay.CONCEPT_ID, Chapter:NewQuestiontoDisplay.CHAPTER_ID, Class:NewQuestiontoDisplay.CLASS_ID, Course:NewQuestiontoDisplay.COURSE_ID, ShowAnswer:0, submittedInput:"", ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, username: req.body.username, restarts:req.body.restarts, Price:req.body.Price});
        return;
        //  res.render('error');
     }
});



router.post('/SubmitAdaptiveAnswers', IsLoggedIn, async function(req, res, next) {
    try
    {
     //Class, course, concept, chapter   
     if(!req.body.quesID || !req.body.Concept || !req.body.Course || !req.body.Class || !req.body.Chapter || !req.body.ChapNum || !req.body.ConceptNum || !req.body.restarts || !req.body.Price)
     {
         res.json({ResMsg:"Invalid Request Parameters"});
         return;
     }
    
    let thisQuestion = await STUDENT_PERFORMANCE_COLLECTION.findOne({CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class, EMAIL:req.user.EMAIL, QUESTION_ID: req.body.quesID}).sort({ANSWER_DATE_TIME: -1}).select().populate('PerformanceToAllQuestionCollectionJoin');
    if (!thisQuestion) {
      //UPDATE CURRENT ATTEMPT IN PERFORMACE TABLE ONLY IF QUESTION IS NOT IN PERFORMANCE TABLE
      let studentPerformanceObj = new STUDENT_PERFORMANCE_COLLECTION({
        CLASS_ID: req.body.Class,
        COURSE_ID: req.body.Course,
        CHAPTER_ID: req.body.Chapter,
        CONCEPT_ID: req.body.Concept,
        QUESTION_ID: req.body.quesID,
        EMAIL:req.user.EMAIL,
        INPUT_OPT: req.body.inputAns || "SKIPPED",
        CORRECT_FLAG: req.body.CorrectFlag,
        CHAPTER_NUM:  req.body.ChapNum,
        CONCEPT_NUM: req.body.ConceptNum
     })
     
     await studentPerformanceObj.save();
    } 

     let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});      
     TotalQuestionList.sort(function (b,a){
        return ((parseInt(a.SCORE.split(" ")[0])/parseInt(a.SCORE.split(" ")[1]))-((b.SCORE.split(" ")[0])/parseInt(b.SCORE.split(" ")[1])))
        });

        //UPDATE SCORE OF QUESTION

     let SolvedQList=await STUDENT_PERFORMANCE_COLLECTION.find({CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class, EMAIL:req.user.EMAIL}).sort({ANSWER_DATE_TIME: -1}).select().populate('PerformanceToAllQuestionCollectionJoin');
     //if(req.body.restartReamining==5) PUT THIS CONDITION     
     let quesDetails=[];
        for(let i =0; i<TotalQuestionList.length; i++) {
            if(TotalQuestionList[i].QUESTION_ID == req.body.quesID) {
                quesDetails.push(TotalQuestionList[i]);
                break;
            }
     }

     if(req.body.restarts > 2) {
        let AttemptStr = quesDetails[0].SCORE.split(" ")[1];
        let correctStR= quesDetails[0].SCORE.split(" ")[0];
            
        AttemptStr=parseInt(AttemptStr)+1;
    
        if(req.body.CorrectFlag==1) {
                correctStR=parseInt(correctStR)+1;  
        }
    
        let ScoreStr = correctStR.toString()+" "+AttemptStr.toString();
        await All_QUESTIONS_COLLECTION.updateOne({QUESTION_ID: req.body.quesID},{$set:{SCORE:ScoreStr}});
    }
     //If Last Answer is submitted and Go to Next not done, then performance entry should be updated in leaderboard
     if (SolvedQList.length == TotalQuestionList.length) {
        //accuracy value find
            let CorrectQuestionLength=0;
            let WrongQuestionLength=0;
   
            for (let i = 0; i<SolvedQList.length;i++) {
   
               if(SolvedQList[i].CORRECT_FLAG == 1) {
                CorrectQuestionLength++;
               }
               else if(SolvedQList[i].CORRECT_FLAG == 0) {
                WrongQuestionLength++;
               }
           }           
            var correctScore = CorrectQuestionLength * 4;
            var wrongScore = -(WrongQuestionLength* 1);
            var accuracy = 0;

            accuracy = correctScore + wrongScore;
 
            await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
            let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1}).select().populate('LeaderBoardToProfileJoin');
            //let LeaderboardListTopTen=LeaderBoardList.slice(0,10);
            let userRank=0;

            for(let i=0;i<LeaderBoardList.length;i++)
            {
                if(LeaderBoardList[i].EMAIL==req.user.EMAIL)
                {
                    userRank=i+1;
                    break;
                }
            }
    }

    //If user skipped
    if(!req.body.inputAns) {
        //If last ques is skipped
        if (SolvedQList.length == TotalQuestionList.length) {
            
            easyQList=TotalQuestionList.slice(0,TotalQuestionList.length/2);
            difficultQList=TotalQuestionList.slice(TotalQuestionList.length/2,TotalQuestionList.length);
         
            let easyCorrect = 0, easyWrong = 0, easySkipped = 0;
            let difficultCorrect = 0, difficultWrong = 0, difficultSkipped = 0;
    
            ///////////
             easyQList = easyQList.filter(easyQListEle =>!SolvedQList.find(SolvedQListEle =>
                { 
                    if(SolvedQListEle.QUESTION_ID === easyQListEle.QUESTION_ID) 
                    {
                        if(SolvedQListEle.CORRECT_FLAG=="1")
                        {
                            easyCorrect++;
                        }
                        else if(SolvedQListEle.CORRECT_FLAG=="0")
                        {
                            easyWrong++;
                        }
                        else if(SolvedQListEle.CORRECT_FLAG=="2")
                        {
                            easySkipped++;
                        }
                        return true;
                    }
                })
             );
    
             difficultQList = difficultQList.filter(difficultQListEle => !SolvedQList.find(SolvedQListEle => 
                {
                   if (SolvedQListEle.QUESTION_ID === difficultQListEle.QUESTION_ID)
                   {
                    if(SolvedQListEle.CORRECT_FLAG=="1")
                    {
                        difficultCorrect++;
                    }
                    else if(SolvedQListEle.CORRECT_FLAG=="0")
                    {
                        difficultWrong++;
                    }
                    else if(SolvedQListEle.CORRECT_FLAG=="2")
                    {
                        difficultSkipped++;
                    }
                    return true;
                   }
                } ));
             // attempted questions are removed from easy and difficult question list 
    
            let CorrectQuestionLength = easyCorrect + difficultCorrect;
            let WrongQuestionLength = difficultWrong + easyWrong;
            let SkipQuestionLength = easySkipped + difficultSkipped; 
    
            let easyUnattemptedLength = easyQList.length;
            let difficultUnattemptedLength = difficultQList.length;
            
            var correctScore = CorrectQuestionLength * 4;
            var wrongScore = -(WrongQuestionLength * 1);
            var accuracy = 0;
    
            accuracy = correctScore + wrongScore;

            await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
            let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1}).select().populate('LeaderBoardToProfileJoin');
            //let LeaderboardListTopTen=LeaderBoardList.slice(0,10);
            let userRank=0;

            for(let i=0;i<LeaderBoardList.length;i++)
            {
                if(LeaderBoardList[i].EMAIL==req.user.EMAIL)
                {
                    userRank=i+1;
                    break;
                }
            }
            let LeaderboardListTopTen=LeaderBoardList.slice(0,10);   
                
            res.render('ConceptDashboardComplete',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionLength, 
                SkippedQuestions: SkipQuestionLength, WrongQuestions: WrongQuestionLength,
                Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, username:req.body.username, restarts:req.body.restarts,
                easyUnattemptedLength:easyUnattemptedLength, difficultUnattemptedLength:difficultUnattemptedLength,
                easyCorrect: easyCorrect, easyWrong:easyWrong, easySkipped:easySkipped, difficultCorrect:difficultCorrect,difficultWrong:difficultWrong,difficultSkipped:difficultSkipped, Price: req.body.Price
            }); 
        } 
    
        else{   //Show new question which is always available below      
            ///////////////////////////////////////
            let allQuestionsScoreList = [];
            for(let i=0;i<TotalQuestionList.length;i++)
            {
                allQuestionsScoreList.push(parseInt(TotalQuestionList[i].SCORE.split(" ")[0])/parseInt(TotalQuestionList[i].SCORE.split(" ")[1]))
                //console.log("i",allQuestionsScoreList[i]);
            }
            ///////////////////////////////////////
            //All questions sorted in descending based on Score.

            let easyQList=TotalQuestionList.slice(0,TotalQuestionList.length/2);
            let difficultQList=TotalQuestionList.slice(TotalQuestionList.length/2,TotalQuestionList.length);
            //EASY ARRAY            DIFFICULT ARRAY        is made.

            //This case won't come if once submitted 
            if(SolvedQList.length==0) {
                res.send('TotalQuestionList');
                //render first question of Total Question List 
                return; 
            }

            ///////////
            easyQList = easyQList.filter(easyQListEle =>!SolvedQList.find(SolvedQListEle => (SolvedQListEle.QUESTION_ID === easyQListEle.QUESTION_ID) ));
            difficultQList = difficultQList.filter(difficultQListEle => !SolvedQList.find(SolvedQListEle => (SolvedQListEle.QUESTION_ID === difficultQListEle.QUESTION_ID) ));
            // attempted questions are removed from easy and difficult question list 

            //Fetch score of easy last easy question
            let lastEasyQScore =easyQList.length>0 ?parseInt(easyQList[easyQList.length-1].SCORE.split(" ")[0])/parseInt(easyQList[easyQList.length-1].SCORE.split(" ")[1]): 0;
            
            let lastAttemptedQuestionScore=parseInt(SolvedQList[0].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[0])/ parseInt(SolvedQList[0].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[1]);
            let NewQuestiontoDisplay=null;

            //EASY C       EASY W/S       DIFF C       DIFF W/S

            //irrespective of last question being correct or wrong, because any one of the lists are exhausted
            if(easyQList.length==0 && difficultQList.length>0)
            {
                NewQuestiontoDisplay=difficultQList[0]; 
            }
            else if(difficultQList.length==0 && easyQList.length>0)
            {
                NewQuestiontoDisplay=easyQList[0]; 
            }
            
            //If both lists are available, last attempted question was difficult
            else if (lastAttemptedQuestionScore <= lastEasyQScore) {  
                
                if(SolvedQList[0].CORRECT_FLAG=="1" ) 
                {
                    NewQuestiontoDisplay=difficultQList[0];              //if difficult corr, show diff
                }
                else
                {
                    NewQuestiontoDisplay=easyQList[0];                  //difficult wong/skip, show correct
                }
            }
            
            //if both lists are available, last attempted question was easy 
            else if (lastAttemptedQuestionScore > lastEasyQScore) {  
                
                if(SolvedQList[0].CORRECT_FLAG=="1" ) 
                {
                    NewQuestiontoDisplay=difficultQList[0];              //if difficult corr, show diff
                }
                else
                {
                    NewQuestiontoDisplay=easyQList[0];                  //difficult wong/skip, show correct       
               }
            }        
        //Show new question
        res.render('SolveQuestions',{Question:NewQuestiontoDisplay.QUESTION,OptionA:NewQuestiontoDisplay.OptionA ,OptionB:NewQuestiontoDisplay.OptionB,OptionC:NewQuestiontoDisplay.OptionC,OptionD:NewQuestiontoDisplay.OptionD,CorrectOption:NewQuestiontoDisplay.CORRECT_OPT ,Explanation:NewQuestiontoDisplay.EXPLANATION,QuestionImg:NewQuestiontoDisplay.Q_IMG ,ExplainationImg:NewQuestiontoDisplay.EXPLANATION_IMAGE,QuestionId:NewQuestiontoDisplay.QUESTION_ID, Ques_Img_flag:NewQuestiontoDisplay.QUESTION_IMG_FLAG, Ans_img_flag:NewQuestiontoDisplay.ANS_IMG_FLAG, Concept:NewQuestiontoDisplay.CONCEPT_ID, Chapter:NewQuestiontoDisplay.CHAPTER_ID, Class:NewQuestiontoDisplay.CLASS_ID, Course:NewQuestiontoDisplay.COURSE_ID, ShowAnswer:0, submittedInput:"", ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, username: req.body.username, restarts:req.body.restarts, Price: req.body.Price});
        return;
        }   
    }
    
    else{   //If req.body.InputAns Exists, i.e. user corrected or wrong

        res.render('SolveQuestions',{Question:quesDetails[0].QUESTION,OptionA:quesDetails[0].OptionA ,OptionB:quesDetails[0].OptionB,OptionC:quesDetails[0].OptionC,OptionD:quesDetails[0].OptionD,CorrectOption:quesDetails[0].CORRECT_OPT ,Explanation:quesDetails[0].EXPLANATION,QuestionImg:quesDetails[0].Q_IMG ,ExplainationImg:quesDetails[0].EXPLANATION_IMAGE,QuestionId:quesDetails[0].QUESTION_ID, Ques_Img_flag:quesDetails[0].QUESTION_IMG_FLAG, Ans_img_flag:quesDetails[0].ANS_IMG_FLAG, Concept:quesDetails[0].CONCEPT_ID, Chapter:quesDetails[0].CHAPTER_ID, Class:quesDetails[0].CLASS_ID, Course:quesDetails[0].COURSE_ID, ShowAnswer:1, submittedInput:req.body.inputAns, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, username: req.body.username, restarts:req.body.restarts, Price: req.body.Price});
        return;
    }
}
catch(err) {
    // if(err._message==='STUDENT_PERFORMANCE_COLLECTION validation failed')
    // {
    //     //replace this with any logic
       
      
    //     // goto Duplicate_Question;

    // }
         res.render('error');
     }
});


//THIS API IS THE BASE, IS NOT CALLED, BUT WON"T BE REMOVED FROM HERE
//Unused API
router.post('/StartAdaptiveQuestions', IsLoggedIn, async function(req, res, next) {
    try
    {
     //Class, course, concept, chapter   
     if(!req.body.Concept || !req.body.Chapter || !req.body.Course  || !req.body.Class || !req.body.ChapNum || !req.body.ConceptNum)
     {
         res.json({ResMsg:"Invalid Request Parameters"});
         return;
     }
    
     //fetch after sort
     let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});      
     TotalQuestionList.sort(function (b,a){
     return ((parseInt(a.SCORE.split(" ")[0])/parseInt(a.SCORE.split(" ")[1]))-((b.SCORE.split(" ")[0])/parseInt(b.SCORE.split(" ")[1])))
     }) ;

  
     ///////////////////////////////////////
     let allQuestionsScoreList = [];
     for(let i=0;i<TotalQuestionList.length;i++)
     {
        allQuestionsScoreList.push(parseInt(TotalQuestionList[i].SCORE.split(" ")[0])/parseInt(TotalQuestionList[i].SCORE.split(" ")[1]))
        console.log("i",allQuestionsScoreList[i]);
     }
     ///////////////////////////////////////


     //All questions sorted in descending based on Score.

     let easyQList=TotalQuestionList.slice(0,TotalQuestionList.length/2);
     let difficultQList=TotalQuestionList.slice(TotalQuestionList.length/2,TotalQuestionList.length);
    //EASY ARRAY            DIFFICULT ARRAY        is made.

     let SolvedQList=await STUDENT_PERFORMANCE_COLLECTION.find({CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class, EMAIL:req.user.EMAIL}).sort({ANSWER_DATE_TIME: -1}).select().populate('PerformanceToAllQuestionCollectionJoin');
     // Last most attempted question is fetched

     if(SolvedQList.length==0) {
        res.send('TotalQuestionList');
        //render first question of Total Question List 
        return; 
     }

     ///////////
     easyQList = easyQList.filter(easyQListEle =>!SolvedQList.find(SolvedQListEle => (SolvedQListEle.QUESTION_ID === easyQListEle.QUESTION_ID) ));
     difficultQList = difficultQList.filter(difficultQListEle => !SolvedQList.find(SolvedQListEle => (SolvedQListEle.QUESTION_ID === difficultQListEle.QUESTION_ID) ));
     // attempted questions are removed from easy and difficult question list 


    //Fetch score of easy last easy question
    let lastEasyQScore =easyQList.length>0 ?parseInt(easyQList[easyQList.length-1].SCORE.split(" ")[0])/parseInt(easyQList[easyQList.length-1].SCORE.split(" ")[1]): 0;
       
    let lastAttemptedQuestionScore=parseInt(SolvedQList[0].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[0])/ parseInt(SolvedQList[0].PerformanceToAllQuestionCollectionJoin.SCORE.split(" ")[1]);
    let NewQuestiontoDisplay=null;

     //EASY C       EASY W/S       DIFF C       DIFF W/S


     //irrespective of last question being correct or wrong, because any one of the lists are exhausted
    if(easyQList.length==0 && difficultQList.length>0)
    {
        NewQuestiontoDisplay=difficultQList[0]; 
    }
    else if(difficultQList.length==0 && easyQList.length>0)
    {
        NewQuestiontoDisplay=easyQList[0]; 
    }
    
    //If both lists are available, last attempted question was difficult
    else if (lastAttemptedQuestionScore <= lastEasyQScore) {  
         
        if(SolvedQList[0].CORRECT_FLAG=="1" ) 
        {
            NewQuestiontoDisplay=difficultQList[0];              //if difficult corr, show diff
        }
        else
        {
            NewQuestiontoDisplay=easyQList[0];                  //difficult wong/skip, show correct
        }
    }
    
    //if both lists are available, last attempted question was easy 
    else if (lastAttemptedQuestionScore > lastEasyQScore) {  
         
        if(SolvedQList[0].CORRECT_FLAG=="1" ) 
        {
            NewQuestiontoDisplay=difficultQList[0];              //if difficult corr, show diff
        }
        else
        {
            NewQuestiontoDisplay=easyQList[0];                  //difficult wong/skip, show correct
        }
    }
  

    //Most easiest or least difficult is shown by taking 0 index from the array 

    if(!NewQuestiontoDisplay){
        //render page with no question available message
        res.send('No question');
    }  
    
    else
    {
         //render qusetion page
        res.send(NewQuestiontoDisplay);
    }
}
catch(err) {
         res.render('error');
     }
});


//Unused API 
router.post('/SolveLevelWiseQuestions', IsLoggedIn, async function(req, res, next) {

    try
    {
     //Class, course, concept, chapter, concept   
     if(!req.body.Concept || !req.body.Chapter || !req.body.Course  || !req.body.Class || !req.body.ChapNum || !req.body.ConceptNum)
     {
         res.json({ResMsg:"Invalid Request Parameters"});
         return;
     }

     //Fetch User Name
     let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
     let username = userStr.USERNAME;
     username = username.substr(0, username.indexOf(' '));

    let AttemptedQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CONCEPT_ID:req.body.Concept, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class, EMAIL:req.user.EMAIL});
    let AttemptedQuestionArray=[];
    for(let i=0;i<AttemptedQuestionList.length;i++)
    {
        AttemptedQuestionArray.push(AttemptedQuestionList[i].QUESTION_ID );
    }

    let UnattemptedQuestionsList = await All_QUESTIONS_COLLECTION.find({COURSE_ID:req.body.Course, CLASS_ID:req.body.Class, QUESTION_ID: { $nin: AttemptedQuestionArray }});
    let RequiredQuestion=null;

    for(let i=0;i<UnattemptedQuestionsList.length;i++)
    {
        let strScore=UnattemptedQuestionsList[i].SCORE.split(' ');
        let EachQuestionScore=parseInt(strScore[0])/parseInt(strScore[1]);
        if(EachQuestionScore<=1 && EachQuestionScore > 0.75 && req.body.Concept == "Easy")
        {
            RequiredQuestion= UnattemptedQuestionsList[i];
            break;
        }
        else if(EachQuestionScore<=0.75 && EachQuestionScore > 0.25 && req.body.Concept == "Medium")
        {
            RequiredQuestion= UnattemptedQuestionsList[i];
            break;
        }
        else if(EachQuestionScore<=0.25 && EachQuestionScore >= 0 && req.body.Concept == "Hard")
        {
            RequiredQuestion= UnattemptedQuestionsList[i];
            break; 
        }
     }
        if(RequiredQuestion)
        {
            res.render('SolveQuestions',{Question:RequiredQuestion.QUESTION,OptionA:RequiredQuestion.OptionA ,OptionB:RequiredQuestion.OptionB,OptionC:RequiredQuestion.OptionC,OptionD:RequiredQuestion.OptionD,CorrectOption:RequiredQuestion.CORRECT_OPT ,Explanation:RequiredQuestion.EXPLANATION,QuestionImg:RequiredQuestion.Q_IMG ,ExplainationImg:RequiredQuestion.EXPLANATION_IMAGE,QuestionId:RequiredQuestion.QUESTION_ID, Ques_Img_flag:RequiredQuestion.QUESTION_IMG_FLAG, Ans_img_flag:RequiredQuestion.ANS_IMG_FLAG, Concept:RequiredQuestion.CONCEPT_ID, Chapter:RequiredQuestion.CHAPTER_ID, Class:RequiredQuestion.CLASS_ID, Course:RequiredQuestion.COURSE_ID, ShowAnswer:0, submittedInput:"", ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, username: username});
            return;
        } 
        else
        {
            let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course});  
            let TotalLevelQuestionLength=0;     
            let SolvedQList =await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL});
            
            for (let i=0;i<TotalQuestionList.length;i++)
            {
                let strScore=UnattemptedQuestionsList[i].SCORE.split(' ');
                let EachQuestionScore=parseInt(strScore[0])/parseInt(strScore[1]);
                if(EachQuestionScore<=1 && EachQuestionScore > 0.75  && req.body.Concept=="Easy")
                {
                    TotalLevelQuestionLength++;
                }
                else if(EachQuestionScore<=0.75 && EachQuestionScore > 0.25 && req.body.Concept=="Medium")
                {
                    TotalLevelQuestionLength++;
                }
                else if(EachQuestionScore<=0.25 && EachQuestionScore >= 0 && req.body.Concept=="Hard")
                {
                    TotalLevelQuestionLength++;
                }
           }
        
            let CorrectQuestionLength=0;
            let SkipQuestionLength=0;
            let WrongQuestionLength=0;
   
            for (let i = 0; i<SolvedQList.length;i++) {
   
               if(SolvedQList[i].CORRECT_FLAG == 1) {
                CorrectQuestionLength++;
               }
               else if(SolvedQList[i].CORRECT_FLAG == 0) {
                WrongQuestionLength++;
               }
               else if(SolvedQList[i].CORRECT_FLAG == 2) {
                SkipQuestionLength++;
               }
           }
           
            var correctScore = CorrectQuestionLength * 4;
            var wrongScore = -(WrongQuestionLength* 1);
            var accuracy = 0;

            accuracy = correctScore + wrongScore;

            await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
            let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1}).select().populate('LeaderBoardToProfileJoin');
            let LeaderboardListTopTen=LeaderBoardList.slice(0,10);

            let userRank=0;

            for(let i=0;i<LeaderBoardList.length;i++)
            {
                if(LeaderBoardList[i].EMAIL==req.user.EMAIL)
                {
                    userRank=i+1;
                    break;
                }
            }
            let leaderboardData = await STUDENT_LEADERBOARD_COLLECTION.findOne({CHAPTER_ID:req.body.Chapter, CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CONCEPT_ID: req.body.Concept, EMAIL: req.user.EMAIL});
            let restarts = leaderboardData.RESTARTS;    
                
            res.render('ConceptDashboardComplete',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalLevelQuestionLength,CorrectQuestions:CorrectQuestionLength, 
            SkippedQuestions: SkipQuestionLength, WrongQuestions: WrongQuestionLength,
            Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, username:username, restarts:restarts
            });
            return;
        } 
}     
    catch(err)
    {
        //something went wrong
        res.json({ResMsg:`Error occured- ${err.message}`});
        return;
    }
})


module.exports = router;