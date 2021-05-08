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

            let ObjUserPremiumCollection=new USER_PREMIUM_COLLECTION({
                    TRIAL_FLAG:1,
                    EXPIRY_DATE_TIME:ExpiryDate,
                    EMAIL:req.user.EMAIL,
                    CLASS_ID:req.body.Class,
                    COURSE_ID:req.body.Course
                });
                
            await ObjUserPremiumCollection.save();
                
            res.send("Details are successfully saved in premium table");
            return;
            
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
        let MyCoursesArr = await USER_PREMIUM_COLLECTION.find({EMAIL:req.user.EMAIL});

        if(MyCoursesArr.length == 0) {
            res.send("You have not yet subscribed to any course");
            return;
        }

        let availableCourses=[];
        let availableClasses = [];

        let currentDateTime = moment(Date.now());
        var timediffinsec;
     
        for(let i=0;i<MyCoursesArr.length;i++)
        {
            timediffinsec = parseInt(moment.duration(currentDateTime.diff(MyCoursesArr[i] && MyCoursesArr[i].EXPIRY_DATE_TIME)).asSeconds(),10);
            if(timediffinsec < 0) {
                availableCourses[i] = MyCoursesArr[i].COURSE_ID;
                availableClasses[i] = MyCoursesArr[i].CLASS_ID;
            }
        }

        if(availableCourses.length == 0 || availableClasses.length == 0) {
            res.send("Your Subscription has expired");
            return;
        }
        
        let allCourses =await COURSE_IMG_COLLECTION.find({CLASS_ID: { $in: availableClasses }, COURSE_ID: { $in: availableCourses }});

       // res.send("You have subscribed courses available");
        
       res.render('MyCourses',{allCourses:allCourses});
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

        if(!req.body.Class || !req.body.Course || !req.body.CourseImg)
            
        {
            res.send("Invalid Request Parameters");
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
            COURSE_IMG : req.body.CourseImg
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
     let userName = userStr.USERNAME;

    let AttemptedQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class, EMAIL:req.user.EMAIL});
    let AttemptedQuestionArray=[];
    for(let i=0;i<AttemptedQuestionList.length;i++)
    {
        AttemptedQuestionArray.push(AttemptedQuestionList[i].QUESTION_ID );
    }

    let NewQuestion=await All_QUESTIONS_COLLECTION.findOne({QUESTION_ID: { $nin: AttemptedQuestionArray },CONCEPT_ID:req.body.Concept, CHAPTER_ID:req.body.Chapter, COURSE_ID:req.body.Course, CLASS_ID:req.body.Class});
    if(NewQuestion)
    {
        res.render('SolveQuestions',{Question:NewQuestion.QUESTION,OptionA:NewQuestion.OptionA ,OptionB:NewQuestion.OptionB,OptionC:NewQuestion.OptionC,OptionD:NewQuestion.OptionD,CorrectOption:NewQuestion.CORRECT_OPT ,Explanation:NewQuestion.EXPLANATION,QuestionImg:NewQuestion.Q_IMG ,ExplainationImg:NewQuestion.EXPLANATION_IMAGE,QuestionId:NewQuestion.QUESTION_ID, Ques_Img_flag:NewQuestion.QUESTION_IMG_FLAG, Ans_img_flag:NewQuestion.ANS_IMG_FLAG, Concept:NewQuestion.CONCEPT_ID, Chapter:NewQuestion.CHAPTER_ID, Class:NewQuestion.CLASS_ID, Course:NewQuestion.COURSE_ID, ShowAnswer:0, submittedInput:"", ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, userName: userName});
        return;
    }
    else
    {
        try
        {
            let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});          
            let CorrectQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:1});
            let SkipQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, INPUT_OPT:"SKIPPED"});     
            let WrongQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:0}); 

            if(!TotalQuestionList) {
                TotalQuestionList.length = 0;
            }
            
            if(!CorrectQuestionList) {
                CorrectQuestionList.length = 0;
            }
    
            if(!SkipQuestionList) {
                SkipQuestionList.length = 0;
            }
    
            if(!WrongQuestionList) {    
                WrongQuestionList.length = 0;
            }
            
            var correctScore = CorrectQuestionList.length * 4;
            var wrongScore = -(WrongQuestionList.length * 1);
            var accuracy = 0;

            accuracy = correctScore + wrongScore;
        
            //await STUDENT_LEADERBOARD_COLLECTION.update({EMAIL:req.user.EMAIL,ACCURACY:accuracy, CONCEPT_ID:req.body.Concept, CLASS_ID:req.body.Class, CHAPTER_ID: req.body.Chapter ,COURSE_ID: req.body.Course},{}, {upsert: true,setDefaultsOnInsert: true});

            
               //res.render (Leaderboard)

               await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
               let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1});
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
               console.log(userRank);
                   
               //res.status(200).json({ ErrCode: 0, ResMsg: "Data insertion Successful."});
                
                  res.render('ConceptDashboardComplete',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionList.length, 
                   SkippedQuestions: SkipQuestionList.length, WrongQuestions: WrongQuestionList.length,
                   Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum
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
    catch(err)
    {
        //logger
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
         let userName = userStr.USERNAME;

         console.log(req.body.inputAns);

         //NEWLY ADDED. LAST QUESTION ON SUBMIT WILL REFLECT ON LEADERBOARD IF NOT PROCEEDED.
         let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});          
         let CorrectQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:1});
         let SkipQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, INPUT_OPT:"SKIPPED"});     
         let WrongQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:0}); 

         //Update on Leaderboard only if concept is complete
        if ((CorrectQuestionList.length + WrongQuestionList.length + SkipQuestionList.length) == TotalQuestionList.length) {
            await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
            let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1});
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
             console.log('Your Answer is recorded in DB');
         }
         catch(err) {
             console.log(err);
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
                        res.render('SolveQuestions',{Question:NewQuestion.QUESTION,OptionA:NewQuestion.OptionA ,OptionB:NewQuestion.OptionB,OptionC:NewQuestion.OptionC,OptionD:NewQuestion.OptionD,CorrectOption:NewQuestion.CORRECT_OPT ,Explanation:NewQuestion.EXPLANATION,QuestionImg:NewQuestion.Q_IMG ,ExplainationImg:NewQuestion.EXPLANATION_IMAGE,QuestionId:NewQuestion.QUESTION_ID, Ques_Img_flag:NewQuestion.QUESTION_IMG_FLAG, Ans_img_flag:NewQuestion.ANS_IMG_FLAG, Concept:NewQuestion.CONCEPT_ID, Chapter:NewQuestion.CHAPTER_ID, Class:NewQuestion.CLASS_ID, Course:NewQuestion.COURSE_ID, ShowAnswer:0, submittedInput:"", ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, userName: userName});
                        return;
                    }
                    else
                    {
                        try
                    {
                     let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});          
                     let CorrectQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:1});
                     let SkipQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, INPUT_OPT:"SKIPPED"});     
                     let WrongQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:0}); 
        
                    if(!TotalQuestionList) {
                        TotalQuestionList.length = 0;
                    }
                    
                    if(!CorrectQuestionList) {
                        CorrectQuestionList.length = 0;
                    }
            
                    if(!SkipQuestionList) {
                        SkipQuestionList.length = 0;
                    }
            
                    if(!WrongQuestionList) {    
                        WrongQuestionList.length = 0;
                    }
                    
                    var correctScore = CorrectQuestionList.length * 4;
                    var wrongScore = -(WrongQuestionList.length * 1);
                    var accuracy = 0;

                    accuracy = correctScore + wrongScore;
                     
                    await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
                    let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1});
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
                    console.log(userRank);
                             
                    //res.status(200).json({ ErrCode: 0, ResMsg: "Data insertion Successful."});
                     
                       res.render('ConceptDashboardComplete',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionList.length, 
                        SkippedQuestions: SkipQuestionList.length, WrongQuestions: WrongQuestionList.length,
                        Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum
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
                        res.render('SolveQuestions',{Question:NewQuestion.QUESTION,OptionA:NewQuestion.OptionA ,OptionB:NewQuestion.OptionB,OptionC:NewQuestion.OptionC,OptionD:NewQuestion.OptionD,CorrectOption:NewQuestion.CORRECT_OPT ,Explanation:NewQuestion.EXPLANATION,QuestionImg:NewQuestion.Q_IMG ,ExplainationImg:NewQuestion.EXPLANATION_IMAGE,QuestionId:NewQuestion.QUESTION_ID, Ques_Img_flag:NewQuestion.QUESTION_IMG_FLAG, Ans_img_flag:NewQuestion.ANS_IMG_FLAG, Concept:NewQuestion.CONCEPT_ID, Chapter:NewQuestion.CHAPTER_ID, Class:NewQuestion.CLASS_ID, Course:NewQuestion.COURSE_ID, ShowAnswer:1, submittedInput:req.body.inputAns, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, userName: userName});
                        return;
                    }
                    else
                    {
                        try
                    {
                    let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});          
                    let CorrectQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:1});
                    let SkipQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, INPUT_OPT:"SKIPPED"});     
                    let WrongQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:0}); 
        
                    if(!TotalQuestionList) {
                        TotalQuestionList.length = 0;
                    }
                    
                    if(!CorrectQuestionList) {
                        CorrectQuestionList.length = 0;
                    }
            
                    if(!SkipQuestionList) {
                        SkipQuestionList.length = 0;
                    }
            
                    if(!WrongQuestionList) {    
                        WrongQuestionList.length = 0;
                    }
                    
                    var correctScore = CorrectQuestionList.length * 4;
                    var wrongScore = -(WrongQuestionList.length * 1);
                    var accuracy = 0;

                    accuracy = correctScore + wrongScore;
                   
                    await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
                    let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1});
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
                    console.log(userRank);
                        
                    //res.status(200).json({ ErrCode: 0, ResMsg: "Data insertion Successful."});
                     
                       res.render('ConceptDashboardComplete',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionList.length, 
                        SkippedQuestions: SkipQuestionList.length, WrongQuestions: WrongQuestionList.length,
                        Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum
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
       let userName = userStr.USERNAME;

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
                res.render('SolveQuestions',{Question:NewQuestion.QUESTION,OptionA:NewQuestion.OptionA ,OptionB:NewQuestion.OptionB,OptionC:NewQuestion.OptionC,OptionD:NewQuestion.OptionD,CorrectOption:NewQuestion.CORRECT_OPT ,Explanation:NewQuestion.EXPLANATION,QuestionImg:NewQuestion.Q_IMG ,ExplainationImg:NewQuestion.EXPLANATION_IMAGE,QuestionId:NewQuestion.QUESTION_ID, Ques_Img_flag:NewQuestion.QUESTION_IMG_FLAG, Ans_img_flag:NewQuestion.ANS_IMG_FLAG, Concept:NewQuestion.CONCEPT_ID, Chapter:NewQuestion.CHAPTER_ID, Class:NewQuestion.CLASS_ID, Course:NewQuestion.COURSE_ID, ShowAnswer:0, submittedInput:"", ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, userName: userName});
                return;
            }
            else
            {
                try
                    {
                    let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});          
                    let CorrectQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:1});
                    let SkipQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, INPUT_OPT:"SKIPPED"});     
                    let WrongQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:0}); 
        
                    if(!TotalQuestionList) {
                        TotalQuestionList.length = 0;
                    }
                    
                    if(!CorrectQuestionList) {
                        CorrectQuestionList.length = 0;
                    }
            
                    if(!SkipQuestionList) {
                        SkipQuestionList.length = 0;
                    }
            
                    if(!WrongQuestionList) {    
                        WrongQuestionList.length = 0;
                    }
                    
                    var correctScore = CorrectQuestionList.length * 4;
                    var wrongScore = -(WrongQuestionList.length * 1);
                    var accuracy = 0;

                    accuracy = correctScore + wrongScore;
                   
                    await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
                    let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1});
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
                    console.log(userRank);
                        
                    //res.status(200).json({ ErrCode: 0, ResMsg: "Data insertion Successful."});
                     
                       res.render('ConceptDashboardComplete',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionList.length, 
                        SkippedQuestions: SkipQuestionList.length, WrongQuestions: WrongQuestionList.length,
                        Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum
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
        if(!req.body.quesNum || !req.body.Concept || !req.body.Course || !req.body.Class || !req.body.Chapter || !req.body.ChapNum || !req.body.ConceptNum)
        {
           res.send("Invalid Request Parameters");
           return;
           //logger
        }

        //Fetch User Name
        let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
        let userName = userStr.USERNAME;

        let AttemptedQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class, EMAIL:req.user.EMAIL}).sort({ANSWER_DATE_TIME: -1});;
        let AttemptedQuestionArray=[];
        let submittedInputArray=[];
        for(let i=0;i<AttemptedQuestionList.length;i++)
        {
            AttemptedQuestionArray.push(AttemptedQuestionList[i].QUESTION_ID);
            submittedInputArray.push(AttemptedQuestionList[i].INPUT_OPT);
        }

        let quesNum = req.body.quesNum;
        var quesId = AttemptedQuestionArray[quesNum];
        var submittedInput = submittedInputArray[quesNum];

        let NewQuestion =await All_QUESTIONS_COLLECTION.findOne({QUESTION_ID:quesId, CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class});
        if (NewQuestion) {
            quesNum++;
            res.render('ReviewAnswers',{Question:NewQuestion.QUESTION,OptionA:NewQuestion.OptionA ,OptionB:NewQuestion.OptionB,OptionC:NewQuestion.OptionC,OptionD:NewQuestion.OptionD,CorrectOption:NewQuestion.CORRECT_OPT ,Explanation:NewQuestion.EXPLANATION,QuestionImg:NewQuestion.Q_IMG ,ExplainationImg:NewQuestion.EXPLANATION_IMAGE,QuestionId:NewQuestion.QUESTION_ID, Ques_Img_flag:NewQuestion.QUESTION_IMG_FLAG, Ans_img_flag:NewQuestion.ANS_IMG_FLAG, Concept:NewQuestion.CONCEPT_ID, Chapter:NewQuestion.CHAPTER_ID, Class:NewQuestion.CLASS_ID, Course:NewQuestion.COURSE_ID, submittedInput:submittedInput, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, userName: userName, quesNum: quesNum});
            return;
        }

        else {
            let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});          
        
            let CorrectQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:1});          
            let SkipQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, INPUT_OPT:"SKIPPED"});     
            let WrongQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:0}); 
            
            if(!TotalQuestionList) {
                TotalQuestionList.length = 0;
            }
            
            if(!CorrectQuestionList) {
                CorrectQuestionList.length = 0;
            }

            if(!SkipQuestionList) {
                SkipQuestionList.length = 0;
            }

            if(!WrongQuestionList) {    
                WrongQuestionList.length = 0;
            } 
            
            var correctScore = CorrectQuestionList.length * 4;
            var wrongScore = -(WrongQuestionList.length * 1);
            var accuracy = 0;

            accuracy = correctScore + wrongScore;

            let LeaderBoardList1 = await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1});
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
            console.log(userRank);
                
            //res.status(200).json({ ErrCode: 0, ResMsg: "Data insertion Successful."});

            if(TotalQuestionList.length == (CorrectQuestionList.length + WrongQuestionList.length +  SkipQuestionList.length))
                {
                    res.render('ConceptDashboardComplete',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionList.length, 
                        SkippedQuestions: SkipQuestionList.length, WrongQuestions: WrongQuestionList.length,
                        Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter,
                        ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum
                    });  
                    return;
                }
    
            res.render('ConceptDashboard',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionList.length, 
                SkippedQuestions: SkipQuestionList.length, WrongQuestions: WrongQuestionList.length,
                Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter,
                ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum
            });

        }
    }

    catch(err)
    {
        //logger
        res.json({ResMsg:`Error Occured`});
    }
});

