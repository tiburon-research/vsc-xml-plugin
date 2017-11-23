var ManualCode = [
    {
        Name: "CurrentSurvey",
        Kind: "Variable",
        Detail: "Object"
    },
    {
        Name: "ToString()",
        Kind: "Method",
        Parent: "[\\w\\d]+"
    },
    {
        Name: "CurrentInterview",
        Kind: "Variable",
        Detail: "int"
    },
    {
        Name: "InterviewPars",
        Kind: "Variable",
        Detail: "Object"
    },
    {
        Name: "GetInstance()",
        Kind: "Method",
        Parent: "InterviewPars"
    },
    {
        Name: "PageId",
        Kind: "Property",
        Parent: "InterviewPars\\.GetInstance\\(\\)"
    },
    {
        Name: "InterviewID",
        Kind: "Property",
        Detail: "int",
        Parent: "InterviewPars\\.GetInstance\\(\\)"
    },
    {
        Name: "ProjectId",
        Kind: "Property",
        Parent: "InterviewPars\\.GetInstance\\(\\)"
    },
    {
        Name: "Pages",
        Kind: "Property",
        Parent: "CurrentSurvey"
    },
    {
        Name: "QuestionPage",
        Kind: "Property",
        Parent: "CurrentSurvey"
    },
    {
        Name: "QuestionPage",
        Kind: "Property",
        Parent: "CurrentSurvey"
    },
    {
        Name: "ID",
        Kind: "Property",
        Parent: "CurrentSurvey"
    },
    {
        Name: "Lists",
        Kind: "Property",
        Parent: "CurrentSurvey"
    },
    {
        Name: "Contains",
        Kind: "Method",
        Parent: "CurrentSurvey\\.Lists"
    },
    {
        Name: "Items",
        Kind: "Property",
        Parent: "CurrentSurvey\\.Lists\\[.*\\]"
    },
    {
        Name: "Contains",
        Kind: "Method",
        Parent: "CurrentSurvey\\.Lists\\[.*\\]\\.Items"
    },
    {
        Name: "Text",
        Kind: "Property",
        Detail: "string",
        Parent: "CurrentSurvey\\.Lists\\[.*\\]\\.Items\\[.*\\]"
    },
    {
        Name: "Vars",
        Kind: "Property",
        Detail: "string[]",
        Parent: "CurrentSurvey\\.Lists\\[.*\\]\\.Items\\[.*\\]"
    },
    {
        Name: "ID",
        Kind: "Property",
        Detail: "string",
        Parent: "CurrentSurvey\\.Lists\\[.*\\]\\.Items\\[.*\\]"
    },
    {
        Name: "Questions",
        Kind: "Property",
        Parent: "CurrentSurvey\\.Pages\\[.*\\]"
    },
    {
        Name: "Header",
        Kind: "Property",
        Parent: "CurrentSurvey\\.Pages\\[.*\\]"
    },
    {
        Name: "HasStore",
        Kind: "Property",
        Parent: "CurrentSurvey\\.Pages\\[.*\\]"
    },
    {
        Name: "BlockID",
        Kind: "Property",
        Parent: "CurrentSurvey\\.Pages\\[.*\\]"
    },
    {
        Name: "Text",
        Kind: "Property",
        Parent: "CurrentSurvey\\.Pages\\[.*\\]\\.Questions\\[.*\\]"
    },
    {
        Name: "Answers",
        Kind: "Property",
        Parent: "CurrentSurvey\\.Pages\\[.*\\]\\.Questions\\[.*\\]"
    },
    {
        Name: "Text",
        Kind: "Property",
        Parent: "CurrentSurvey\\.Pages\\[.*\\]\\.Questions\\[.*\\]\\.Answers\\[.*\\]"
    },
    {
        Name: "Header",
        Kind: "Property",
        Parent: "CurrentSurvey\\.Pages\\[.*\\]\\.Questions\\[.*\\]\\.Answers\\[.*\\]"
    }
];


