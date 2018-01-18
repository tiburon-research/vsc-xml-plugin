var ManualCode = [
    {
        Name: "CurrentSurvey",
        Kind: "Variable",
        Detail: "Object"
    },
    {
        Name: "SurveyListItem",
        Kind: "Class",
        Detail: "Class"
    },
    {
        Name: "ToString",
        Kind: "Method",
        Parent: "[\\w\\d\\(\\)\\[\\]]+"
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
        Name: "RespID",
        Kind: "Property",
        Detail: "string",
        Parent: "InterviewPars"
    },
    {
        Name: "GetInstance",
        Kind: "Method",
        Parent: "InterviewPars"
    },
    {
        Name: "SurveyID",
        Kind: "Property",
        Detail: "int",
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
        Name: "Count",
        Kind: "Property",
        Detail: "Integer",
        Parent: "CurrentSurvey\\.Lists\\[.*\\]\\.Items"
    },
    {
        Name: "ItemsIdArray",
        Kind: "Property",
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
    },
    {
        Name: "Common",
        Kind: "Variable"
    },
    {
        Name: "MixArray",
        Kind: "Method",
        Parent: "Common"
    },
    {
        Name: "LogicalOperator",
        Kind: "Enum"
    },
    {
        Name: "Or",
        Kind: "EnumMember",
        Parent: "LogicalOperator"
    },
    {
        Name: "Xor",
        Kind: "EnumMember",
        Parent: "LogicalOperator"
    },
    {
        Name: "And",
        Kind: "EnumMember",
        Parent: "LogicalOperator"
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
        "Name": "ExtInterviews",
        "Detail": "int[]",
        "Kind": "Function",
        "Documentation": "int[] ExtInterviews(int extSurveyId, int statusId, string questionId, string answerId, string val)"
    },
    {
        "Name": "ExtInterviews",
        "Detail": "int[]",
        "Kind": "Function",
        "Documentation": "int[] ExtInterviews(int extSurveyId, int statusId, string questionId, string answerId)"
    },
    {
        "Name": "ExtInterviews",
        "Detail": "int[]",
        "Kind": "Function",
        "Documentation": "int[] ExtInterviews(int extSurveyId, string questionId, string answerId, string val)"
    },
    {
        "Name": "ExtInterviews",
        "Detail": "int[]",
        "Kind": "Function",
        "Documentation": "int[] ExtInterviews(int extSurveyId, string questionId, string answerId)"
    },
    {
        "Name": "ExtInterviewsAnswerExists",
        "Detail": "bool[]",
        "Kind": "Function",
        "Documentation": "bool[] ExtInterviewsAnswerExists(int[] interviewList, int statusId, string pageId, string questionId, string answerId)"
    },
    {
        "Name": "ExtInterviewsAnswerExists",
        "Detail": "bool[]",
        "Kind": "Function",
        "Documentation": "bool[] ExtInterviewsAnswerExists(int[] interviewList, string pageId, string questionId, string answerId)"
    },
    {
        "Name": "ExtInterviewsAnswerValue",
        "Detail": "string[]",
        "Kind": "Function",
        "Documentation": "string[] ExtInterviewsAnswerValue(int[] interviewList, int statusId, string pageId, string questionId, string answerId)"
    },
    {
        "Name": "ExtInterviewsAnswerValue",
        "Detail": "string[]",
        "Kind": "Function",
        "Documentation": "string[] ExtInterviewsAnswerValue(int[] interviewList, string pageId, string questionId, string answerId)"
    },
    {
        "Name": "ExtInterviewsAnswerId",
        "Detail": "string[]",
        "Kind": "Function",
        "Documentation": "string[] ExtInterviewsAnswerId(int[] interviewList, int statusId, string pageId, string questionId)"
    },
    {
        "Name": "ExtInterviewsAnswerId",
        "Detail": "string[]",
        "Kind": "Function",
        "Documentation": "string[] ExtInterviewsAnswerId(int[] interviewList, string pageId, string questionId)"
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
        "Name": "DataExists",
        "Detail": "bool",
        "Kind": "Function",
        "Documentation": "bool DataExists(int index, string val)"
    },
    {
        "Name": "DataGetCustom",
        "Detail": "string[]",
        "Kind": "Function",
        "Documentation": "string[] DataGetCustom(int index, string value)"
    },
    {
        "Name": "DataGetCustoms",
        "Detail": "string[][]",
        "Kind": "Function",
        "Documentation": "string[][] DataGetCustoms(int index, string value)"
    },
    {
        "Name": "DataGetCustomSingleRandom",
        "Detail": "string[]",
        "Kind": "Function",
        "Documentation": "string[] DataGetCustomSingleRandom(int index, int key, int updateKey)"
    },
    {
        "Name": "DataGetCustomSingleRandomWithConditions",
        "Detail": "string[]",
        "Kind": "Function",
        "Documentation": "string[] DataGetCustomSingleRandomWithConditions(int index, int key, int updateKey, string[] conditions)"
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
        "Name": "GetSurveyUserMails",
        "Detail": "List<string[]>",
        "Kind": "Function",
        "Documentation": "List<string[]> GetSurveyUserMails(int surveyId)"
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
        "Name": "QuestionResults",
        "Detail": "string[][]",
        "Kind": "Function",
        "Documentation": "string[][] QuestionResults(string pageId, string questionId)"
    },
    {
        "Name": "QuestionResults",
        "Detail": "string[][]",
        "Kind": "Function",
        "Documentation": "string[][] QuestionResults(int interviewId, string pageId, string questionId)"
    },
    {
        "Name": "AnswerIDs",
        "Detail": "string[]",
        "Kind": "Function",
        "Documentation": "string[] AnswerIDs(string pageId, string questionId)"
    },
    {
        "Name": "AnswerIDs",
        "Detail": "string[]",
        "Kind": "Function",
        "Documentation": "string[] AnswerIDs(int interviewId, string pageId, string questionId)"
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
        "Name": "GetMixOrder",
        "Detail": "string[]",
        "Kind": "Function",
        "Documentation": "string[] GetMixOrder(string mixId)"
    },
    {
        "Name": "MixItera",
        "Detail": "string",
        "Kind": "Function",
        "Documentation": "string MixItera(int defaultItera)"
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
            "Type": "String",
            Auto: "51"
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
            "Default": "false",
            "Type": "Boolean"
        },
        {
            "Name": "ColorConstructor",
            "Default": "false",
            "DbValue": "true",
            "Type": "Boolean"
        }
    ],
    "CustomText1": [
        {
            "Name": "Action",
            "Default": "Replace",
            "Type": "String",
            Auto: "Append"
        }
    ],
    "CustomText2": [
        {
            "Name": "Action",
            "Default": "Replace",
            "Type": "String",
            Auto: "Append"
        }
    ],
    "Defaults": [
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
            "Name": "CountPageTime",
            "Default": "true",
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
            "Name": "WaitingDelay",
            "Default": "2000",
            "Type": "Integer"
        },
        {
            "Name": "EmphaseTimeout",
            "Default": "3000",
            "Type": "Integer"
        },
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
            "Name": "Footer",
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
            "Name": "CustomProgress",
            "AllowCode": "true",
            "Type": "Integer"
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
            "Name": "StructIgnore",
            "Type": "Boolean"
        },
    ],
    "ListItem": [
        {
            "Name": "Text",
            "AllowCode": "true",
            "Type": "String"
        },
    ],
    "List": [
        {
            "Name": "SaveToDb",
            "Type": "Boolean"
        }
    ],
    "Question": [
        {
            Name: "Orientation",
            Default: "Vertical",
            Auto: "Horizontal"
        },
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
            "Name": "Store",
            "Type": "String"
        },
        {
            "Name": "CornerText",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "Union",
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
            "Name": "Mix",
            "Type": "Boolean"
        },
        {
            "Name": "Inv",
            "Type": "Boolean"
        },
        {
            "Name": "Imperative",
            "Default": "true",
            "Type": "Boolean",
            Auto: "false"
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
            "Name": "Length",
            "Type": "Integer"
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
            "Name": "Range",
            "AllowCode": "true",
            "Type": "String"
        },
        {
            "Name": "ExportLabel",
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
            "Name": "Reset",
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
            "Type": "ProcessSide",
            Auto: "Client"
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
            Result: "getAllPages()",
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
            Result: "getAllPages()",
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
            Result: "getAllPages()",
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
            "Type": "String",
            Result: "getAllPages()"
        },
        {
            "Name": "Monadic",
            "Type": "String"
        },
        {
            "Name": "Operator",
            "Default": "And",
            "Type": "LogicalOperator"
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
    "Repeat": [
        {
            "Name": "Mix",
            "Type": "Boolean"
        },
        {
            "Name": "List",
            Result: "getAllLists()",
            "Type": "String"
        },
        {
            "Name": "MixId",
            "Type": "String"
        },
        {
            "Name": "Range",
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
    ],
    "QuotaItem": [
        {
            "Name": "Page",
            "Type": "string",
            Result: "getAllPages()"
        },
        {
            "Name": "Question",
            "Type": "string"
        },
        {
            "Name": "Answer",
            "Type": "string"
        },
        {
            "Name": "Operator",
            "Default": "Exists",
            "Values": ["Exists", "More", "MoreEquals", "Less", "LessEquals", "Equals"]
        },
        {
            Name: "Value"
        },
        {
            Name: "Generable",
            Type: "Boolean",
            Default: "false"
        }
    ],
    "RedirectItem": [
        {
            "Name": "Operator",
            "Default": "Exists",
            "Values": ["Exists", "More", "MoreEquals", "Less", "LessEquals", "Equals"]
        },
        {
            Name: "Value"
        }
    ],
    "ValidateItem": [
        {
            "Name": "Operator",
            "Default": "Exists",
            "Values": ["Exists", "More", "MoreEquals", "Less", "LessEquals", "Equals"]
        },
        {
            Name: "Value"
        }
    ]
};


export const CSSnippets = [
    {
		"prefix": "class",
		"body": [
			"public class ${1:MyClass}",
			"{",
			"\t$0",
			"}"
			],
		"description": "Объявление класса"
    },
    {
		"prefix": "const",
		"body": [
			"${1:public} const ${2:string} ${3:CONSTANT_NAME} = \"${4:value}\";",
			"$0"
			],
		"description": "Объявление константы"
    },
    {
		"prefix": "do",
		"body": [
			"do",
			"{",
			"\t$0",
			"} while (${1:true});"
			],
		"description": "Блок do-while"
    },
    {
		"prefix": "else",
		"body": [
			"else",
			"{",
			"\t$0",
			"}"
			],
		"description": "Блок else"
    },
    {
		"prefix": "enum",
		"body": [
			"public enum ${1:MyEnum}Type()",
			"{",
			"\t$0",
			"}"
			],
		"description": "Объявление перечисления"
    },
    {
		"prefix": "for",
		"body": [
			"for (${1:int} ${2:i} = 0; $2 < ${3:length}; $2++)",
			"{",
			"\t$0",
			"}"
			],
		"description": "Блок for"
    },
    {
		"prefix": "foreach",
		"body": [
			"foreach (${1:SurveyListItem} ${2:item} in ${3:CurrentSurvey.Lists[\"$4\"].Items})",
			"{",
			"\t$0",
			"}"
			],
		"description": "Блок foreach"
    },
    {
		"prefix": "if",
		"body": [
			"if (${1:true})",
			"{",
			"\t$0",
			"}"
			],
		"description": "Блок if"
    },
    {
		"prefix": "ifelse",
		"body": [
			"if (${1:true})",
			"{",
			"\t$2",
            "}",
            "else",
            "{",
			"\t$0",
            "}"
			],
		"description": "Блок if-else"
    },
    {
        prefix: "public",
        body: [
            "public ${1:string} ${2:method}($3)",
            "{",
            "\t$0",
            "}"
        ],
        description: "Метод public"
    },
    {
		"prefix": "struct",
		"body": [
			"public struct ${1:MyStruct}",
			"{",
			"\t$0",
			"}"
			],
		"description": "Объявление структуры"
    },
    {
		"prefix": "switch",
		"body": [
			"switch (${1:switch_on})",
			"{",
			"\t$0",
			"\tdefault:",
			"\t\tbreak;",
			"}"
			],
		"description": "Блок switch"
    },    
	{
		"prefix": "try",
		"body": [
			"try",
			"{",
			"\t$0",
			"}",
			"catch (${1:}Exception ${2:ex})",
			"{\r\n",
			"\tthrow;",
			"}"
			],
		"description": "Блок try-catch"
	},
	{
		"prefix": "tryf",
		"body": [
			"try",
			"{",
			"\t$0",
			"}",
			"catch (${1:}Exception ${2:ex})",
			"{\r\n",
			"\tthrow;",
			"}",
			"finally",
			"{\r\n",
			"}"
			],
		"description": "Блок try-finally"
    },
    {
		"prefix": "while",
		"body": [
			"while (${1:true})",
			"{",
			"\t$0",
			"}"
			],
		"description": "Блок while"
	},
];