router.post('/ShowChapters', IsLoggedIn, async function(req,res,next) {
    try
    {
        if(!(req.body.ClassId && req.body.CourseId))
        {
            res.json({ResMsg:"Invalid request parameters"});
            return;
        }
       // let ChaptersArr=await All_QUESTIONS_COLLECTION.distinct("CHAPTER_ID",{CLASS_ID:req.body.ClassId,COURSE_ID:req.body.CourseId});
    
       //Fetch User Name
       let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
       let userName = userStr.USERNAME;

        let ChapArr = await CHAPTER_IMG_COLLECTION.find({CLASS_ID:req.body.ClassId,COURSE_ID:req.body.CourseId}).sort({CHAPTER_NUM: 1});  
        let Chapter = null;

        //Newly Addded
        let ChapterName = [];
        for(let i=0; i<ChapArr.length;i++) {
            ChapterName[i] = ChapArr[i].CHAPTER_ID;
        }
        let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.ClassId, COURSE_ID: req.body.CourseId, CHAPTER_ID: { $in: ChapterName}}).sort({CHAPTER_NUM: 1});          
        let SolvedQuestionsList = await STUDENT_PERFORMANCE_COLLECTION.find({EMAIL:req.user.EMAIL, CLASS_ID: req.body.ClassId, COURSE_ID: req.body.CourseId, CHAPTER_ID: { $in: ChapterName}}).sort({CHAPTER_NUM: 1});
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
            res.render('AllChaptersTrial',{Concepts: ChapArr, ClassId:req.body.ClassId, CourseId:req.body.CourseId, SolvedPercent: SolvedPercent, TotalConcepts: ChapArr.length, userName: userName});
         }
        else {
            res.render('ChaptersConcepts',{Concepts: ChapArr, ClassId:req.body.ClassId, CourseId:req.body.CourseId, SolvedPercent: SolvedPercent, TotalConcepts: ChapArr.length, userName: userName});
        }
        return;
    }
    catch(err)
    {
        //logger
        res.json({ResMsg:`Error Occured`});
    }

});