var KnownCode = [
    {
        "Name": "PinQuestion",
        "Detail": "string",
        "Kind": "Property",
        Parent: "this",
        "Documentation": "string PinQuestion",
        ParentTag: "Validate"
    },
    {
        "Name": "PinAnswer",
        "Detail": "string",
        "Kind": "Property",
        Parent: "this",
        "Documentation": "string PinAnswer",
        ParentTag: "Validate"
    },
    {
        "Name": "Message",
        "Detail": "string",
        "Kind": "Property",
        Parent: "this",
        "Documentation": "string Message",
        ParentTag: "Validate"
    },
    {
        "Name": "MessageGeneral",
        "Detail": "string",
        "Kind": "Property",
        Parent: "this",
        "Documentation": "string MessageGeneral",
        ParentTag: "Validate"
    },
    {
        "Name": "Status",
        "Detail": "int",
        "Kind": "Property",
        Parent: "this",
        "Documentation": "int Status",
        ParentTag: "Redirect"
    },
    {
        "Name": "Page",
        "Detail": "string",
        "Kind": "Property",
        Parent: "this",
        "Documentation": "string Page",
        ParentTag: "Redirect"
    },
    {
        "Name": "Url",
        "Detail": "string",
        "Kind": "Property",
        Parent: "this",
        "Documentation": "string Url",
        ParentTag: "Redirect"
    },
    {
        "Name": "CurrentInterview",
        "Detail": "int",
        "Kind": "Property",
        Parent: "this",
        "Documentation": "int CurrentInterview",
        ParentTag: "Redirect"
    },
    {
        "Name": "CurrentInterviewOrder",
        "Detail": "int",
        "Kind": "Property",
        Parent: "this",
        "Documentation": "int CurrentInterviewOrder",
        ParentTag: "Redirect"
    },
    {
        "Name": "InterviewExists",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool InterviewExists(string questionId, string answerId, string val)"
    },
    {
        "Name": "AnswerInsert",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void AnswerInsert(string pageId, string questionId, string answerId, string val)"
    },
    {
        "Name": "AnswerInsert",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void AnswerInsert(string pageId, string questionId, string answerId)"
    },
    {
        "Name": "ExtInterviewAnswerInsert",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void ExtInterviewAnswerInsert(int interviewId, string pageId, string questionId, string answerId, string val)"
    },
    {
        "Name": "ExtInterviewAnswerInsert",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void ExtInterviewAnswerInsert(int interviewId, string pageId, string questionId, string answerId)"
    },
    {
        "Name": "ExtInterviewAnswerUpdate",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void ExtInterviewAnswerUpdate(int interviewId, string pageId, string questionId, string answerId, string val)"
    },
    {
        "Name": "ExtInterviewAnswerDelete",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void ExtInterviewAnswerDelete(int interviewId, string pageId, string questionId, string answerId)"
    },
    {
        "Name": "ExtInterviewAnswerDelete",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void ExtInterviewAnswerDelete(int interviewId, string questionId, string answerId)"
    },
    {
        "Name": "AnswerInsertOnce",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void AnswerInsertOnce(string pageId, string questionId, string answerId, string val)"
    },
    {
        "Name": "AnswerInsertOnce",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void AnswerInsertOnce(string pageId, string questionId, string answerId)"
    },
    {
        "Name": "AnswerUpdateP",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void AnswerUpdateP(string pageId, string questionId, string answerId, string val)"
    },
    {
        "Name": "AnswerUpdateP",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void AnswerUpdateP(string pageId, string questionId, string answerId)"
    },
    {
        "Name": "AnswerUpdate",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void AnswerUpdate(string questionId, string answerId, string val)"
    },
    {
        "Name": "AnswerUpdate",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void AnswerUpdate(string questionId, string answerId)"
    },
    {
        "Name": "PageClear",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void PageClear(string pageId)"
    },
    {
        "Name": "QuestionClear",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void QuestionClear(string questionId)"
    },
    {
        "Name": "QuestionClear",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void QuestionClear(int interviewId, string questionId)"
    },
    {
        "Name": "AnswerClear",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void AnswerClear(string questionId, string answerId)"
    },
    {
        "Name": "AnswerExistsForRange",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool AnswerExistsForRange(string questionId, string srcRange, LogicalOperator oper)"
    },
    {
        "Name": "AnswerExistsAny",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool AnswerExistsAny(string questionId, string srcRange)"
    },
    {
        "Name": "AnswerExistsAll",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool AnswerExistsAll(string questionId, string srcRange)"
    },
    {
        "Name": "AnswerExistsOnce",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool AnswerExistsOnce(string pageId, string questionId, int answerStart, int answerEnd)"
    },
    {
        "Name": "AnswerExistsOnce",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool AnswerExistsOnce(string questionId, int answerStart, int answerEnd)"
    },
    {
        "Name": "AnswerID",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string AnswerID(string pageId, string questionId)"
    },
    {
        "Name": "AnswerID",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string AnswerID(string questionId)"
    },
    {
        "Name": "AnswerExists",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool AnswerExists(string pageId, string questionId, string answerId)"
    },
    {
        "Name": "AnswerExists",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool AnswerExists(string questionId, string srcRangeOrNot)"
    },
    {
        "Name": "ExtAnswerExists",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool ExtAnswerExists(int surveyId, string pageId, string questionId, string answerId)"
    },
    {
        "Name": "ExtAnswerExists",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool ExtAnswerExists(int surveyId, string questionId, string answerId)"
    },
    {
        "Name": "ExtInterviewAnswerExists",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool ExtInterviewAnswerExists(int extInterviewId, string pageId, string questionId, string answerId)"
    },
    {
        "Name": "ExtInterviewAnswerExists",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool ExtInterviewAnswerExists(int extInterviewId, string questionId, string srcRangeOrNot)"
    },
    {
        "Name": "ExtInterviewAnswerExistsForRange",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool ExtInterviewAnswerExistsForRange(int externalInterview, string questionId, string srcRange, LogicalOperator logicalOperator)"
    },
    {
        "Name": "ExtInterviewAnswerExistsAny",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool ExtInterviewAnswerExistsAny(int externalInterview, string questionId, string srcRange)"
    },
    {
        "Name": "ExtInterviewAnswerExistsAny",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool ExtInterviewAnswerExistsAny(int externalInterview, string pageId, string questionId, string srcRange)"
    },
    {
        "Name": "ExtInterviewAnswerExistsAll",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool ExtInterviewAnswerExistsAll(int externalInterview, string questionId, string srcRange)"
    },
    {
        "Name": "CheckRotation",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void CheckRotation(string pageId, string questionId, string answerId, string val)"
    },
    {
        "Name": "AnswerValue",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string AnswerValue(string pageId, string questionId, string answerId)"
    },
    {
        "Name": "AnswerValue",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string AnswerValue(string questionId, string answerId)"
    },
    {
        "Name": "ExtAnswerID",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string ExtAnswerID(int surveyId, string pageId, string questionId)"
    },
    {
        "Name": "ExtAnswerID",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string ExtAnswerID(int surveyId, string questionId)"
    },
    {
        "Name": "ExtAnswerValue",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string ExtAnswerValue(int surveyId, string pageId, string questionId, string answerId)"
    },
    {
        "Name": "ExtAnswerValue",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string ExtAnswerValue(int surveyId, string questionId, string answerId)"
    },
    {
        "Name": "ExtInterviewAnswerValue",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string ExtInterviewAnswerValue(int extInterviewId, string pageId, string questionId, string answerId)"
    },
    {
        "Name": "ExtInterviewAnswerValue",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string ExtInterviewAnswerValue(int extInterviewId, string questionId, string answerId)"
    },
    {
        "Name": "ExtInterview",
        "Detail": "int",
        "Kind": "Function",
        "Documentation": "int ExtInterview(int extSurveyId, string questionId, string answerId, string val)"
    },
    {
        "Name": "ExtInterview",
        "Detail": "int",
        "Kind": "Function",
        "Documentation": "int ExtInterview(int extSurveyId, string interviewRespondent)"
    },
    {
        "Name": "AnswerCount",
        "Detail": "int",
        "Kind": "Function",
        "Documentation": "int AnswerCount(string pageId)"
    },
    {
        "Name": "AnswerCount",
        "Detail": "int",
        "Kind": "Function",
        "Documentation": "int AnswerCount(string pageId, string questionId)"
    },
    {
        "Name": "AnswerCountRange",
        "Detail": "int",
        "Kind": "Function",
        "Documentation": "int AnswerCountRange(string questionId, string srcRange)"
    },
    {
        "Name": "InsertResult",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void InsertResult(string pageId, string questionId, string answerId, string val)"
    },
    {
        "Name": "InsertResult",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void InsertResult(string pageId, string questionId, string answerId)"
    },
    {
        "Name": "AnswerMarked",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string AnswerMarked(string pageId, string questionId)"
    },
    {
        "Name": "AnswerMarked",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string AnswerMarked(string questionId)"
    },
    {
        "Name": "DataExists",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool DataExists(int index, string val)"
    },
    {
        "Name": "ClearResults",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void ClearResults(string pageId)"
    },
    {
        "Name": "ClearResults",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void ClearResults(string pageId, string questionId)"
    },
    {
        "Name": "QuotaCount",
        "Detail": "int",
        "Kind": "Function",
        "Documentation": "int QuotaCount(string quotaId)"
    },
    {
        "Name": "QuotaCount",
        "Detail": "int",
        "Kind": "Function",
        "Documentation": "int QuotaCount(int surveyId, string quotaId)"
    },
    {
        "Name": "QuotaCountStatus",
        "Detail": "int",
        "Kind": "Function",
        "Documentation": "int QuotaCountStatus(string quotaId, int statusId)"
    },
    {
        "Name": "QuotaCountStatus",
        "Detail": "int",
        "Kind": "Function",
        "Documentation": "int QuotaCountStatus(int surveyId, string quotaId, int statusId)"
    },
    {
        "Name": "QuotaLimit",
        "Detail": "int",
        "Kind": "Function",
        "Documentation": "int QuotaLimit(string quotaId)"
    },
    {
        "Name": "QuotaLimit",
        "Detail": "int",
        "Kind": "Function",
        "Documentation": "int QuotaLimit(int surveyId, string quotaId)"
    },
    {
        "Name": "IsEmailCorrect",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool IsEmailCorrect(string email)"
    },
    {
        "Name": "GetAnswerID",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string GetAnswerID(string pageId, string questionId, string val)"
    },
    {
        "Name": "GetAnswerID",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string GetAnswerID(string questionId, string val)"
    },
    {
        "Name": "AnswerDelete",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void AnswerDelete(string pageId, string questionId, string answerId)"
    },
    {
        "Name": "AnswerDelete",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void AnswerDelete(string questionId, string answerId)"
    },
    {
        "Name": "WriteFlash",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string WriteFlash(string id, int width, int height, string filePath, string flashVars)"
    },
    {
        "Name": "WriteFlash",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string WriteFlash(int width, int height, string filePath, string flashVars)"
    },
    {
        "Name": "AnswersSelect",
        "Detail": "DataView",
        "Kind": "Function",
        "Documentation": "DataView AnswersSelect(string pageId)"
    },
    {
        "Name": "AnswersSelect",
        "Detail": "DataView",
        "Kind": "Function",
        "Documentation": "DataView AnswersSelect(string pageId, string questionId)"
    },
    {
        "Name": "AnswerText",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string AnswerText(string pageId, string questionId, string answerId)"
    },
    {
        "Name": "InterviewResultClear",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void InterviewResultClear()"
    },
    {
        "Name": "InterviewStatusChange",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void InterviewStatusChange(int statusId)"
    },
    {
        "Name": "QuestionText",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string QuestionText(string pageId, string questionId)"
    },
    {
        "Name": "QuestionHeader",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string QuestionHeader(string pageId, string questionId)"
    },
    {
        "Name": "PageHeader",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string PageHeader(string pageId)"
    },
    {
        "Name": "MixItera",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string MixItera(int defaultItera)"
    },
    {
        "Name": "BlockItera",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string BlockItera(int defaultItera)"
    },
    {
        "Name": "PlayAudio",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string PlayAudio(string audioPath, bool autoPlay)"
    },
    {
        "Name": "PlayAudio",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string PlayAudio(string audioPath)"
    },
    {
        "Name": "PlayVideo",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string PlayVideo(string videoPath, string splashPath)"
    },
    {
        "Name": "PlayVideo",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string PlayVideo(string videPath)"
    },
    {
        "Name": "GetDateDiff",
        "Detail": "DateResult",
        "Kind": "Function",
        "Documentation": "DateResult GetDateDiff(DateTime currentDate, DateTime subtractDate)"
    },
    {
        "Name": "GetAge",
        "Detail": "DateResult",
        "Kind": "Function",
        "Documentation": "DateResult GetAge(DateTime subtractDate)"
    },
    {
        "Name": "GetInt",
        "Detail": "int",
        "Kind": "Function",
        "Documentation": "int GetInt(string rawValue, int def = -1000)"
    },
    {
        "Name": "TryGetInt",
        "Detail": "int",
        "Kind": "Function",
        "Documentation": "int TryGetInt(string rawValue)"
    },
    {
        "Name": "GetDouble",
        "Detail": "double",
        "Kind": "Function",
        "Documentation": "double GetDouble(string rawValue)"
    },
    {
        "Name": "GetFloat",
        "Detail": "float",
        "Kind": "Function",
        "Documentation": "float GetFloat(string rawValue)"
    },
    {
        "Name": "GetDateTime",
        "Detail": "DateTime",
        "Kind": "Function",
        "Documentation": "DateTime GetDateTime(string rawValue)"
    },
    {
        "Name": "InterviewStartDate",
        "Detail": "DateTime",
        "Kind": "Function",
        "Documentation": "DateTime InterviewStartDate()"
    },
    {
        "Name": "ListText",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string ListText(string listId, string itemId)"
    },
    {
        "Name": "MailSend",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void MailSend(string recipient, string body, string subject)"
    },
    {
        "Name": "MailSend",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void MailSend(string recipient, string recipientBlind, string body, string subject)"
    },
    {
        "Name": "MailSend",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void MailSend(string mailFrom, string recipient, string recipientBlind, string body, string subject, string attachments)"
    },
    {
        "Name": "GetListItemVar",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string GetListItemVar(string listId, string itemId, int varIndex)"
    },
    {
        "Name": "GetListItemVar",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string GetListItemVar(string listId, int itemIndex, int varIndex)"
    },
    {
        "Name": "GetListItemText",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string GetListItemText(string listId, string itemId)"
    },
    {
        "Name": "GetListItemText",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string GetListItemText(string listId, int itemIndex)"
    },
    {
        "Name": "AuthCookieReset",
        "Detail": "void",
        "Kind": "Function",
        "Documentation": "void AuthCookieReset()"
    },
    {
        "Name": "getRedirectUrl",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string getRedirectUrl()"
    },
    {
        "Name": "GetPageTime",
        "Detail": "DateTime",
        "Kind": "Function",
        "Documentation": "DateTime GetPageTime(string pageId, string side = \"Client\")"
    },
    {
        "Name": "DataHashExist",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool DataHashExist(string hash)"
    }
];