router.post('/ShowConcepts', IsLoggedIn, async function(req,res,next) {
    try
    {
        if(!(req.body.ClassId && req.body.CourseId && req.body.ChapterId && req.body.ChapNum))
        {
            res.json({ResMsg:"Invalid request parameters"});
            return;
        }
       // let ConceptsArr=await All_QUESTIONS_COLLECTION.distinct("CONCEPT_ID",{CLASS_ID:req.body.ClassId,COURSE_ID:req.body.CourseId,CHAPTER_ID:req.body.ChapterId});
       
       //Fetch User Name
       let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
       let userName = userStr.USERNAME;

       //NEWLY ADDED. Don't Show Concepts if Course is not subscribed.

       let premiumData = await USER_PREMIUM_COLLECTION.findOne({EMAIL:req.user.EMAIL, CLASS_ID: req.body.ClassId, COURSE_ID: req.body.CourseId});
       let trialFlag = premiumData.TRIAL_FLAG;

       if((trialFlag == 1) && (req.body.ChapNum>5)) {
            res.send("Get buy the full course to view.")
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
        
        res.render('AllConcepts',{Concepts:ConceptsArr,CourseId:req.body.CourseId, ChapterId:req.body.ChapterId, ClassId:req.body.ClassId, SolvedPercent: SolvedPercent, TotalConcepts: ConceptsArr.length, userName: userName, ChapNum: req.body.ChapNum});
        //  res.json({ResMsg:ConceptsArr});
        return;
    }
    catch(err)
    {
        //logger
        res.send("Error ")
    }

});


router.post('/ConceptPerformance', IsLoggedIn, async function(req,res,next) {

    try{
        if(!(req.body.Class && req.body.Course && req.body.Chapter && req.body.Concept && req.body.ChapNum && req.body.ConceptNum)) {
            res.json({ResMsg:"Invalid request parameters"});
            return;
        }
        
        let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});          
        
        let CorrectQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:1});          
        let SkipQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, INPUT_OPT:"SKIPPED"});     
        let WrongQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:0}); 
        
        if(!TotalQuestionList) {
            TotalQuestionList.length = 0;
        }
        
        if(!CorrectQuestionList) {
            CorrectQuestionList.length = 0;
        }

        if(!SkipQuestionList) {
            SkipQuestionList.length = 0;
        }

        if(!WrongQuestionList) {    
            WrongQuestionList.length = 0;
        } 
        
        var correctScore = CorrectQuestionList.length * 4;
        var wrongScore = -(WrongQuestionList.length * 1);
        var accuracy = 0;

        accuracy = correctScore + wrongScore;
        

        //Update on Leaderboard if stopped only if concept is complete
        if ((CorrectQuestionList.length + WrongQuestionList.length + SkipQuestionList.length) == TotalQuestionList.length) {
            await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
            let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1});
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


        let LeaderBoardList1 = await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1});
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
        console.log(userRank);
            
        //res.status(200).json({ ErrCode: 0, ResMsg: "Data insertion Successful."});

        if(TotalQuestionList.length == (CorrectQuestionList.length + WrongQuestionList.length +  SkipQuestionList.length))
            {
                res.render('ConceptDashboardComplete',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionList.length, 
                    SkippedQuestions: SkipQuestionList.length, WrongQuestions: WrongQuestionList.length,
                    Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter,
                    ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum
                });  
                return;
            }
   
        res.render('ConceptDashboard',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionList.length, 
            SkippedQuestions: SkipQuestionList.length, WrongQuestions: WrongQuestionList.length,
            Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter,
            ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum
          });
    }

    catch(err)
        {
            res.send("Error");
        }
});

router.post('/ResetConcept', IsLoggedIn, async function(req, res) {

    try{
        if(!(req.body.Class && req.body.Course && req.body.Chapter && req.body.Concept && req.body.ChapNum && req.body.ConceptNum)) {
            res.render('error');
            return;
        }
        let leaderboardData = await STUDENT_LEADERBOARD_COLLECTION.findOne({CHAPTER_ID:req.body.Chapter, CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CONCEPT_ID: req.body.Concept, EMAIL: req.user.EMAIL});
        if(leaderboardData && (leaderboardData.RESTARTS==0))
        {
            res.send('No more restarts left');
            return;
        }

        await STUDENT_LEADERBOARD_COLLECTION.updateOne({CHAPTER_ID:req.body.Chapter, CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CONCEPT_ID: req.body.Concept, EMAIL: req.user.EMAIL},{RESTARTS:leaderboardData.RESTARTS-1},{upsert: true, setDefaultsOnInsert: false});
    
        await STUDENT_PERFORMANCE_COLLECTION.deleteMany({CHAPTER_ID:req.body.Chapter, CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CONCEPT_ID: req.body.Concept, CHAPTER_NUM: req.body.ChapNum, CONCEPT_NUM: req.body.ConceptNum, EMAIL: req.user.EMAIL});
        

        //Fetch User Name
       let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
       let userName = userStr.USERNAME;

      
    let AttemptedQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CONCEPT_ID:req.body.Concept, CHAPTER_ID: req.body.Chapter, COURSE_ID: req.body.Course, CLASS_ID: req.body.Class, EMAIL:req.user.EMAIL});
    let AttemptedQuestionArray=[];
    for(let i=0;i<AttemptedQuestionList.length;i++)
    {
        AttemptedQuestionArray.push(AttemptedQuestionList[i].QUESTION_ID );
    }

    let NewQuestion=await All_QUESTIONS_COLLECTION.findOne({QUESTION_ID: { $nin: AttemptedQuestionArray },CONCEPT_ID:req.body.Concept, CHAPTER_ID:req.body.Chapter, COURSE_ID:req.body.Course, CLASS_ID:req.body.Class});
    if(NewQuestion)
    {
        res.render('SolveQuestions',{Question:NewQuestion.QUESTION,OptionA:NewQuestion.OptionA ,OptionB:NewQuestion.OptionB,OptionC:NewQuestion.OptionC,OptionD:NewQuestion.OptionD,CorrectOption:NewQuestion.CORRECT_OPT ,Explanation:NewQuestion.EXPLANATION,QuestionImg:NewQuestion.Q_IMG ,ExplainationImg:NewQuestion.EXPLANATION_IMAGE,QuestionId:NewQuestion.QUESTION_ID, Ques_Img_flag:NewQuestion.QUESTION_IMG_FLAG, Ans_img_flag:NewQuestion.ANS_IMG_FLAG, Concept:NewQuestion.CONCEPT_ID, Chapter:NewQuestion.CHAPTER_ID, Class:NewQuestion.CLASS_ID, Course:NewQuestion.COURSE_ID, ShowAnswer:0, submittedInput:"", ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum, Theme: req.body.Theme, userName: userName});
        return;
    }
    else
    {
        try
        {
            let TotalQuestionList=await All_QUESTIONS_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept});          
            let CorrectQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:1});
            let SkipQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, INPUT_OPT:"SKIPPED"});     
            let WrongQuestionList=await STUDENT_PERFORMANCE_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept,EMAIL:req.user.EMAIL, CORRECT_FLAG:0}); 

            if(!TotalQuestionList) {
                TotalQuestionList.length = 0;
            }
            
            if(!CorrectQuestionList) {
                CorrectQuestionList.length = 0;
            }
    
            if(!SkipQuestionList) {
                SkipQuestionList.length = 0;
            }
    
            if(!WrongQuestionList) {    
                WrongQuestionList.length = 0;
            }
            
            var correctScore = CorrectQuestionList.length * 4;
            var wrongScore = -(WrongQuestionList.length * 1);
            var accuracy = 0;

            accuracy = correctScore + wrongScore;
        
            //await STUDENT_LEADERBOARD_COLLECTION.update({EMAIL:req.user.EMAIL,ACCURACY:accuracy, CONCEPT_ID:req.body.Concept, CLASS_ID:req.body.Class, CHAPTER_ID: req.body.Chapter ,COURSE_ID: req.body.Course},{}, {upsert: true,setDefaultsOnInsert: true});

            
               //res.render (Leaderboard)

               await STUDENT_LEADERBOARD_COLLECTION.updateMany({EMAIL:req.user.EMAIL,CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept},{ACCURACY:accuracy},{upsert: true, setDefaultsOnInsert: false});          
               let LeaderBoardList=await STUDENT_LEADERBOARD_COLLECTION.find({CLASS_ID: req.body.Class, COURSE_ID: req.body.Course, CHAPTER_ID: req.body.Chapter, CONCEPT_ID:req.body.Concept}).sort({ACCURACY: -1}).limit(100).select({ "ACCURACY": 1, "EMAIL": 1});
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
               console.log(userRank);
                   
               //res.status(200).json({ ErrCode: 0, ResMsg: "Data insertion Successful."});
                
                  res.render('ConceptDashboardComplete',{LeaderboardList:LeaderboardListTopTen, userRank: userRank, TotalQuestions:TotalQuestionList.length,CorrectQuestions:CorrectQuestionList.length, 
                   SkippedQuestions: SkipQuestionList.length, WrongQuestions: WrongQuestionList.length,
                   Course:req.body.Course, Concept:req.body.Concept, Class:req.body.Class, Chapter: req.body.Chapter, ChapNum: req.body.ChapNum, ConceptNum: req.body.ConceptNum
                 });
                return;
        }

        catch(err)
        {
            console.log("DB Connection Error: "+err.message);
            res.render('error');
          //  res.status(200).json({ ErrCode: 7, ResMsg: "DB Connection Error"});
            return;
        }
        //res.send("Concept Completed");
     }
   }

    catch(err) {
        res.render('error');
    }
})


router.post('/BuyNow', IsLoggedIn, async function(req, res) {
    try{
        if(!(req.body.Class && req.body.Course && req.body.Price && req.body.TrialFlag)) {
            res.render('error');
            return;
        }
        

    }
    catch(err) {
        res.render('error');
    }

});


module.exports = router;