export const Code = ManualCode.concat(KnownCode);


export const Attributes = {
    "Settings": [
        {
            "Name": "LogoText",
            "Type": "String"
        },
        {
            "Name": "StartPage",
            "Default": "pre_data",
            "Type": "String"
        },
        {
            "Name": "CompletePage",
            "Type": "String"
        },
        {
            "Name": "ClosePage",
            "Type": "String"
        },
        {
            "Name": "CompleteUrl",
            "Type": "String"
        },
        {
            "Name": "UrlSuccess",
            "Default": "//launch.survstat.ru/finish?id=@RespID&type=@StatusID&sel=@AnswerValue('pre_data', 'sel')",
            "Type": "String"
        },
        {
            "Name": "UrlScreenoutEarly",
            "Default": "//launch.survstat.ru/finish?id=@RespID&type=@StatusID&sel=@AnswerValue('pre_data', 'sel')",
            "Type": "String"
        },
        {
            "Name": "UrlScreenoutLate",
            "Default": "//launch.survstat.ru/finish?id=@RespID&type=@StatusID&sel=@AnswerValue('pre_data', 'sel')",
            "Type": "String"
        },
        {
            "Name": "UrlQuota",
            "Default": "//launch.survstat.ru/finish?id=@RespID&type=@StatusID&sel=@AnswerValue('pre_data', 'sel')",
            "Type": "String"
        },
        {
            "Name": "ExtPars",
            "Default": "resp/Внешний ID,s/Пол,a/Возраст",
            "Type": "String"
        },
        {
            "Name": "Culture",
            "Default": "ru-RU",
            "Type": "String"
        },
        {
            "Name": "StatusAltSuccess",
            "Type": "String"
        },
        {
            "Name": "StatusAltScreenoutEarly",
            "Type": "String"
        },
        {
            "Name": "StatusAltScreenoutLate",
            "Type": "String"
        },
        {
            "Name": "StatusAltQuota",
            "Type": "String"
        },
        {
            "Name": "TimeoutMessage",
            "Default": "Данные на странице устарели. Обновляем..",
            "Type": "String"
        },
        {
            "Name": "DbDataConnection",
            "Type": "String"
        },
        {
            "Name": "UrlAgreement",
            "Default": "https://survey.survstat.ru/agreement",
            "Type": "String"
        },
        {
            "Name": "UrlPrivacy",
            "Default": "https://docs.survstat.ru/privacy",
            "Type": "String"
        },
        {
            "Name": "SupportServiceUrl",
            "Default": "https://support-api.survstat.ru/",
            "Type": "String"
        },
        {
            "Name": "SupportServicePassword",
            "Default": "KbzQ3vyeAq",
            "Type": "String"
        },
        {
            "Name": "ExtLibs",
            "Type": "String"
        },
        {
            "Name": "PrefferedDelimiter",
            "Default": "@",
            "Type": "String"
        },
        {
            "Name": "Utf8",
            "Type": "Boolean"
        },
        {
            "Name": "AutoMonadic",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "ColorConstructor",
            "Default": "false",
            "DbValue": "true",
            "Type": "Boolean"
        },
        {
            "Name": "UseNewMix",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "UseJSManager",
            "Default": "false",
            "Type": "Boolean"
        },
        {
            "Name": "UseNewQuotas",
            "Default": "false",
            "Type": "Boolean"
        }
    ],
    "CustomText": [
        {
            "Name": "Index",
            "Default": "2",
            "Type": "Integer"
        },
        {
            "Name": "Action",
            "Default": "Replace",
            "Type": "String"
        },
        {
            "Name": "Value",
            "AllowCode": "true",
            "Type": "String"
        }
    ],
    "Defaults": [
        {
            "Name": "RedirectUrl",
            "Type": "String"
        },
        {
            "Name": "RedirectParamsList",
            "Type": "String"
        },
        {
            "Name": "LogoText",
            "Type": "String"
        },
        {
            "Name": "LogoUrl",
            "Type": "String"
        },
        {
            "Name": "CompletePage",
            "Default": "_Complete",
            "Type": "String"
        },
        {
            "Name": "ClosePage",
            "Default": "_Close",
            "Type": "String"
        },
        {
            "Name": "NextButton",
            "Default": "Далее",
            "Type": "String"
        },
        {
            "Name": "PrevButton",
            "Default": "Назад",
            "Type": "String"
        },
        {
            "Name": "Progress",
            "Default": "Пройдено",
            "Type": "String"
        },
        {
            "Name": "PopupCancelText",
            "Default": "Отмена",
            "Type": "String"
        },
        {
            "Name": "PopupOkText",
            "Default": "Ок",
            "Type": "String"
        },
        {
            "Name": "LandscapeOrientationText",
            "Default": "ПОВЕРНИТЕ ВАШЕ УСТРОЙСТВО",
            "Type": "String"
        },
        {
            "Name": "LandscapeOrientationHintText",
            "Default": "в горизонтальное положение для более комфортного просмотра",
            "Type": "String"
        },
        {
            "Name": "PortraitOrientationText",
            "Default": "ПОВЕРНИТЕ ВАШЕ УСТРОЙСТВО",
            "Type": "String"
        },
        {
            "Name": "PortraitOrientationHintText",
            "Default": "в вертикальное положение для более комфортного просмотра",
            "Type": "String"
        },
        {
            "Name": "EmptyError",
            "Default": "Пожалуйста, не оставляйте вопросы без ответа",
            "Type": "String"
        },
        {
            "Name": "TextError",
            "Default": "Пожалуйста, введите текст",
            "Type": "String"
        },
        {
            "Name": "IntError",
            "Default": "Пожалуйста, введите целое число",
            "Type": "String"
        },
        {
            "Name": "NumberError",
            "Default": "Пожалуйста, введите число",
            "Type": "String"
        },
        {
            "Name": "DateError",
            "Default": "Пожалуйста, укажите дату",
            "Type": "String"
        },
        {
            "Name": "SelectError",
            "Default": "Эти варианты ответа не могут быть отмечены одновременно",
            "Type": "String"
        },
        {
            "Name": "RangeError",
            "Default": "Выбранный вариант ответа должен иметь другое значение",
            "Type": "String"
        },
        {
            "Name": "LengthError",
            "Default": "Введённый Вами текст слишком длинный",
            "Type": "String"
        },
        {
            "Name": "MaxAnswersError",
            "Default": "Укажите, пожалуйста, меньшее количество ответов",
            "Type": "String"
        },
        {
            "Name": "MinAnswersError",
            "Default": "Укажите, пожалуйста, большее количество ответов",
            "Type": "String"
        },
        {
            "Name": "ExchangeError",
            "Default": "Неверный запрос к странице",
            "Type": "String"
        },
        {
            "Name": "CommentText",
            "Default": "Здесь Вы можете оставить любой комментарий по ходу опроса",
            "Type": "String"
        },
        {
            "Name": "ErrorTitle",
            "Default": "Ошибка",
            "Type": "String"
        },
        {
            "Name": "GeneralErrorText",
            "Default": "Проверьте, пожалуйста, правильность заполнения страницы",
            "Type": "String"
        },
        {
            "Name": "GeneralErrorButton",
            "Default": "Ок",
            "Type": "String"
        },
        {
            "Name": "WaitingText",
            "Default": "Пожалуйста, подождите, пока загрузится страница",
            "Type": "String"
        },
        {
            "Name": "AgreementText",
            "Default": "Пользовательское соглашение",
            "Type": "String"
        },
        {
            "Name": "PrivacyText",
            "Default": "Политика конфиденциальности",
            "Type": "String"
        },
        {
            "Name": "SupportText",
            "Default": "Нашли ошибку или что-то не работает?",
            "Type": "String"
        },
        {
            "Name": "SupportEditText",
            "Default": "Опишите проблему здесь",
            "Type": "String"
        },
        {
            "Name": "SupportSendText",
            "Default": "Отправить",
            "Type": "String"
        },
        {
            "Name": "SupportCloseText",
            "Default": "Отмена",
            "Type": "String"
        },
        {
            "Name": "SupportSuccessText",
            "Default": "Спасибо! Информация о Вашей проблеме будет передана администрации проекта.",
            "Type": "String"
        },
        {
            "Name": "SupportFailText",
            "Default": "Сообщение не было отправлено",
            "Type": "String"
        },
        {
            "Name": "CommentHeader",
            "Default": "Здесь Вы можете оставить любой комментарий по ходу опроса",
            "Type": "String"
        },
        {
            "Name": "Copyright",
            "Default": "Powered by SurveyStat",
            "Type": "String"
        },
        {
            "Name": "NoflashText",
            "Default": "<p>На Вашем компьютере установлена старая версия flash-плеера, либо плеер не установлен. Вы можете скачать последнюю версию пройдя по ссылке ниже</p><a href='http://get.adobe.com/flashplayer/'><img border='0' src='http://www.adobe.com/images/shared/download_buttons/get_adobe_flash_player.png' alt='Скачать flash-плеер' /></a>",
            "Type": "String"
        },
        {
            "Name": "Title",
            "Default": "Исследование",
            "Type": "String"
        },
        {
            "Name": "HintRadioButton",
            "Default": "Один ответ",
            "Type": "String"
        },
        {
            "Name": "HintCheckBox",
            "Default": "Отметьте все подходящие ответы",
            "Type": "String"
        },
        {
            "Name": "HintText",
            "Default": "Запишите ответ в поле ниже",
            "Type": "String"
        },
        {
            "Name": "HintInteger",
            "Default": "Введите число в поле ниже",
            "Type": "String"
        },
        {
            "Name": "HintMemo",
            "Default": "Мы будем благодарны Вам за подробный ответ",
            "Type": "String"
        },
        {
            "Name": "HintUnionVertical",
            "Default": "колонке",
            "Type": "String"
        },
        {
            "Name": "HintUnionHorizontal",
            "Default": "строке",
            "Type": "String"
        },
        {
            "Name": "HintUnion",
            "Default": "@HintType по каждой @HintOrientation",
            "Type": "String"
        },
        {
            "Name": "ButtonTimeoutWaitText",
            "Default": "Ждите @Countdown сек",
            "Type": "String"
        },
        {
            "Name": "WarnClosingText",
            "Default": "Опрос ещё не завершён, Вы уверены, что хотите закрыть его?",
            "Type": "String"
        },
        {
            "Name": "CompleteUrl",
            "Type": "String"
        },
        {
            "Name": "ClickPointRemoveText",
            "Default": "Удалить",
            "Type": "String"
        },
        {
            "Name": "VideoCaptureStartText",
            "Default": "Начать запись",
            "Type": "String"
        },
        {
            "Name": "VideoCaptureCancelText",
            "Default": "Отмена",
            "Type": "String"
        },
        {
            "Name": "VideoCaptureEndText",
            "Default": "Завершить запись",
            "Type": "String"
        },
        {
            "Name": "VideoCaptureRemoveText",
            "Default": "Удалить видеоответ",
            "Type": "String"
        },
        {
            "Name": "VideoCaptureAsyncLoadText",
            "Default": "Видеоответ загружается на сервер...",
            "Type": "String"
        },
        {
            "Name": "VideoCapturePlayerWidth",
            "Default": "640",
            "Type": "String"
        },
        {
            "Name": "VideoCapturePlayerHeight",
            "Default": "480",
            "Type": "String"
        },
        {
            "Name": "VideoCaptureImgUrl",
            "Default": "/Content/images/camera.png",
            "Type": "String"
        },
        {
            "Name": "VideoCaptureMinLengthText",
            "Default": "Минимальная длина видео",
            "Type": "String"
        },
        {
            "Name": "VideoCaptureLengthMeasureText",
            "Default": "сек",
            "Type": "String"
        },
        {
            "Name": "VideoCaptureTimerText",
            "Default": "Текущая длина видео",
            "Type": "String"
        },
        {
            "Name": "HintMinAnswers",
            "Default": "Не менее @count ответов",
            "Type": "String"
        },
        {
            "Name": "HintMaxAnswers",
            "Default": "Не более @count ответов",
            "Type": "String"
        },
        {
            "Name": "HintEqualsAnswers",
            "Default": "Укажите точное количество ответов: @count",
            "Type": "String"
        },
        {
            "Name": "HintMaxDiffDesktop",
            "Default": "Выберите вариант ответа, который Вам @labelleast, и вариант ответа, который Вам @labelmost",
            "Type": "String"
        },
        {
            "Name": "HintMaxDiffMobile",
            "Default": "Сделайте жест влево для варианта ответа, который Вам @labelleast, и жест вправо для варианта ответа, который Вам @labelmost",
            "Type": "String"
        },
        {
            "Name": "ShowProgress",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "ShowNextButton",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "ShowPrevButton",
            "Default": "false",
            "AllowCode": "true",
            "DbValue": "true",
            "Type": "Boolean"
        },
        {
            "Name": "ProhibitSelection",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "ProhibitPrintscreen",
            "Type": "Boolean"
        },
        {
            "Name": "Caching",
            "Default": "false",
            "Type": "Boolean"
        },
        {
            "Name": "CountPageTime",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "HideSurveyHeader",
            "Type": "Boolean"
        },
        {
            "Name": "ShowSupport",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "ShowAgreement",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "ShowPrivacy",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "ShowComment",
            "Default": "false",
            "Type": "Boolean"
        },
        {
            "Name": "NumberAnswers",
            "Default": "false",
            "Type": "Boolean"
        },
        {
            "Name": "LogoShow",
            "Type": "Boolean"
        },
        {
            "Name": "LogoOnce",
            "Type": "Boolean"
        },
        {
            "Name": "LoadAsync",
            "Default": "false",
            "Type": "Boolean"
        },
        {
            "Name": "WarnClosing",
            "Type": "Boolean"
        },
        {
            "Name": "ShowQuestionIds",
            "Default": "false",
            "DbValue": "true",
            "Type": "Boolean"
        },
        {
            "Name": "ShowInterruptButton",
            "Default": "false",
            "Type": "Boolean"
        },
        {
            "Name": "MaxAnswersDisable",
            "Default": "false",
            "Type": "Boolean"
        },
        {
            "Name": "WaitingDelay",
            "Default": "2000",
            "Type": "Integer"
        },
        {
            "Name": "EmphaseTimeout",
            "Default": "3000",
            "Type": "Integer"
        },
        {
            "Name": "LoadAsyncTimeout",
            "Default": "0",
            "Type": "Integer"
        }
    ],
    "Page": [
        {
            "Name": "SyncId",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Header",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "ScreenOrientation",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "OptionalHeader",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Footer",
            "Type": "String"
        },
        {
            "Name": "Template",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Itera",
            "Type": "String"
        },
        {
            "Name": "IteraID",
            "Type": "String"
        },
        {
            "Name": "DefaultControl",
            "Type": "String"
        },
        {
            "Name": "GenerablePar",
            "Type": "String"
        },
        {
            "Name": "Quota",
            "Type": "String"
        },
        {
            "Name": "SaveMixOrder",
            "Type": "String"
        },
        {
            "Name": "RestoreMixOrder",
            "Type": "String"
        },
        {
            "Name": "DefaultsId",
            "Type": "String"
        },
        {
            "Name": "ExportLabel",
            "Type": "String"
        },
        {
            "Name": "MixId",
            "Type": "String"
        },
        {
            "Name": "InvId",
            "Type": "String"
        },
        {
            "Name": "ButtonTimeout",
            "AllowCode": "true",
            "Type": "Integer"
        },
        {
            "Name": "PostbackTimeout",
            "AllowCode": "true",
            "Type": "Integer"
        },
        {
            "Name": "DefaultCode",
            "Default": "13",
            "Type": "Integer"
        },
        {
            "Name": "CustomProgress",
            "AllowCode": "true",
            "Type": "Integer"
        },
        {
            "Name": "Reverse",
            "AllowCode": "true",
            "Type": "Boolean"
        },
        {
            "Name": "CountProgress",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "Mix",
            "Type": "Boolean"
        },
        {
            "Name": "Inv",
            "Type": "Boolean"
        },
        {
            "Name": "Fix",
            "Type": "Boolean"
        },
        {
            "Name": "End",
            "Type": "Boolean"
        },
        {
            "Name": "FastLoad",
            "Type": "Boolean"
        },
        {
            "Name": "ShowModalError",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "StructIgnore",
            "Type": "Boolean"
        },
        {
            "Name": "OnloadFilter",
            "Type": "FilteredObject"
        }
    ],
    "ListItem": [
        {
            "Name": "Text",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "ChildList",
            "Type": "String"
        },
        {
            "Name": "Fix",
            "Type": "Boolean"
        }
    ],
    "List": [
        {
            "Name": "Mix",
            "Type": "Boolean"
        },
        {
            "Name": "SaveToDb",
            "Type": "Boolean"
        }
    ],
    "Question": [
        {
            "Name": "Type",
            "Default": "RadioButton",
            "Type": "QuestionType",
            "Values": ["RadioButton", "CheckBox", "Text", "Memo", "Integer", "Number", "File"]
        },
        {
            "Name": "SyncId",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Multiply",
            "Type": "String"
        },
        {
            "Name": "Text",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "EndText",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Header",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "OptionalHeader",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Hint",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "SubText",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Title",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "SelectionBackColor",
            "Default": "#FFFF00",
            "Type": "String"
        },
        {
            "Name": "SelectionColor",
            "Default": "#000000",
            "Type": "String"
        },
        {
            "Name": "SelectedBackColor",
            "Default": "#000000",
            "Type": "String"
        },
        {
            "Name": "SelectedColor",
            "Default": "#FFFFFF",
            "Type": "String"
        },
        {
            "Name": "OverColor",
            "Type": "String"
        },
        {
            "Name": "GenerablePar",
            "Type": "String"
        },
        {
            "Name": "SplitOpen",
            "Default": "{",
            "Type": "String"
        },
        {
            "Name": "SplitClose",
            "Default": "}",
            "Type": "String"
        },
        {
            "Name": "Store",
            "Type": "String"
        },
        {
            "Name": "CornerText",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Template",
            "Type": "String"
        },
        {
            "Name": "SubstPage",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "SubstQuestion",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Image",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Union",
            "Type": "String"
        },
        {
            "Name": "Tag",
            "Default": "z",
            "Type": "String"
        },
        {
            "Name": "RestoreMixOrder",
            "Type": "String"
        },
        {
            "Name": "RestoreUnionMixOrder",
            "Type": "String"
        },
        {
            "Name": "Range",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "ExportLabel",
            "Type": "String"
        },
        {
            "Name": "UnionMixId",
            "Type": "String"
        },
        {
            "Name": "MixId",
            "Type": "String"
        },
        {
            "Name": "InvId",
            "Type": "String"
        },
        {
            "Name": "AutoSetSingle",
            "AllowCode": "true",
            "Default": "false",
            "Type": "Boolean"
        },
        {
            "Name": "Reverse",
            "AllowCode": "true",
            "Type": "Boolean"
        },
        {
            "Name": "Mix",
            "Type": "Boolean"
        },
        {
            "Name": "Inv",
            "Type": "Boolean"
        },
        {
            "Name": "SaveMixOrder",
            "Type": "Boolean"
        },
        {
            "Name": "SaveUnionMixOrder",
            "Type": "Boolean"
        },
        {
            "Name": "Visible",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "Imperative",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "ImperativeAll",
            "Type": "Boolean"
        },
        {
            "Name": "UnionMix",
            "Type": "Boolean"
        },
        {
            "Name": "Fix",
            "Type": "Boolean"
        },
        {
            "Name": "HideOnFilter",
            "Type": "Boolean"
        },
        {
            "Name": "Separate",
            "Type": "Boolean"
        },
        {
            "Name": "StructIgnore",
            "Type": "Boolean"
        },
        {
            "Name": "TextWidth",
            "Default": "100",
            "Type": "Integer"
        },
        {
            "Name": "EndTextWidth",
            "Default": "20",
            "Type": "Integer"
        },
        {
            "Name": "MinAnswers",
            "AllowCode": "true",
            "Type": "Integer"
        },
        {
            "Name": "MaxAnswers",
            "AllowCode": "true",
            "Type": "Integer"
        },
        {
            "Name": "EqualsAnswers",
            "AllowCode": "true",
            "Type": "Integer"
        },
        {
            "Name": "ColsPerRow",
            "Type": "Integer"
        },
        {
            "Name": "Cols",
            "Type": "Integer"
        },
        {
            "Name": "Length",
            "Type": "Integer"
        }
    ],
    "QuestionStyle": [
        {
            "Name": "EvenClass",
            "Default": "SEEvenRow",
            "Type": "String"
        },
        {
            "Name": "OddClass",
            "Default": "SEOddRow",
            "Type": "String"
        },
        {
            "Name": "TitleClass",
            "Default": "SETitle",
            "Type": "String"
        },
        {
            "Name": "ErrorCellClass",
            "Default": "SEErrorCell",
            "Type": "String"
        },
        {
            "Name": "ComboBoxClass",
            "Default": "SEComboBox",
            "Type": "String"
        },
        {
            "Name": "SingleClass",
            "Default": "SESingle",
            "Type": "String"
        },
        {
            "Name": "MemoClass",
            "Default": "SEMemo",
            "Type": "String"
        },
        {
            "Name": "ContainerClass",
            "Default": "SEQuestionContainer",
            "Type": "String"
        },
        {
            "Name": "SelTextContainerClass",
            "Default": "SESelTextQuestionContainer",
            "Type": "String"
        },
        {
            "Name": "HoverClass",
            "Default": "SEHover",
            "Type": "String"
        },
        {
            "Name": "SelectedClass",
            "Default": "SESelected",
            "Type": "String"
        },
        {
            "Name": "AnswersClass",
            "Default": "SEAnswers",
            "Type": "String"
        },
        {
            "Name": "HeaderClass",
            "Default": "SEHeader",
            "Type": "String"
        },
        {
            "Name": "SelectionClass",
            "Default": "SESelection",
            "Type": "String"
        },
        {
            "Name": "SeparatorClass",
            "Default": "SESeparator",
            "Type": "String"
        },
        {
            "Name": "Width",
            "Type": "String"
        },
        {
            "Name": "ShelfCellClass",
            "Default": "SEShelfCell",
            "Type": "String"
        },
        {
            "Name": "ShelfSelDivClass",
            "Default": "SEShelfSelDiv",
            "Type": "String"
        },
        {
            "Name": "AnswersVisible",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "DetailsVisible",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "IgnoreStyle",
            "Type": "Boolean"
        }
    ],
    "Answer": [
        {
            "Name": "SyncId",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Text",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "EndText",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Label",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Title",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Placeholder",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Value",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "GenerablePar",
            "Type": "String"
        },
        {
            "Name": "ResetGroups",
            "Type": "String"
        },
        {
            "Name": "Resets",
            "Type": "String"
        },
        {
            "Name": "Range",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "RangeSpread",
            "Type": "String"
        },
        {
            "Name": "Image",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "ExportLabel",
            "Type": "String"
        },
        {
            "Name": "Partial",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Fix",
            "Type": "Boolean"
        },
        {
            "Name": "NoUseInQstFilter",
            "Default": "false",
            "Type": "Boolean"
        },
        {
            "Name": "Visible",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "ShowDay",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "ShowMonth",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "ShowYear",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "Solo",
            "Type": "Boolean"
        },
        {
            "Name": "Imperative",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "HideOnFilter",
            "Type": "Boolean"
        },
        {
            "Name": "Reset",
            "Type": "Boolean"
        },
        {
            "Name": "Separate",
            "Type": "Boolean"
        },
        {
            "Name": "StructIgnore",
            "Type": "Boolean"
        },
        {
            "Name": "Type",
            "Type": "QuestionType"
        },
        {
            "Name": "Length",
            "Type": "Integer"
        }
    ],
    "Filter": [
        {
            "Name": "Generable",
            "Type": "Boolean"
        },
        {
            "Name": "Spread",
            "Type": "String"
        },
        {
            "Name": "Operator",
            "Default": "And",
            "Type": "LogicalOperator"
        },
        {
            "Name": "Side",
            "Default": "Server",
            "Type": "ProcessSide"
        },
        {
            "Name": "Runtime",
            "Default": "Declaring",
            "Type": "RuntimeType"
        }
    ],
    "Condition": [
        {
            "Name": "Operator",
            "Default": "Or",
            "Type": "LogicalOperator"
        }
    ],
    "ConditionItem": [
        {
            "Name": "Page",
            "Type": "String"
        },
        {
            "Name": "Question",
            "Type": "String"
        },
        {
            "Name": "Answer",
            "Type": "String"
        },
        {
            "Name": "Value",
            "Type": "String"
        },
        {
            "Name": "Operator",
            "Default": "Nothing",
            "Type": "LogicalOperator"
        },
        {
            "Name": "RangeOperator",
            "Default": "Or",
            "Type": "LogicalOperator"
        },
        {
            "Name": "Apply",
            "Type": "Boolean"
        },
        {
            "Name": "Generable",
            "Type": "Boolean"
        }
    ],
    "Redirect": [
        {
            "Name": "Page",
            "Type": "String"
        },
        {
            "Name": "Url",
            "Type": "String"
        },
        {
            "Name": "Status",
            "Type": "Integer"
        },
        {
            "Name": "Operator",
            "Default": "And",
            "Type": "LogicalOperator"
        },
        {
            "Name": "Runtime",
            "Default": "Declaring",
            "Type": "RuntimeType"
        },
        {
            "Name": "Side",
            "Default": "Server",
            "Type": "ProcessSide"
        }
    ],
    "Quota": [
        {
            "Name": "Limit",
            "Type": "Integer"
        },
        {
            "Name": "Status",
            "Default": "21",
            "Type": "Integer"
        },
        {
            "Name": "Enabled",
            "Default": "true",
            "Type": "Boolean"
        },
        {
            "Name": "Page",
            "Type": "String"
        },
        {
            "Name": "Description",
            "Type": "String"
        },
        {
            "Name": "Url",
            "Type": "String"
        },
        {
            "Name": "Apply",
            "Type": "String"
        },
        {
            "Name": "Monadic",
            "Type": "String"
        },
        {
            "Name": "Operator",
            "Default": "And",
            "Type": "LogicalOperator"
        },
        {
            "Name": "Side",
            "Default": "Server",
            "Type": "ProcessSide"
        },
        {
            "Name": "Runtime",
            "Default": "Declaring",
            "Type": "RuntimeType"
        }
    ],
    "QuotaGrid": [
        {
            "Name": "Text",
            "Type": "String"
        }
    ],
    "QuotaGridRow": [
        {
            "Name": "Items",
            "Type": "String"
        }
    ],
    "QuotaGridCol": [
        {
            "Name": "Items",
            "Type": "String"
        }
    ],
    "Block": [
        {
            "Name": "Items",
            "Type": "String"
        },
        {
            "Name": "Title",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Text",
            "Type": "String"
        },
        {
            "Name": "SyncId",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "MixId",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "InvId",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Fix",
            "Type": "Boolean"
        },
        {
            "Name": "InnerMix",
            "Type": "Boolean"
        },
        {
            "Name": "Mix",
            "Type": "Boolean"
        },
        {
            "Name": "Inv",
            "Type": "Boolean"
        },
        {
            "Name": "LocalProgress",
            "Type": "Boolean"
        },
        {
            "Name": "LocalProgressStart",
            "Type": "Integer"
        },
        {
            "Name": "LocalProgressEnd",
            "Type": "Integer"
        }
    ],
    "Mix": [
        {
            "Name": "Items",
            "Type": "String"
        },
        {
            "Name": "SaveMixOrder",
            "Type": "String"
        },
        {
            "Name": "RestoreMixOrder",
            "Type": "String"
        },
        {
            "Name": "Reverse",
            "AllowCode": "true",
            "Type": "Boolean"
        }
    ],
    "FlashVar": [
        {
            "Name": "Text",
            "AllowCode": "true",
            "Type": "String"
        }
    ],
    "PreloadImage": [
        {
            "Name": "Src",
            "AllowCode": "true",
            "Type": "String"
        }
    ],
    "Repeat": [
        {
            "Name": "Block",
            "Type": "Boolean"
        },
        {
            "Name": "Mix",
            "Type": "Boolean"
        },
        {
            "Name": "List",
            "Type": "String"
        },
        {
            "Name": "MixId",
            "Type": "String"
        },
        {
            "Name": "Range",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Length",
            "Type": "Integer"
        }
    ],
    "Validate": [
        {
            "Name": "PinQuestion",
            "Type": "String"
        },
        {
            "Name": "PinAnswer",
            "Type": "String"
        },
        {
            "Name": "Message",
            "Type": "String"
        },
        {
            "Name": "Operator",
            "Default": "And",
            "Type": "LogicalOperator"
        },
        {
            "Name": "Side",
            "Default": "Server",
            "Type": "ProcessSide"
        },
        {
            "Name": "Runtime",
            "Default": "Code",
            "Type": "RuntimeType"
        }
    ],
    "Split": [
        {
            "Name": "Name",
            "Type": "String"
        },
        {
            "Name": "Source",
            "Type": "String"
        }
    ],
    "SplitItem": [
        {
            "Name": "Text",
            "Type": "String"
        }
    ],
    "Statistic": [
        {
            "Name": "BindInterval",
            "Type": "Integer"
        },
        {
            "Name": "Group",
            "Type": "Integer"
        },
        {
            "Name": "Union",
            "Type": "Integer"
        },
        {
            "Name": "Name",
            "Type": "String"
        },
        {
            "Name": "Source",
            "Type": "String"
        },
        {
            "Name": "Split",
            "Type": "String"
        },
        {
            "Name": "Base",
            "Type": "String"
        },
        {
            "Name": "Status",
            "Type": "String"
        },
        {
            "Name": "Quota",
            "Type": "String"
        },
        {
            "Name": "GroupName",
            "Type": "String"
        },
        {
            "Name": "AllowQuota",
            "Default": "false",
            "Type": "Boolean"
        },
        {
            "Name": "AllowStatus",
            "Default": "false",
            "Type": "Boolean"
        },
        {
            "Name": "HideSplit",
            "Type": "Boolean"
        },
        {
            "Name": "QuotaOnTop",
            "Type": "Boolean"
        }
    ],
    "StatisticItem": [
        {
            "Name": "Name",
            "Type": "String"
        },
        {
            "Name": "Source",
            "Type": "String"
        },
        {
            "Name": "Func",
            "Default": "Pct",
            "Type": "String"
        },
        {
            "Name": "Ignores",
            "Type": "String"
        },
        {
            "Name": "Color",
            "Type": "String"
        }
    ],
    "Comment": [
        {
            "Name": "Text",
            "AllowCode": "true",
            "Type": "String"
        }
    ],
    "Holder": [
        {
            "Name": "Fix",
            "Default": "false",
            "Type": "Boolean"
        },
        {
            "Name": "Questions",
            "Type": "String"
        },
        {
            "Name": "Align",
            "Default": "right",
            "Type": "String"
        },
        {
            "Name": "Valign",
            "Type": "String"
        },
        {
            "Name": "Text",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Width",
            "Default": "30%",
            "Type": "String"
        }
    ],
    "Footer": [
        {
            "Name": "Text",
            "AllowCode": "true",
            "Type": "String"
        }
    ]
};