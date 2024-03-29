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
		Name: "Host",
		Kind: "Property",
		Detail: "string",
		Parent: "InterviewPars"
	},
	{
		Name: "ProjectId",
		Kind: "Property",
		Parent: "InterviewPars"
	},
	{
		Name: "InterviewUID",
		Kind: "Property",
		Parent: "InterviewPars",
		Detail: "string"
	},
	{
		Name: "PageId",
		Kind: "Property",
		Parent: "InterviewPars\\.GetInstance\\(\\)"
	},
	{
		Name: "ProjectId",
		Kind: "Property",
		Parent: "InterviewPars\\.GetInstance\\(\\)"
	},
	{
		Name: "IsMobile",
		Kind: "Property",
		Detail: "bool",
		Parent: "InterviewPars\\.GetInstance\\(\\)"
	},
	{
		Name: "IsTest",
		Kind: "Property",
		Detail: "bool",
		Parent: "InterviewPars\\.GetInstance\\(\\)"
	},
	{
		Name: "RespId",
		Kind: "Property",
		Detail: "string",
		Parent: "InterviewPars\\.GetInstance\\(\\)"
	},
	{
		Name: "PanelRespUid",
		Kind: "Property",
		Detail: "string",
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
		Detail: "bool",
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
		Detail: "string[]",
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
		Name: "Items",
		Kind: "Property",
		Parent: "CurrentSurvey\\.Lists\\[.*\\]\\.Items"
	},
	{
		Name: "Values",
		Kind: "Property",
		Detail: "IEnumerable",
		Parent: "CurrentSurvey\\.Lists\\[.*?\\]\\.Items\\.Items"
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
		"Name": "DataGetCustomSingleRandom",
		"Detail": "string[]",
		"Kind": "Function",
		"Documentation": "string[] DataGetCustomSingleRandom(int index, int key, int updateKey)"
	},
	{
		"Name": "ExtInterviewAnswerExistsAny",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtInterviewAnswerExistsAny(int externalInterview, string questionId, string srcRange)"
	},
	{
		"Name": "ExtSurveyAnswerCount",
		"Detail": "int",
		"Kind": "Function",
		"Documentation": "int ExtSurveyAnswerCount(int extSurveyId, string pageId, string questionId)"
	},
	{
		"Name": "AnswerExists",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool AnswerExists(string questionId, string answerId)"
	},
	{
		"Name": "MixItera",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string MixItera(int defaultItera)"
	},
	{
		"Name": "AnswerValue",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string AnswerValue(string questionId, string answerId)"
	},
	{
		"Name": "ExtSurveyAnswerUpdate",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtSurveyAnswerUpdate(int extSurveyId, string questionId, string answerId, int[] statuses, string val = null)"
	},
	{
		"Name": "ExtSurveyAnswerIDs",
		"Detail": "string[]",
		"Kind": "Function",
		"Documentation": "string[] ExtSurveyAnswerIDs(int extSurveyId, string pageId, string questionId, int[] statuses)"
	},
	{
		"Name": "ExtInterviewAnswerInsert",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtInterviewAnswerInsert(int interviewId, string pageId, string questionId, string answerId)"
	},
	{
		"Name": "ExtSurveyInterviewID",
		"Detail": "int",
		"Kind": "Function",
		"Documentation": "int ExtSurveyInterviewID(int extSurveyId, int[] statuses)"
	},
	{
		"Name": "AnswerUpdate",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void AnswerUpdate(string questionId, string answerId)"
	},
	{
		"Name": "GetFloat",
		"Detail": "float",
		"Kind": "Function",
		"Documentation": "float GetFloat(string rawValue)"
	},
	{
		"Name": "DataExists",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool DataExists(int index, string val)"
	},
	{
		"Name": "ExtInterviewsAnswerId",
		"Detail": "string[]",
		"Kind": "Function",
		"Documentation": "string[] ExtInterviewsAnswerId(int[] interviewList, string pageId, string questionId)"
	},
	{
		"Name": "QuestionClear",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void QuestionClear(int interviewId, string questionId)"
	},
	{
		"Name": "ExtInterviewAnswerExistsForRange",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtInterviewAnswerExistsForRange(int externalInterview, string questionId, string srcRange, LogicalOperator logicalOperator)"
	},
	{
		"Name": "AnswerClear",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void AnswerClear(string questionId, string answerId)"
	},
	{
		"Name": "ExtSurveyInterviewStatus",
		"Detail": "int",
		"Kind": "Function",
		"Documentation": "int ExtSurveyInterviewStatus(int extSurveyId)"
	},
	{
		"Name": "PageClear",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void PageClear(string pageId)"
	},
	{
		"Name": "ExtSurveyAnswerInsert",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtSurveyAnswerInsert(int extSurveyId, string pageId, string questionId, string answerId, string val = null)"
	},
	{
		"Name": "Url",
		"Detail": "string",
		"Kind": "Property",
		"ParentTag": "Redirect",
		"Parent": "this",
		"Documentation": "string Url"
	},
	{
		"Name": "Page",
		"Detail": "string",
		"Kind": "Property",
		"ParentTag": "Redirect",
		"Parent": "this",
		"Documentation": "string Page"
	},
	{
		"Name": "AnswerUpdateP",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void AnswerUpdateP(string pageId, string questionId, string answerId, string val)"
	},
	{
		"Name": "GetDateTime",
		"Detail": "DateTime",
		"Kind": "Function",
		"Documentation": "DateTime GetDateTime(string rawValue)"
	},
	{
		"Name": "GetDouble",
		"Detail": "double",
		"Kind": "Function",
		"Documentation": "double GetDouble(string rawValue)"
	},
	{
		"Name": "ExtInterviews",
		"Detail": "int[]",
		"Kind": "Function",
		"Documentation": "int[] ExtInterviews(int extSurveyId, int statusId, string questionId, string answerId)"
	},
	{
		"Name": "AnswerExists",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool AnswerExists(string pageId, string questionId, string answerId)"
	},
	{
		"Name": "QuotaCount",
		"Detail": "double",
		"Kind": "Function",
		"Documentation": "double QuotaCount(string quotaName, string statuses)"
	},
	{
		"Name": "GetInvValue",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool GetInvValue(string invId)"
	},
	{
		"Name": "ExtInterviewAnswerUpdateP",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtInterviewAnswerUpdateP(int interviewId, string pageId, string questionId, IEnumerable<string> answerIds)"
	},
	{
		"Name": "ExtSurveyAnswerExists",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtSurveyAnswerExists(int extSurveyId, string questionId, string answerId, int[] statuses)"
	},
	{
		"Name": "QuotaCountStatus",
		"Detail": "double",
		"Kind": "Function",
		"Documentation": "double QuotaCountStatus(int surveyId, string quotaId, int statusId)"
	},
	{
		"Name": "AnswerExistsAny",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool AnswerExistsAny(string questionId, string srcRange)"
	},
	{
		"Name": "QuestionClear",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void QuestionClear(string questionId)"
	},
	{
		"Name": "ExtInterviewsAnswerExists",
		"Detail": "bool[]",
		"Kind": "Function",
		"Documentation": "bool[] ExtInterviewsAnswerExists(int[] interviewList, string pageId, string questionId, string answerId)"
	},
	{
		"Name": "AnswerExistsOnce",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool AnswerExistsOnce(string pageId, string questionId, int answerStart, int answerEnd)"
	},
	{
		"Name": "ExtInterviewAnswerExists",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtInterviewAnswerExists(int extInterviewId, string pageId, string questionId, string answerId)"
	},
	{
		"Name": "ExtInterview",
		"Detail": "int",
		"Kind": "Function",
		"Documentation": "int ExtInterview(int extSurveyId, string interviewRespondent)"
	},
	{
		"Name": "CurrentInterview",
		"Detail": "int",
		"Kind": "Property",
		"Documentation": "int CurrentInterview"
	},
	{
		"Name": "ExtSurveyAnswerUpdateP",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtSurveyAnswerUpdateP(int extSurveyId, string pageId, string questionId, IEnumerable<string> answerIds)"
	},
	{
		"Name": "ExtSurveyAnswerValue",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string ExtSurveyAnswerValue(int extSurveyId, string questionId, string answerId, int[] statuses)"
	},
	{
		"Name": "DataGetCustoms",
		"Detail": "string[][]",
		"Kind": "Function",
		"Documentation": "string[][] DataGetCustoms(string value)"
	},
	{
		"Name": "AnswerInsert",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void AnswerInsert(string pageId, string questionId, string answerId)"
	},
	{
		"Name": "ExtSurveyAnswerExists",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtSurveyAnswerExists(int extSurveyId, string pageId, string questionId, string answerId)"
	},
	{
		"Name": "ExtSurveyAnswerExistsAny",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtSurveyAnswerExistsAny(int extSurveyId, string questionId, string srcRange, int[] statuses)"
	},
	{
		"Name": "ExtInterviewAnswerExistsAll",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtInterviewAnswerExistsAll(int externalInterview, string questionId, string srcRange)"
	},
	{
		"Name": "ExtInterviewAnswerValue",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string ExtInterviewAnswerValue(int extInterviewId, string pageId, string questionId, string answerId)"
	},
	{
		"Name": "QuotaCountStatus",
		"Detail": "double",
		"Kind": "Function",
		"Documentation": "double QuotaCountStatus(string quotaId, int statusId)"
	},
	{
		"Name": "ExtSurveyAnswerValue",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string ExtSurveyAnswerValue(int extSurveyId, string pageId, string questionId, string answerId)"
	},
	{
		"Name": "PageHeader",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string PageHeader(string pageId)"
	},
	{
		"Name": "ExtInterviewAnswerDelete",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtInterviewAnswerDelete(int interviewId, string pageId, string questionId, string answerId)"
	},
	{
		"Name": "ExtSurveyAnswerExistsForRange",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtSurveyAnswerExistsForRange(int extSurveyId, string questionId, string srcRange, LogicalOperator oper)"
	},
	{
		"Name": "ExtInterviewAnswerUpdateP",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtInterviewAnswerUpdateP(int interviewId, string pageId, string questionId, Dictionary<string, string> answerDict)"
	},
	{
		"Name": "QuestionHeader",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string QuestionHeader(string pageId, string questionId)"
	},
	{
		"Name": "ExtSurveyAnswerID",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string ExtSurveyAnswerID(int extSurveyId, string pageId, string questionId)"
	},
	{
		"Name": "ExtInterviewsAnswerValue",
		"Detail": "string[]",
		"Kind": "Function",
		"Documentation": "string[] ExtInterviewsAnswerValue(int[] interviewList, int statusId, string pageId, string questionId, string answerId)"
	},
	{
		"Name": "ExtSurveyAnswerDelete",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtSurveyAnswerDelete(int extSurveyId, string pageId, string questionId, string answerId)"
	},
	{
		"Name": "ExtSurveyRespondent",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string ExtSurveyRespondent(int extSurveyId, int[] statuses)"
	},
	{
		"Name": "AnswerExistsForRange",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool AnswerExistsForRange(string questionId, string srcRange, LogicalOperator oper)"
	},
	{
		"Name": "QuotaLimit",
		"Detail": "double",
		"Kind": "Function",
		"Documentation": "double QuotaLimit(int surveyId, string quotaId)"
	},
	{
		"Name": "ExtInterviewAnswerInsert",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtInterviewAnswerInsert(int interviewId, string pageId, string questionId, string answerId, string val)"
	},
	{
		"Name": "ExtSurveyAnswerExistsAny",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtSurveyAnswerExistsAny(int extSurveyId, string pageId, string questionId, string srcRange)"
	},
	{
		"Name": "ExtSurveyInterviewID",
		"Detail": "int",
		"Kind": "Function",
		"Documentation": "int ExtSurveyInterviewID(int extSurveyId)"
	},
	{
		"Name": "ExtInterviews",
		"Detail": "int[]",
		"Kind": "Function",
		"Documentation": "int[] ExtInterviews(int extSurveyId, int statusId, string questionId, string answerId, string val)"
	},
	{
		"Name": "InterviewResultClear",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void InterviewResultClear()"
	},
	{
		"Name": "GetListItemText",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string GetListItemText(string listId, int itemIndex)"
	},
	{
		"Name": "AnswerUpdateP",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void AnswerUpdateP(string pageId, string questionId, string answerId)"
	},
	{
		"Name": "QuotaLimit",
		"Detail": "double",
		"Kind": "Function",
		"Documentation": "double QuotaLimit(string quotaId)"
	},
	{
		"Name": "ExtSurveyAnswerDelete",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtSurveyAnswerDelete(int extSurveyId, string pageId, string questionId, string answerId, int[] statuses)"
	},
	{
		"Name": "ExtInterviewsAnswerValue",
		"Detail": "string[]",
		"Kind": "Function",
		"Documentation": "string[] ExtInterviewsAnswerValue(int[] interviewList, string pageId, string questionId, string answerId)"
	},
	{
		"Name": "InterviewExists",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool InterviewExists(string questionId, string answerId, string val)"
	},
	{
		"Name": "ExtSurveyAnswerValue",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string ExtSurveyAnswerValue(int extSurveyId, string questionId, string answerId)"
	},
	{
		"Name": "AnswerDelete",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void AnswerDelete(string questionId, string answerId)"
	},
	{
		"Name": "AnswerUpdateP",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void AnswerUpdateP(string pageId, string questionId, Dictionary<string, string> answerDict)"
	},
	{
		"Name": "AnswerExistsAll",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool AnswerExistsAll(string questionId, string srcRange)"
	},
	{
		"Name": "AnswerEnabledForRanging",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool AnswerEnabledForRanging(string prefix, string answer, int current, int len)"
	},
	{
		"Name": "ExtInterviewAnswerUpdate",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtInterviewAnswerUpdate(int interviewId, string pageId, string questionId, string answerId, string val)"
	},
	{
		"Name": "ExtSurveyAnswerExists",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtSurveyAnswerExists(int extSurveyId, string pageId, string questionId, string answerId, int[] statuses)"
	},
	{
		"Name": "AnswerCount",
		"Detail": "int",
		"Kind": "Function",
		"Documentation": "int AnswerCount(string pageId)"
	},
	{
		"Name": "GetAge",
		"Detail": "DateResult",
		"Kind": "Function",
		"Documentation": "DateResult GetAge(DateTime subtractDate)"
	},
	{
		"Name": "GetMixOrder",
		"Detail": "string[]",
		"Kind": "Function",
		"Documentation": "string[] GetMixOrder(string mixId)"
	},
	{
		"Name": "DataGetCustoms",
		"Detail": "string[][]",
		"Kind": "Function",
		"Documentation": "string[][] DataGetCustoms(int index, string value)"
	},
	{
		"Name": "GetInt",
		"Detail": "int",
		"Kind": "Function",
		"Documentation": "int GetInt(string rawValue, int def = -1000)"
	},
	{
		"Name": "QuestionResults",
		"Detail": "string[][]",
		"Kind": "Function",
		"Documentation": "string[][] QuestionResults(string pageId, string questionId)"
	},
	{
		"Name": "AnswerCount",
		"Detail": "int",
		"Kind": "Function",
		"Documentation": "int AnswerCount(string pageId, string questionId)"
	},
	{
		"Name": "GetObjectFromJson",
		"Detail": "dynamic",
		"Kind": "Function",
		"Documentation": "dynamic GetObjectFromJson(string json)"
	},
	{
		"Name": "DataHashExist",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool DataHashExist(string hash)"
	},
	{
		"Name": "ExtSurveyAnswerValue",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string ExtSurveyAnswerValue(int extSurveyId, string pageId, string questionId, string answerId, int[] statuses)"
	},
	{
		"Name": "ExtInterviewAnswerValue",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string ExtInterviewAnswerValue(int extInterviewId, string questionId, string answerId)"
	},
	{
		"Name": "getRedirectUrl",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string getRedirectUrl()"
	},
	{
		"Name": "ExtSurveyAnswerUpdateP",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtSurveyAnswerUpdateP(int extSurveyId, string pageId, string questionId, string answerId, int[] statuses, string val = null)"
	},
	{
		"Name": "SetRanges",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void SetRanges(string selectionQuestion, string rangeQuestionPrefix, string questionForRanges, string listId, string likeAnswers, int? rangeForNotChosen = null, string dontLikeAnswers = null)"
	},
	{
		"Name": "AnswerUpdate",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void AnswerUpdate(int? surveyId, int interviewId, string pageId, string questionId, string answerId, string val)"
	},
	{
		"Name": "ExtInterviews",
		"Detail": "int[]",
		"Kind": "Function",
		"Documentation": "int[] ExtInterviews(int extSurveyId, string questionId, string answerId, string val)"
	},
	{
		"Name": "MailSend",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void MailSend(string mailFrom, string recipient, string recipientBlind, string body, string subject, string attachments)"
	},
	{
		"Name": "ExtSurveyAnswerID",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string ExtSurveyAnswerID(int extSurveyId, string pageId, string questionId, int[] statuses)"
	},
	{
		"Name": "ExtSurveyAnswerInsert",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtSurveyAnswerInsert(int extSurveyId, string pageId, string questionId, string answerId, int[] statuses, string val = null)"
	},
	{
		"Name": "DataGetCustom",
		"Detail": "string[]",
		"Kind": "Function",
		"Documentation": "string[] DataGetCustom(int index, string value)"
	},
	{
		"Name": "AnswerExistsOnce",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool AnswerExistsOnce(string questionId, int answerStart, int answerEnd)"
	},
	{
		"Name": "AnswerValue",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string AnswerValue(string pageId, string questionId, string answerId)"
	},
	{
		"Name": "GetDateDiff",
		"Detail": "DateResult",
		"Kind": "Function",
		"Documentation": "DateResult GetDateDiff(DateTime currentDate, DateTime subtractDate)"
	},
	{
		"Name": "TryGetInt",
		"Detail": "int",
		"Kind": "Function",
		"Documentation": "int TryGetInt(string rawValue)"
	},
	{
		"Name": "QuotaCount",
		"Detail": "double",
		"Kind": "Function",
		"Documentation": "double QuotaCount(string quotaId)"
	},
	{
		"Name": "QuotaIsOpen",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool QuotaIsOpen(int surveyId, string quotaId)"
	},
	{
		"Name": "ExtSurveyAnswerExistsForRange",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtSurveyAnswerExistsForRange(int extSurveyId, string questionId, string srcRange, LogicalOperator oper, int[] statuses)"
	},
	{
		"Name": "AnswerInsertOnce",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void AnswerInsertOnce(string pageId, string questionId, string answerId)"
	},
	{
		"Name": "ExtSurveyAnswerExistsAny",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtSurveyAnswerExistsAny(int extSurveyId, string questionId, string srcRange)"
	},
	{
		"Name": "QuestionResults",
		"Detail": "string[][]",
		"Kind": "Function",
		"Documentation": "string[][] QuestionResults(int interviewId, string pageId, string questionId)"
	},
	{
		"Name": "Status",
		"Detail": "int",
		"Kind": "Property",
		"ParentTag": "Redirect",
		"Parent": "this",
		"Documentation": "int Status"
	},
	{
		"Name": "ExtInterviewsAnswerExists",
		"Detail": "bool[]",
		"Kind": "Function",
		"Documentation": "bool[] ExtInterviewsAnswerExists(int[] interviewList, int statusId, string pageId, string questionId, string answerId)"
	},
	{
		"Name": "ExtInterviewAnswerExistsAny",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtInterviewAnswerExistsAny(int externalInterview, string pageId, string questionId, string srcRange)"
	},
	{
		"Name": "GetListItemVar",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string GetListItemVar(string listId, int itemIndex, int varIndex)"
	},
	{
		"Name": "AnswerUpdateP",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void AnswerUpdateP(string pageId, string questionId, IEnumerable<string> answerIds)"
	},
	{
		"Name": "ExtSurveyAnswerUpdateP",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtSurveyAnswerUpdateP(int extSurveyId, string pageId, string questionId, Dictionary<string, string> answerDict)"
	},
	{
		"Name": "AnswerInsertOnce",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void AnswerInsertOnce(string pageId, string questionId, string answerId, string val)"
	},
	{
		"Name": "DataGetCustomSingleRandomWithConditions",
		"Detail": "string[]",
		"Kind": "Function",
		"Documentation": "string[] DataGetCustomSingleRandomWithConditions(int index, int key, int updateKey, string[] conditions)"
	},
	{
		"Name": "ExtSurveyAnswerUpdateP",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtSurveyAnswerUpdateP(int extSurveyId, string pageId, string questionId, string answerId, string val = null)"
	},
	{
		"Name": "InterviewStatusChange",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void InterviewStatusChange(int statusId)"
	},
	{
		"Name": "ExtSurveyAnswerUpdateP",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtSurveyAnswerUpdateP(int extSurveyId, string pageId, string questionId, Dictionary<string, string> answerDict, int[] statuses)"
	},
	{
		"Name": "CurrentInterviewOrder",
		"Detail": "int",
		"Kind": "Property",
		"Documentation": "int CurrentInterviewOrder"
	},
	{
		"Name": "ExtSurveyAnswerDelete",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtSurveyAnswerDelete(int extSurveyId, string questionId, string answerId)"
	},
	{
		"Name": "QuotaIsOpen",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool QuotaIsOpen(string quotaId)"
	},
	{
		"Name": "AnswerUpdate",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void AnswerUpdate(int interviewId, string questionId, string answerId, string val)"
	},
	{
		"Name": "AnswerInsert",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void AnswerInsert(string pageId, string questionId, string answerId, string val)"
	},
	{
		"Name": "InterviewStartDate",
		"Detail": "DateTime",
		"Kind": "Function",
		"Documentation": "DateTime InterviewStartDate()"
	},
	{
		"Name": "Message",
		"Detail": "string",
		"Kind": "Property",
		"ParentTag": "Validate",
		"Parent": "this",
		"Documentation": "string Message"
	},
	{
		"Name": "QuestionText",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string QuestionText(string pageId, string questionId)"
	},
	{
		"Name": "AnswerDelete",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void AnswerDelete(string pageId, string questionId, string answerId)"
	},
	{
		"Name": "QuotaCount",
		"Detail": "double",
		"Kind": "Function",
		"Documentation": "double QuotaCount(int surveyId, string quotaId)"
	},
	{
		"Name": "ExtSurveyInterviewStatus",
		"Detail": "int",
		"Kind": "Function",
		"Documentation": "int ExtSurveyInterviewStatus(int extSurveyId, int[] statuses)"
	},
	{
		"Name": "ExtInterviewAnswerExists",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtInterviewAnswerExists(int extInterviewId, string questionId, string srcRangeOrNot)"
	},
	{
		"Name": "ExtInterviewAnswerDelete",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtInterviewAnswerDelete(int interviewId, string questionId, string answerId)"
	},
	{
		"Name": "AnswerID",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string AnswerID(string pageId, string questionId)"
	},
	{
		"Name": "GetFileURL",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string GetFileURL(string questionId, string answerId)"
	},
	{
		"Name": "AnswerUpdate",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void AnswerUpdate(string questionId, string answerId, string val)"
	},
	{
		"Name": "PinQuestion",
		"Detail": "string",
		"Kind": "Property",
		"ParentTag": "Validate",
		"Parent": "this",
		"Documentation": "string PinQuestion"
	},
	{
		"Name": "AnswerIDs",
		"Detail": "string[]",
		"Kind": "Function",
		"Documentation": "string[] AnswerIDs(int interviewId, string pageId, string questionId)"
	},
	{
		"Name": "GetPageTime",
		"Detail": "int",
		"Kind": "Function",
		"Documentation": "int GetPageTime(string pageId, string side = \"Client\")"
	},
	{
		"Name": "PinAnswer",
		"Detail": "string",
		"Kind": "Property",
		"ParentTag": "Validate",
		"Parent": "this",
		"Documentation": "string PinAnswer"
	},
	{
		"Name": "ExtSurveyAnswerExists",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtSurveyAnswerExists(int extSurveyId, string questionId, string answerId)"
	},
	{
		"Name": "ExtSurveyAnswerUpdateP",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtSurveyAnswerUpdateP(int extSurveyId, string pageId, string questionId, IEnumerable<string> answerIds, int[] statuses)"
	},
	{
		"Name": "MailSend",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void MailSend(string recipient, string body, string subject)"
	},
	{
		"Name": "ExtInterview",
		"Detail": "int",
		"Kind": "Function",
		"Documentation": "int ExtInterview(int extSurveyId, string questionId, string answerId, string val)"
	},
	{
		"Name": "AnswerID",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string AnswerID(string questionId)"
	},
	{
		"Name": "ExtInterviews",
		"Detail": "int[]",
		"Kind": "Function",
		"Documentation": "int[] ExtInterviews(int extSurveyId, string questionId, string answerId)"
	},
	{
		"Name": "ExtInterviewQuestionDelete",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtInterviewQuestionDelete(int interviewId, string questionId)"
	},
	{
		"Name": "GetListItemText",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string GetListItemText(string listId, string itemId)"
	},
	{
		"Name": "GetAnswerID",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string GetAnswerID(string questionId, string val)"
	},
	{
		"Name": "ExtSurveyAnswerUpdate",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtSurveyAnswerUpdate(int extSurveyId, string questionId, string answerId, string val = null)"
	},
	{
		"Name": "ExtSurveyAnswerDelete",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void ExtSurveyAnswerDelete(int extSurveyId, string questionId, string answerId, int[] statuses)"
	},
	{
		"Name": "ExtSurveyAnswerIDs",
		"Detail": "string[]",
		"Kind": "Function",
		"Documentation": "string[] ExtSurveyAnswerIDs(int extSurveyId, string pageId, string questionId)"
	},
	{
		"Name": "AnswerCountRange",
		"Detail": "int",
		"Kind": "Function",
		"Documentation": "int AnswerCountRange(string questionId, string srcRange)"
	},
	{
		"Name": "MessageGeneral",
		"Detail": "string",
		"Kind": "Property",
		"ParentTag": "Validate",
		"Parent": "this",
		"Documentation": "string MessageGeneral"
	},
	{
		"Name": "AnswerText",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string AnswerText(string pageId, string questionId, string answerId)"
	},
	{
		"Name": "GetAnswerID",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string GetAnswerID(string pageId, string questionId, string val)"
	},
	{
		"Name": "GetListItemVar",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string GetListItemVar(string listId, string itemId, int varIndex)"
	},
	{
		"Name": "ExtSurveyAnswerExistsAny",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool ExtSurveyAnswerExistsAny(int extSurveyId, string pageId, string questionId, string srcRange, int[] statuses)"
	},
	{
		"Name": "ExtInterviewsAnswerId",
		"Detail": "string[]",
		"Kind": "Function",
		"Documentation": "string[] ExtInterviewsAnswerId(int[] interviewList, int statusId, string pageId, string questionId)"
	},
	{
		"Name": "IsEmailCorrect",
		"Detail": "bool",
		"Kind": "Function",
		"Documentation": "bool IsEmailCorrect(string email)"
	},
	{
		"Name": "ExtSurveyRespondent",
		"Detail": "string",
		"Kind": "Function",
		"Documentation": "string ExtSurveyRespondent(int extSurveyId)"
	},
	{
		"Name": "MailSend",
		"Detail": "void",
		"Kind": "Function",
		"Documentation": "void MailSend(string recipient, string recipientBlind, string body, string subject)"
	},
	{
		"Name": "AnswerIDs",
		"Detail": "string[]",
		"Kind": "Function",
		"Documentation": "string[] AnswerIDs(string pageId, string questionId)"
	},
	{
		"Name": "CurrentSurveyId",
		"Detail": "int",
		"Kind": "Property",
		"Documentation": "int CurrentSurveyId"
	},
	{
		"Name": "ExtSurveyAnswerCount",
		"Detail": "int",
		"Kind": "Function",
		"Documentation": "int ExtSurveyAnswerCount(int extSurveyId, string pageId, string questionId, int[] statuses)"
	}
];


export const Code = ManualCode.concat(KnownCode);


export const Attributes = {
	"ExportDataSettings": [
		{
			"Name": "VarDelimiter",
			"Default": ".",
			"Type": "String"
		},
		{
			"Name": "Statuses",
			"Default": "all",
			"Type": "String"
		},
		{
			"Name": "CheckBoxMultiple",
			"Default": "false",
			"Type": "Boolean"
		},
		{
			"Name": "CheckBoxBinary",
			"Default": "false",
			"Type": "Boolean"
		},
		{
			"Name": "CutLabels",
			"Default": "true",
			"Type": "Boolean"
		},
		{
			"Name": "WriteCsvLabels",
			"Default": "true",
			"Type": "Boolean"
		},
		{
			"Name": "ExportPageTime",
			"Default": "true",
			"Type": "Boolean"
		},
		{
			"Name": "Utf8",
			"Default": "false",
			"Type": "Boolean"
		}
	],
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
			"Name": "Utf8",
			"Default": "false",
			"Type": "Boolean",
			Deprecated: true
		},
		{
			"Name": "ColorConstructor",
			"Default": "false",
			"DbValue": "true",
			"Type": "Boolean"
		},
		{
			"Name": "QuotaVersion",
			"Default": "2",
			"Type": "int",
			Auto: "3"
		},
		{
			"Name": "QuotaOptimistic",
			"Default": "false",
			"Type": "Boolean"
		}
	],
	"Include": [
		{
			Name: "FileName",
			Type: "string"
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
			"Name": "MiBrowserVideoWarning",
			"Type": "String",
			"Default": "Если видео не воспроизводится, попробуйте подключиться к сети Wi-Fi или зайти через другой браузер"
		},
		{
			"Name": "SurveyLanguageCodeFallback",
			"Type": "String",
			"Default": "ru"
		},
		{
			"Name": "SurveyLanguageCode",
			"Type": "String",
			"Default": "В зависимости от домена: для .com - `en`, для .ru - `ru`"
		},
		{
			"Name": "ImageError",
			"Type": "String",
			"Default": "Не удалось загрузить изображение"
		},
		{
			"Name": "ProductProhibitedText",
			"Type": "String",
			"Default": "* Продукт компании Meta, деятельность которой запрещена на территории России."
		},
		{
			"Name": "CompanyProhibitedText",
			"Type": "String",
			"Default": "** Деятельность компании запрещена на территории России."
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
			"Default": "Сообщить о проблеме",
			"Type": "String"
		},
		{
			"Name": "SupportSendText",
			"Default": "Сообщить о проблеме",
			"Type": "String"
		},
		{
			"Name": "SupportCloseText",
			"Default": "Отмена",
			"Type": "String"
		},
		{
			"Name": "SupportSuccessText",
			"Default": "Спасибо за обращение, в ближайшее время мы постараемся решить Вашу проблему.",
			"Type": "String"
		},
		{
			"Name": "SupportSuccessHeader",
			"Default": "Сообщение успешно отправлено!",
			"Type": "String"
		},
		{
			"Name": "SupportSuccessButton",
			"Default": "Продолжить",
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
			Name: "Id",
			Type: "String"
		},
		{
			"Name": "SyncId",
			"AllowCode": "true",
			"Type": "String",
			Auto: "@ID"
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
			Result: "getAllMixIds",
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
			"Type": "Double"
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
			Name: "Id",
			Type: "String"
		},
		{
			"Name": "Text",
			"AllowCode": "true",
			"Type": "String"
		},
		{
			Name: "Var",
			Type: "String"
		}
	],
	"List": [
		{
			Name: "Id",
			Type: "String"
		},
		{
			"Name": "SaveToDb",
			"Type": "Boolean"
		}
	],
	"Question": [
		{
			Name: "Id",
			Type: "String"
		},
		{
			"Name": "Reverse",
			"Type": "Boolean"
		},
		{
			Name: "Orientation",
			Default: "Vertical",
			Auto: "Horizontal"
		},
		{
			"Name": "Type",
			"Default": "RadioButton",
			"Type": "QuestionType",
			Result: "getQuestionTypes"
		},
		{
			"Name": "Coding",
			"Type": "string",
			Result: "getAllLists"
		},
		{
			"Name": "NumCodes",
			"Type": "int",
			Default: "5 для Text и 10 для Memo"
		},
		{
			"Name": "SyncId",
			"AllowCode": "true",
			"Type": "String",
			Auto: "@ID"
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
			"Type": "String",
			Result: "getAllQuestions"
		},
		{
			"Name": "CornerText",
			"AllowCode": "true",
			"Type": "String"
		},
		{
			"Name": "Union",
			"Type": "String",
			"Auto": "\\$all"
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
			Result: "getAllMixIds",
			"Type": "String"
		},
		{
			"Name": "MixId",
			Result: "getAllMixIds",
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
			Name: "Id",
			Type: "String"
		},
		{
			"Name": "SyncId",
			"AllowCode": "true",
			"Type": "String",
			Auto: "@ID"
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
			"Type": "QuestionType",
			Auto: "Text"
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
			Result: "getAllPages",
			"Type": "String"
		},
		{
			"Name": "Question",
			"Type": "String",
			Result: "getAllQuestions"
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
			Result: "getAllPages",
			"Type": "String"
		},
		{
			"Name": "Url",
			"Type": "String"
		},
		{
			"Name": "Status",
			"Type": "Integer",
			Auto: "19"
		},
		{
			"Name": "Operator",
			"Default": "And",
			"Type": "LogicalOperator"
		}
	],
	"Quota": [
		{
			Name: "Id",
			Type: "String"
		},
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
			"Type": "Boolean",
			"Deprecated": true
		},
		{
			"Name": "Page",
			Result: "getAllPages",
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
			Result: "getAllPages"
		},
		{
			"Name": "Monadic",
			"Type": "String",
			"Deprecated": true
		},
		{
			"Name": "Operator",
			"Default": "And",
			"Type": "LogicalOperator"
		},
		{
			"Name": "Counter",
			"Default": "false",
			"Type": "Boolean"
		},
		{
			"Name": "Optimistic",
			"Default": "false",
			"Type": "Boolean"
		},
		{
			"Name": "CountStatuses",
			"Default": "18",
			"Type": "String"
		},
		{
			Name: "Tech",
			Type: "Boolean"
		},
		{
			Name: "Manual",
			Type: "Boolean"
		}
	],
	"Block": [
		{
			Name: "Id",
			Type: "String"
		},
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
			"Type": "String",
			Auto: "@ID"
		},
		{
			"Name": "MixId",
			Result: "getAllMixIds",
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
			"Type": "Boolean",
			"Deprecated": true
		},
		{
			"Name": "LocalProgressStart",
			"Type": "Integer",
			"Deprecated": true
		},
		{
			"Name": "LocalProgressEnd",
			"Type": "Integer",
			"Deprecated": true
		}
	],
	"Repeat": [
		{
			"Name": "Mix",
			"Type": "Boolean"
		},
		{
			"Name": "List",
			Result: "getAllLists",
			"Type": "String"
		},
		{
			"Name": "MixId",
			Result: "getAllMixIds",
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
			"Type": "String",
			Result: "getAllQuestions"
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
	"Methods": [
		{
			Name: "Action",
			Default: "Append"
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
			Name: "Id",
			Type: "String"
		},
		{
			"Name": "Text",
			"Type": "String"
		}
	],
	"Statistic": [
		{
			Name: "Id",
			Type: "String"
		},
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
			"Type": "String",
			Auto: "18"
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
			Name: "Id",
			Type: "String"
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
			Result: "getAllPages"
		},
		{
			"Name": "Question",
			"Type": "string",
			Result: "getAllQuestions"
		},
		{
			"Name": "Answer",
			"Type": "string"
		},
		{
			"Name": "Operator",
			"Default": "Exists",
			"Values": ["Nothing", "NotExists", "MoreEquals", "LessEquals", "Equals"]
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
			"Values": ["Exists", "NotExists", "More", "MoreEquals", "Less", "LessEquals", "Equals"]
		},
		{
			Name: "Value"
		}
	],
	"ValidateItem": [
		{
			"Name": "Operator",
			"Default": "Exists",
			"Values": ["Exists", "NotExists", "More", "MoreEquals", "Less", "LessEquals", "Equals"]
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
	{
		"prefix": "DataGetCustoms",
		"body": [
			"string[][] data = DataGetCustoms(${1:dataId}, ${2:AnswerValue(\"pre_data\", \"respuid\")});",
			"for (int i = 0; data.Length > i; i++)",
			"{",
			"\t$0",
			"}"
		],
		"description": "Стандартный вызов DataGetCustoms"
	}
];


export const StaticMethods = {
	string: [{ "Name": "Compare", "Description": "Сравнивает подстроки двух указанных объектов String и возвращает целое число, которое показывает их относительное положение в порядке сортировки.", "Documentation": "Compare(String, Int32, String, Int32, Int32)" }, { "Name": "Compare", "Description": "Сравнивает подстроки двух заданных объектов String (с учетом или без учета регистра) и возвращает целое число, которое показывает их относительное положение в порядке сортировки.", "Documentation": "Compare(String, Int32, String, Int32, Int32, Boolean)" }, { "Name": "Compare", "Description": "Сравнивает подстроки двух заданных объектов String (с учетом или без учета регистра), используя сведения о языке и региональных параметрах, и возвращает целое число, которое показывает их относительное положение в порядке сортировки.", "Documentation": "Compare(String, Int32, String, Int32, Int32, Boolean, CultureInfo)" }, { "Name": "Compare", "Description": "Сравнивает подстроки двух заданных объектов String, используя указанные параметры сравнения и сведения о языке и региональных параметрах, которые влияют на сравнение, и возвращает целое число, показывающее связь между двумя подстроками в порядке сортировки.", "Documentation": "Compare(String, Int32, String, Int32, Int32, CultureInfo, CompareOptions)" }, { "Name": "Compare", "Description": "Сравнивает подстроки двух указанных объектов String с использованием заданных правил и возвращает целое число, которое показывает их относительное положение в порядке сортировки.", "Documentation": "Compare(String, Int32, String, Int32, Int32, StringComparison)" }, { "Name": "Compare", "Description": "Сравнивает два указанных объекта String и возвращает целое число, которое показывает их относительное положение в порядке сортировки.", "Documentation": "Compare(String, String)" }, { "Name": "Compare", "Description": "Сравнивает два указанных объекта String (с учетом или без учета регистра) и возвращает целое число, которое показывает их относительное положение в порядке сортировки.", "Documentation": "Compare(String, String, Boolean)" }, { "Name": "Compare", "Description": "Сравнивает два указанных объекта String (с учетом или без учета регистра), используя сведения о языке и региональных параметрах, и возвращает целое число, которое показывает их относительное положение в порядке сортировки.", "Documentation": "Compare(String, String, Boolean, CultureInfo)" }, { "Name": "Compare", "Description": "Сравнивает два заданных объекта String, используя указанные параметры сравнения и сведения о языке и региональных параметрах, которые влияют на сравнение, и возвращает целое число, показывающее связь между двумя строками в порядке сортировки.", "Documentation": "Compare(String, String, CultureInfo, CompareOptions)" }, { "Name": "Compare", "Description": "Сравнивает два указанных объекта String с использованием заданных правил и возвращает целое число, которое показывает их относительное положение в порядке сортировки.", "Documentation": "Compare(String, String, StringComparison)" }, { "Name": "CompareOrdinal", "Description": "Сравнивает подстроки двух указанных объектов String, вычисляя числовые значения соответствующих объектов Char в каждой подстроке.", "Documentation": "CompareOrdinal(String, Int32, String, Int32, Int32)" }, { "Name": "CompareOrdinal", "Description": "Сравнивает два указанных объекта String, оценивая числовые значения соответствующих объектов Char в каждой строке.", "Documentation": "CompareOrdinal(String, String)" }, { "Name": "Concat", "Description": "Сцепляет элементы созданной коллекции IEnumerable<T> типа String.", "Documentation": "Concat(IEnumerable<String>)" }, { "Name": "Concat", "Description": "Создает строковое представление указанного объекта.", "Documentation": "Concat(Object)" }, { "Name": "Concat", "Description": "Сцепляет строковые представления двух указанных объектов.", "Documentation": "Concat(Object, Object)" }, { "Name": "Concat", "Description": "Сцепляет строковые представления трех указанных объектов.", "Documentation": "Concat(Object, Object, Object)" }, { "Name": "Concat", "Description": "Сцепляет строковые представления четырех указанных объектов и любые объекты, заданные в необязательном списке параметров переменной длины.", "Documentation": "Concat(Object, Object, Object, Object)" }, { "Name": "Concat", "Description": "Сцепляет строковые представления элементов указанного массива Object.", "Documentation": "Concat(Object[])" }, { "Name": "Concat", "Description": "Сцепляет два указанных экземпляра String.", "Documentation": "Concat(String, String)" }, { "Name": "Concat", "Description": "Сцепляет три указанных экземпляра String.", "Documentation": "Concat(String, String, String)" }, { "Name": "Concat", "Description": "Сцепляет четыре указанных экземпляра String.", "Documentation": "Concat(String, String, String, String)" }, { "Name": "Concat", "Description": "Сцепляет элементы указанного массива String.", "Documentation": "Concat(String[])" }, { "Name": "Concat", "Description": "Сцепляет элементы реализации IEnumerable<T>.", "Documentation": "Concat<T>(IEnumerable<T>)" }, { "Name": "Copy", "Description": "Создает экземпляр String, имеющий то же значение, что и указанный экземпляр String.", "Documentation": "Copy(String)" }, { "Name": "Equals", "Description": "Определяет, совпадают ли значения двух указанных объектов String.", "Documentation": "Equals(String, String)" }, { "Name": "Equals", "Description": "Определяет, совпадают ли значения двух указанных объектов String. Параметр определяет язык и региональные параметры, учет регистра и правила сортировки, используемые при сравнении.", "Documentation": "Equals(String, String, StringComparison)" }, { "Name": "Format", "Description": "Заменяет элементы формата в указанной строке строковым представлением соответствующего объекта. Параметр предоставляет сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "Format(IFormatProvider, String, Object)" }, { "Name": "Format", "Description": "Заменяет элементы формата в указанной строке строковым представлением двух указанных объектов. Параметр предоставляет сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "Format(IFormatProvider, String, Object, Object)" }, { "Name": "Format", "Description": "Заменяет элементы формата в указанной строке строковым представлением трех указанных объектов. Параметр предоставляет сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "Format(IFormatProvider, String, Object, Object, Object)" }, { "Name": "Format", "Description": "Заменяет элементы формата в указанной строке строковым представлениями соответствующих объектов в указанном массиве. Параметр предоставляет сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "Format(IFormatProvider, String, Object[])" }, { "Name": "Format", "Description": "Заменяет один или более элементов формата в указанной строке строковым представлением указанного объекта.", "Documentation": "Format(String, Object)" }, { "Name": "Format", "Description": "Заменяет элементы формата в указанной строке строковым представлением двух указанных объектов.", "Documentation": "Format(String, Object, Object)" }, { "Name": "Format", "Description": "Заменяет элементы формата в указанной строке строковым представлением трех указанных объектов.", "Documentation": "Format(String, Object, Object, Object)" }, { "Name": "Format", "Description": "Заменяет элемент формата в указанной строке строковым представлением соответствующего объекта в указанном массиве.", "Documentation": "Format(String, Object[])" }, { "Name": "Intern", "Description": "Извлекает системную ссылку на указанный объект String.", "Documentation": "Intern(String)" }, { "Name": "IsInterned", "Description": "Извлекает ссылку на указанный объект String.", "Documentation": "IsInterned(String)" }, { "Name": "IsNullOrEmpty", "Description": "Указывает, является ли указанная строка строкой null или Empty.", "Documentation": "IsNullOrEmpty(String)" }, { "Name": "IsNullOrWhiteSpace", "Description": "Указывает, имеет ли указанная строка значение null, является ли она пустой строкой или строкой, состоящей только из символов-разделителей.", "Documentation": "IsNullOrWhiteSpace(String)" }, { "Name": "Join", "Description": "Сцепляет элементы созданной коллекции IEnumerable<T> типа String, помещая между ними заданный разделитель.", "Documentation": "Join(String, IEnumerable<String>)" }, { "Name": "Join", "Description": "Сцепляет элементы массива объектов, помещая между ними заданный разделитель.", "Documentation": "Join(String, Object[])" }, { "Name": "Join", "Description": "Сцепляет все элементы массива строк, помещая между ними заданный разделитель.", "Documentation": "Join(String, String[])" }, { "Name": "Join", "Description": "Сцепляет указанные элементы массива строк, помещая между ними заданный разделитель.", "Documentation": "Join(String, String[], Int32, Int32)" }, { "Name": "Join", "Description": "Сцепляет элементы созданной коллекции, помещая между ними заданный разделитель.", "Documentation": "Join<T>(String, IEnumerable<T>)" }],
	int: [{ "Name": "Parse", "Description": "Преобразует строковое представление числа в эквивалентное ему 32-битовое целое число со знаком.", "Documentation": "Parse(String)" }, { "Name": "Parse", "Description": "Преобразует строковое представление числа в указанном формате, соответствующем языку и региональным параметрам, в эквивалентное ему 32-битовое целое число со знаком.", "Documentation": "Parse(String, IFormatProvider)" }, { "Name": "Parse", "Description": "Преобразует строковое представление числа в указанном формате в эквивалентное ему 32-битовое целое число со знаком.", "Documentation": "Parse(String, NumberStyles)" }, { "Name": "Parse", "Description": "Преобразует строковое представление числа в формате, соответствующем языку и региональным параметрам, в эквивалентное ему 32-битовое целое число со знаком.", "Documentation": "Parse(String, NumberStyles, IFormatProvider)" }, { "Name": "TryParse", "Description": "Преобразует строковое представление числа в эквивалентное ему 32-битовое целое число со знаком. Возвращает значение, указывающее, успешно ли выполнено преобразование.", "Documentation": "TryParse(String, Int32)" }, { "Name": "TryParse", "Description": "Преобразует строковое представление числа в формате, соответствующем языку и региональным параметрам, в эквивалентное ему 32-битовое целое число со знаком. Возвращает значение, указывающее, успешно ли выполнено преобразование.", "Documentation": "TryParse(String, NumberStyles, IFormatProvider, Int32)" }],
	DateTime: [{ "Name": "Compare", "Description": "Сравнивает два экземпляра объекта DateTime и возвращает целое число, которое показывает, предшествует ли первый экземпляр второму, совпадает или расположен позже.", "Documentation": "Compare(DateTime, DateTime)" }, { "Name": "DaysInMonth", "Description": "Возвращает число дней в указанном месяце указанного года.", "Documentation": "DaysInMonth(Int32, Int32)" }, { "Name": "Equals", "Description": "Возвращает значение, указывающее, содержат ли два экземпляра DateTime одно и то же значение даты и времени.", "Documentation": "Equals(DateTime, DateTime)" }, { "Name": "FromBinary", "Description": "Десериализует 64-разрядное значение и воссоздает исходный сериализованный объект DateTime.", "Documentation": "FromBinary(Int64)" }, { "Name": "FromFileTime", "Description": "Преобразует заданное время файла Windows в его эквивалент по местному времени.", "Documentation": "FromFileTime(Int64)" }, { "Name": "FromFileTimeUtc", "Description": "Преобразует заданное время файла Windows в его UTC-эквивалент.", "Documentation": "FromFileTimeUtc(Int64)" }, { "Name": "FromOADate", "Description": "Возвращает объект DateTime, эквивалентный заданному значению даты OLE-автоматизации.", "Documentation": "FromOADate(Double)" }, { "Name": "IsLeapYear", "Description": "Возвращает сведения о том, является ли указанный год високосным.", "Documentation": "IsLeapYear(Int32)" }, { "Name": "Parse", "Description": "Преобразует строковое представление даты и времени в его эквивалент DateTime.", "Documentation": "Parse(String)" }, { "Name": "Parse", "Description": "Преобразует строковое представление даты и времени в его эквивалент DateTime, используя сведения о форматировании, связанные с языком и региональными параметрами.", "Documentation": "Parse(String, IFormatProvider)" }, { "Name": "Parse", "Description": "Преобразует строковое представление даты и времени в его эквивалент DateTime, используя указанные сведения о форматировании, связанные с языком и региональными параметрами, а также стиль.", "Documentation": "Parse(String, IFormatProvider, DateTimeStyles)" }, { "Name": "ParseExact", "Description": "Преобразует заданное строковое представление даты и времени в его эквивалент DateTime, используя указанные сведения о форматировании, связанные с языком и региональными параметрами. Формат строкового представления должен полностью соответствовать заданному формату.", "Documentation": "ParseExact(String, String, IFormatProvider)" }, { "Name": "ParseExact", "Description": "Преобразует заданное строковое представление даты и времени в его эквивалент DateTime, используя заданный формат, указанные сведения о форматировании, связанные с языком и региональными параметрами, а также стиль. Формат строкового представления должен полностью соответствовать заданному формату. В противном случае возникает исключение.", "Documentation": "ParseExact(String, String, IFormatProvider, DateTimeStyles)" }, { "Name": "ParseExact", "Description": "Преобразует заданное строковое представление даты и времени в его эквивалент DateTime, используя заданный массив форматов, указанные сведения о форматировании, связанные с языком и региональными параметрами, и стиль форматирования. Формат строкового представления должен полностью соответствовать по крайней мере одному из заданных форматов. В противном случае возникает исключение.", "Documentation": "ParseExact(String, String[], IFormatProvider, DateTimeStyles)" }, { "Name": "SpecifyKind", "Description": "Создает объект DateTime, имеющий то же количество тактов, что и заданный объект DateTime, но предназначенный для использования с местным временем, со стандартом UTC, либо ни с тем, ни с другим, как определено значением DateTimeKind.", "Documentation": "SpecifyKind(DateTime, DateTimeKind)" }, { "Name": "TryParse", "Description": "Преобразовывает указанное строковое представление даты и времени в его эквивалент DateTime и возвращает значение, позволяющее определить успешность преобразования.", "Documentation": "TryParse(String, DateTime)" }, { "Name": "TryParse", "Description": "Преобразует заданное строковое представление даты и времени в его эквивалент DateTime, используя указанную информацию о форматировании, связанную с языком и региональными параметрами, и возвращает значение, которое показывает успешность преобразования.", "Documentation": "TryParse(String, IFormatProvider, DateTimeStyles, DateTime)" }, { "Name": "TryParseExact", "Description": "Преобразует заданное строковое представление даты и времени в его эквивалент DateTime, используя заданный формат, указанные сведения о форматировании, связанные с языком и региональными параметрами, а также стиль. Формат строкового представления должен полностью соответствовать заданному формату. Метод возвращает значение, указывающее, успешно ли выполнено преобразование.", "Documentation": "TryParseExact(String, String, IFormatProvider, DateTimeStyles, DateTime)" }, { "Name": "TryParseExact", "Description": "Преобразует заданное строковое представление даты и времени в его эквивалент DateTime, используя заданный массив форматов, указанные сведения о форматировании, связанные с языком и региональными параметрами, и стиль форматирования. Формат представления строки должен полностью соответствовать хотя бы одному заданному формату. Метод возвращает значение, указывающее, успешно ли выполнено преобразование.", "Documentation": "TryParseExact(String, String[], IFormatProvider, DateTimeStyles, DateTime)" }],
	Array: [{ "Name": "AsReadOnly", "Description": "Возвращает для заданного массива доступную только для чтения программу-оболочку.", "Documentation": "AsReadOnly<T>(T[])" }, { "Name": "BinarySearch", "Description": "Выполняет поиск значения в диапазоне элементов отсортированного одномерного массива, используя интерфейс IComparable, реализуемый каждым элементом массива и заданным значением.", "Documentation": "BinarySearch(Array, Int32, Int32, Object)" }, { "Name": "BinarySearch", "Description": "Выполняет поиск значения в диапазоне элементов отсортированного одномерного массива, используя указанный интерфейс IComparer.", "Documentation": "BinarySearch(Array, Int32, Int32, Object, IComparer)" }, { "Name": "BinarySearch", "Description": "Выполняет поиск заданного элемента во всем отсортированном одномерном массиве, используя интерфейс IComparable, реализуемый каждым элементом массива и заданным объектом.", "Documentation": "BinarySearch(Array, Object)" }, { "Name": "BinarySearch", "Description": "Выполняет поиск значения во всем отсортированном одномерном массиве, используя указанный универсальный интерфейс IComparer.", "Documentation": "BinarySearch(Array, Object, IComparer)" }, { "Name": "BinarySearch", "Description": "Выполняет поиск заданного элемента во всем отсортированном одномерном массиве, используя для этого универсальный интерфейс IComparable<T>, реализуемый каждым элементом массива Array и заданным объектом.", "Documentation": "BinarySearch<T>(T[], T)" }, { "Name": "BinarySearch", "Description": "Выполняет поиск значения во всем отсортированном одномерном массиве, используя указанный универсальный интерфейс IComparer<T>.", "Documentation": "BinarySearch<T>(T[], T, IComparer<T>)" }, { "Name": "BinarySearch", "Description": "Выполняет поиск значения в диапазоне элементов отсортированного одномерного массива, используя для этого универсальный интерфейс IComparable<T>, реализуемый каждым элементом массива Array и заданным значением.", "Documentation": "BinarySearch<T>(T[], Int32, Int32, T)" }, { "Name": "BinarySearch", "Description": "Выполняет поиск значения в диапазоне элементов отсортированного одномерного массива, используя указанный универсальный интерфейс IComparer<T>.", "Documentation": "BinarySearch<T>(T[], Int32, Int32, T, IComparer<T>)" }, { "Name": "Clear", "Description": "Присваивает элементам массива значение 0, false или null, в зависимости от типа элементов", "Documentation": "Clear(Array, Int32, Int32)" }, { "Name": "ConstrainedCopy", "Description": "Копирует диапазон элементов из массива Array, начиная с заданного индекса источника, и вставляет его в другой массив Array, начиная с заданного индекса назначения.  Гарантирует, что в случае невозможности успешно скопировать весь диапазон, все изменения будут отменены.", "Documentation": "ConstrainedCopy(Array, Int32, Array, Int32, Int32)" }, { "Name": "ConvertAll", "Description": "Преобразует массив одного типа в массив другого типа.", "Documentation": "ConvertAll<TInput, TOutput>(TInput[], Converter<TInput, TOutput>)" }, { "Name": "Copy", "Description": "Копирует диапазон элементов из массива Array, начиная с первого элемента, и вставляет его в другой массив Array, также начиная с первого элемента. Длина задается как 32-битовое целое число.", "Documentation": "Copy(Array, Array, Int32)" }, { "Name": "Copy", "Description": "Копирует диапазон элементов из массива Array, начиная с первого элемента, и вставляет его в другой массив Array, также начиная с первого элемента. Длина задается как 64-битовое целое число.", "Documentation": "Copy(Array, Array, Int64)" }, { "Name": "Copy", "Description": "Копирует диапазон элементов из массива Array, начиная с заданного индекса источника, и вставляет его в другой массив Array, начиная с заданного индекса назначения. Длина и индексы задаются как 32-битовые целые числа.", "Documentation": "Copy(Array, Int32, Array, Int32, Int32)" }, { "Name": "Copy", "Description": "Копирует диапазон элементов из массива Array, начиная с заданного индекса источника, и вставляет его в другой массив Array, начиная с заданного индекса назначения. Длина и индексы задаются как 64-битовые целые числа.", "Documentation": "Copy(Array, Int64, Array, Int64, Int64)" }, { "Name": "CreateInstance", "Description": "Создает одномерный массив Array указанного типа Type и длины, индексация которого начинается с нуля.", "Documentation": "CreateInstance(Type, Int32)" }, { "Name": "CreateInstance", "Description": "Создает двумерный массив Array указанного типа Type с заданными длинами измерений и индексацией, начинающейся с нуля.", "Documentation": "CreateInstance(Type, Int32, Int32)" }, { "Name": "CreateInstance", "Description": "Создает трехмерный массив Array указанного типа Type с заданными длинами по измерениям и индексацией, начинающейся с нуля.", "Documentation": "CreateInstance(Type, Int32, Int32, Int32)" }, { "Name": "CreateInstance", "Description": "Создает многомерный массив Array указанного Type по измерениям и индексацией с нуля. Длины по измерениям задаются в массиве 32-битовых целых чисел.", "Documentation": "CreateInstance(Type, Int32[])" }, { "Name": "CreateInstance", "Description": "Создает многомерный массив Array с указанным типом Type и длиной по измерениям и с заданными нижними границами.", "Documentation": "CreateInstance(Type, Int32[], Int32[])" }, { "Name": "CreateInstance", "Description": "Создает многомерный массив Array указанного Type по измерениям и индексацией с нуля. Длины по измерениям задаются в массиве 64-битовых целых чисел.", "Documentation": "CreateInstance(Type, Int64[])" }, { "Name": "Empty", "Description": "Возвращает пустой массив.", "Documentation": "Empty<T>()" }, { "Name": "Exists", "Description": "Определяет, содержит ли заданный массив элементы, удовлетворяющие условиям указанного предиката.", "Documentation": "Exists<T>(T[], Predicate<T>)" }, { "Name": "Find", "Description": "Выполняет поиск элемента, удовлетворяющего условиям указанного предиката, и возвращает первое найденное вхождение в пределах всего списка Array.", "Documentation": "Find<T>(T[], Predicate<T>)" }, { "Name": "FindAll", "Description": "Извлекает все элементы, удовлетворяющие условиям указанного предиката.", "Documentation": "FindAll<T>(T[], Predicate<T>)" }, { "Name": "FindIndex", "Description": "Выполняет поиск элемента, удовлетворяющего условиям указанного предиката, и возвращает отсчитываемый от нуля индекс первого вхождения в диапазоне элементов списка Array, начинающемся с заданного индекса и содержащем указанное число элементов.", "Documentation": "FindIndex<T>(T[], Int32, Int32, Predicate<T>)" }, { "Name": "FindIndex", "Description": "Выполняет поиск элемента, удовлетворяющего условиям указанного предиката, и возвращает отсчитываемый от нуля индекс первого вхождения в диапазоне элементов списка Array, начиная с заданного индекса и заканчивая последним элементом.", "Documentation": "FindIndex<T>(T[], Int32, Predicate<T>)" }, { "Name": "FindIndex", "Description": "Выполняет поиск элемента, удовлетворяющего условиям указанного предиката, и возвращает отсчитываемый от нуля индекс первого найденного вхождения в пределах всего списка Array.", "Documentation": "FindIndex<T>(T[], Predicate<T>)" }, { "Name": "FindLast", "Description": "Выполняет поиск элемента, удовлетворяющего условиям указанного предиката, и возвращает последнее найденное вхождение в пределах всего списка Array.", "Documentation": "FindLast<T>(T[], Predicate<T>)" }, { "Name": "FindLastIndex", "Description": "Выполняет поиск элемента, удовлетворяющего условиям указанного предиката, и возвращает отсчитываемый от нуля индекс последнего вхождения в диапазоне элементов списка Array, содержащем указанное число элементов и заканчивающемся элементом с заданным индексом.", "Documentation": "FindLastIndex<T>(T[], Int32, Int32, Predicate<T>)" }, { "Name": "FindLastIndex", "Description": "Выполняет поиск элемента, удовлетворяющего условиям указанного предиката, и возвращает отсчитываемый от нуля индекс последнего вхождения в диапазоне элементов списка Array, начиная с первого элемента и заканчивая элементом с заданным индексом.", "Documentation": "FindLastIndex<T>(T[], Int32, Predicate<T>)" }, { "Name": "FindLastIndex", "Description": "Выполняет поиск элемента, удовлетворяющего условиям указанного предиката, и возвращает отсчитываемый от нуля индекс последнего найденного вхождения в пределах всего списка Array.", "Documentation": "FindLastIndex<T>(T[], Predicate<T>)" }, { "Name": "ForEach", "Description": "Выполняет указанное действие с каждым элементом указанного массива.", "Documentation": "ForEach<T>(T[], Action<T>)" }, { "Name": "IndexOf", "Description": "Выполняет поиск указанного объекта внутри всего одномерного массива и возвращает индекс его первого вхождения.", "Documentation": "IndexOf(Array, Object)" }, { "Name": "IndexOf", "Description": "Выполняет поиск указанного объекта в диапазоне элементов одномерного массива и возвращает индекс первого найденного совпадения. Диапазон расширяется от указанного индекса до конца массива.", "Documentation": "IndexOf(Array, Object, Int32)" }, { "Name": "IndexOf", "Description": "Выполняет поиск указанного объекта в диапазоне элементов одномерного массива и возвращает индекс первого найденного совпадения. Диапазон расширяется от указанного индекса заданного числа элементов.", "Documentation": "IndexOf(Array, Object, Int32, Int32)" }, { "Name": "IndexOf", "Description": "Выполняет поиск указанного объекта внутри всего одномерного массива и возвращает индекс его первого вхождения.", "Documentation": "IndexOf<T>(T[], T)" }, { "Name": "IndexOf", "Description": "Выполняет поиск указанного объекта в диапазоне элементов одномерного массива и возвращает индекс первого найденного совпадения. Диапазон расширяется от указанного индекса до конца массива.", "Documentation": "IndexOf<T>(T[], T, Int32)" }, { "Name": "IndexOf", "Description": "Выполняет поиск указанного объекта в диапазоне элементов одномерного массива и возвращает индекс первого найденного совпадения. Диапазон расширяется от указанного индекса заданного числа элементов.", "Documentation": "IndexOf<T>(T[], T, Int32, Int32)" }, { "Name": "LastIndexOf", "Description": "Выполняет поиск заданного объекта и возвращает индекс его последнего вхождения внутри всего одномерного массива Array.", "Documentation": "LastIndexOf(Array, Object)" }, { "Name": "LastIndexOf", "Description": "Выполняет поиск указанного объекта и возвращает индекс его последнего вхождения в диапазоне элементов одномерного массива Array, который начинается с первого элемента и заканчивается элементом с заданным индексом.", "Documentation": "LastIndexOf(Array, Object, Int32)" }, { "Name": "LastIndexOf", "Description": "Выполняет поиск указанного объекта и возвращает индекс последнего вхождения в диапазоне элементов одномерного массива Array, который содержит указанное число элементов и заканчивается элементом с заданным индексом.", "Documentation": "LastIndexOf(Array, Object, Int32, Int32)" }, { "Name": "LastIndexOf", "Description": "Выполняет поиск указанного объекта и возвращает индекс последнего вхождения во всем массиве Array.", "Documentation": "LastIndexOf<T>(T[], T)" }, { "Name": "LastIndexOf", "Description": "Выполняет поиск указанного объекта и возвращает индекс последнего вхождения в диапазоне элементов массива Array, начиная с первого элемента и заканчивая элементом с заданным индексом.", "Documentation": "LastIndexOf<T>(T[], T, Int32)" }, { "Name": "LastIndexOf", "Description": "Выполняет поиск указанного объекта и возвращает индекс последнего вхождения в диапазоне элементов массива Array, содержащем указанное число элементов и заканчивающемся в позиции с указанным индексом.", "Documentation": "LastIndexOf<T>(T[], T, Int32, Int32)" }, { "Name": "Resize", "Description": "Изменяет количество элементов в одномерном массиве до указанной величины.", "Documentation": "Resize<T>(T[], Int32)" }, { "Name": "Reverse", "Description": "Изменяет порядок элементов во всем одномерном массиве Array на обратный.", "Documentation": "Reverse(Array)" }, { "Name": "Reverse", "Description": "Изменяет последовательность элементов в диапазоне элементов одномерного массива Array на обратную.", "Documentation": "Reverse(Array, Int32, Int32)" }, { "Name": "Sort", "Description": "Сортирует элементы во всем одномерном массиве Array, используя реализацию интерфейса IComparable каждого элемента массива Array.", "Documentation": "Sort(Array)" }, { "Name": "Sort", "Description": "Сортирует пару одномерных объектов Array (один содержит ключи, а другой — соответствующие элементы) по ключам в первом массиве Array, используя реализацию интерфейса IComparable каждого ключа.", "Documentation": "Sort(Array, Array)" }, { "Name": "Sort", "Description": "Сортирует пару одномерных объектов Array (один содержит ключи, а другой — соответствующие элементы) по ключам в первом массиве Array, используя указанный интерфейс IComparer.", "Documentation": "Sort(Array, Array, IComparer)" }, { "Name": "Sort", "Description": "Сортирует диапазон элементов в паре одномерных объектов Array (один содержит ключи, а другой — соответствующие элементы) по ключам в первом массиве Array, используя реализацию интерфейса IComparable каждого ключа.", "Documentation": "Sort(Array, Array, Int32, Int32)" }, { "Name": "Sort", "Description": "Сортирует диапазон элементов в паре одномерных объектов Array (один содержит ключи, а другой — соответствующие элементы) по ключам в первом массиве Array, используя указанный интерфейс IComparer.", "Documentation": "Sort(Array, Array, Int32, Int32, IComparer)" }, { "Name": "Sort", "Description": "Сортирует элементы в одномерном массиве Array, используя указанный интерфейс IComparer.", "Documentation": "Sort(Array, IComparer)" }, { "Name": "Sort", "Description": "Сортирует элементы в диапазоне элементов одномерного массива Array с помощью реализации интерфейса IComparable каждого элемента массива Array.", "Documentation": "Sort(Array, Int32, Int32)" }, { "Name": "Sort", "Description": "Сортирует элементы в диапазоне элементов одномерного массива Array, используя указанный интерфейс IComparer.", "Documentation": "Sort(Array, Int32, Int32, IComparer)" }, { "Name": "Sort", "Description": "Сортирует элементы во всем массиве Array, используя реализацию универсального интерфейса IComparable<T> каждого элемента массива Array.", "Documentation": "Sort<T>(T[])" }, { "Name": "Sort", "Description": "Сортирует элементы массива Array с использованием указанного объекта Comparison<T>.", "Documentation": "Sort<T>(T[], Comparison<T>)" }, { "Name": "Sort", "Description": "Сортирует элементы в массиве Array, используя указанный универсальный интерфейс IComparer<T>.", "Documentation": "Sort<T>(T[], IComparer<T>)" }, { "Name": "Sort", "Description": "Сортирует элементы в диапазоне элементов массива Array, используя реализацию универсального интерфейса IComparable<T> каждого элемента массива Array.", "Documentation": "Sort<T>(T[], Int32, Int32)" }, { "Name": "Sort", "Description": "Сортирует элементы в диапазоне элементов массива Array, используя указанный универсальный интерфейс IComparer<T>.", "Documentation": "Sort<T>(T[], Int32, Int32, IComparer<T>)" }, { "Name": "Sort", "Description": "Сортирует пару объектов Array (один содержит ключи, а другой — соответствующие элементы) по ключам в первом массиве Array, используя реализацию универсального интерфейса IComparable<T> каждого ключа.", "Documentation": "Sort<TKey, TValue>(TKey[], TValue[])" }, { "Name": "Sort", "Description": "Сортирует пару объектов Array (один содержит ключи, а другой — соответствующие элементы) по ключам в первом массиве Array, используя указанный универсальный интерфейс IComparer<T>.", "Documentation": "Sort<TKey, TValue>(TKey[], TValue[], IComparer<TKey>)" }, { "Name": "Sort", "Description": "Сортирует диапазон элементов в паре объектов Array (один содержит ключи, а другой — соответствующие элементы) по ключам в первом массиве Array, используя реализацию универсального интерфейса IComparable<T> каждого ключа.", "Documentation": "Sort<TKey, TValue>(TKey[], TValue[], Int32, Int32)" }, { "Name": "Sort", "Description": "Сортирует диапазон элементов в паре объектов Array (один содержит ключи, а другой — соответствующие элементы) по ключам в первом массиве Array, используя указанный универсальный интерфейс IComparer<T>.", "Documentation": "Sort<TKey, TValue>(TKey[], TValue[], Int32, Int32, IComparer<TKey>)" }, { "Name": "TrueForAll", "Description": "Определяет, все ли элементы массива удовлетворяют условиям указанного предиката.", "Documentation": "TrueForAll<T>(T[], Predicate<T>)" }],
	Convert: [{ "Name": "ChangeType", "Description": "Возвращает объект указанного типа, значение которого эквивалентно заданному объекту.", "Documentation": "ChangeType(Object, Type)" }, { "Name": "ChangeType", "Description": "Возвращает объект указанного типа, чье значение эквивалентно заданному объекту. Параметр предоставляет сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ChangeType(Object, Type, IFormatProvider)" }, { "Name": "ChangeType", "Description": "Возвращает объект указанного типа, чье значение эквивалентно заданному объекту.", "Documentation": "ChangeType(Object, TypeCode)" }, { "Name": "ChangeType", "Description": "Возвращает объект указанного типа, чье значение эквивалентно заданному объекту. Параметр предоставляет сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ChangeType(Object, TypeCode, IFormatProvider)" }, { "Name": "FromBase64CharArray", "Description": "Преобразует подмножество массива знаков Юникода, представляющих двоичные данные в виде цифр в кодировке Base64, в эквивалентный массив 8-разрядных целых чисел без знака. Параметры задают подмножество входного массива и количество преобразуемых элементов.", "Documentation": "FromBase64CharArray(Char[], Int32, Int32)" }, { "Name": "FromBase64String", "Description": "Преобразует заданную строку, представляющую двоичные данные в виде цифр в кодировке Base64, в эквивалентный массив 8-разрядных целых чисел без знака.", "Documentation": "FromBase64String(String)" }, { "Name": "GetTypeCode", "Description": "Возвращает TypeCode для заданного объекта.", "Documentation": "GetTypeCode(Object)" }, { "Name": "IsDBNull", "Description": "Возвращает значение, указывающее, имеет ли заданный объект тип DBNull.", "Documentation": "IsDBNull(Object)" }, { "Name": "ToBase64CharArray", "Description": "Преобразует подмножество массива 8-разрядных целых чисел без знака в эквивалентное подмножество массива знаков Юникода, состоящее из цифр в кодировке Base64. Подмножества задаются с помощью параметров как смещение во входном и выходном массивах и количеством преобразуемых элементов входного массива.", "Documentation": "ToBase64CharArray(Byte[], Int32, Int32, Char[], Int32)" }, { "Name": "ToBase64CharArray", "Description": "Преобразует подмножество массива 8-разрядных целых чисел без знака в эквивалентное подмножество массива знаков Юникода, состоящее из цифр в кодировке Base64. В параметрах задаются подмножества как смещение во входном и выходном массивах и количество преобразуемых элементов входного массива, а также значение, указывающее, следует ли вставлять в выходной массив разрывы строки.", "Documentation": "ToBase64CharArray(Byte[], Int32, Int32, Char[], Int32, Base64FormattingOptions)" }, { "Name": "ToBase64String", "Description": "Преобразует массив 8-разрядных целых чисел без знака в эквивалентное строковое представление, состоящее из цифр в кодировке Base64.", "Documentation": "ToBase64String(Byte[])" }, { "Name": "ToBase64String", "Description": "Преобразует массив 8-разрядных целых чисел без знака в эквивалентное строковое представление, состоящее из цифр в кодировке Base64. Параметр указывает, следует ли вставлять в возвращаемое значение разрывы строки.", "Documentation": "ToBase64String(Byte[], Base64FormattingOptions)" }, { "Name": "ToBase64String", "Description": "Преобразует подмножество массива 8-разрядных целых чисел без знака в эквивалентное строковое представление, состоящее из цифр в кодировке Base64. В параметрах задается подмножество как смещение во входном массиве и количество преобразуемых элементов этого массива.", "Documentation": "ToBase64String(Byte[], Int32, Int32)" }, { "Name": "ToBase64String", "Description": "Преобразует подмножество массива 8-разрядных целых чисел без знака в эквивалентное строковое представление, состоящее из цифр в кодировке Base64. В параметрах задаются подмножество как смещение во входном массиве и количество преобразуемых элементов этого массива, а также значение, указывающее, следует ли вставлять в выходной массив разрывы строки.", "Documentation": "ToBase64String(Byte[], Int32, Int32, Base64FormattingOptions)" }, { "Name": "ToBoolean", "Description": "Возвращает заданное логическое значение; фактическое преобразование не производится.", "Documentation": "ToBoolean(Boolean)" }, { "Name": "ToBoolean", "Description": "Преобразует значение заданного 8-битового целого числа без знака в эквивалентное логическое значение.", "Documentation": "ToBoolean(Byte)" }, { "Name": "ToBoolean", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToBoolean(Char)" }, { "Name": "ToBoolean", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToBoolean(DateTime)" }, { "Name": "ToBoolean", "Description": "Преобразует значение заданного десятичного числа в эквивалентное логическое значение.", "Documentation": "ToBoolean(Decimal)" }, { "Name": "ToBoolean", "Description": "Преобразует значение заданного числа двойной точности с плавающей запятой в эквивалентное логическое значение.", "Documentation": "ToBoolean(Double)" }, { "Name": "ToBoolean", "Description": "Преобразует значение заданного 16-битового целого числа со знаком в эквивалентное логическое значение.", "Documentation": "ToBoolean(Int16)" }, { "Name": "ToBoolean", "Description": "Преобразует значение заданного 32-битового целого числа со знаком в эквивалентное логическое значение.", "Documentation": "ToBoolean(Int32)" }, { "Name": "ToBoolean", "Description": "Преобразует значение заданного 64-битового целого числа со знаком в эквивалентное логическое значение.", "Documentation": "ToBoolean(Int64)" }, { "Name": "ToBoolean", "Description": "Преобразует значение заданного объекта в эквивалентное логическое значение.", "Documentation": "ToBoolean(Object)" }, { "Name": "ToBoolean", "Description": "Преобразует значение заданного объекта в эквивалентное логическое значение, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToBoolean(Object, IFormatProvider)" }, { "Name": "ToBoolean", "Description": "Преобразует значение заданного 8-битового целого числа со знаком в эквивалентное логическое значение.", "Documentation": "ToBoolean(SByte)" }, { "Name": "ToBoolean", "Description": "Преобразует значение заданного числа с плавающей запятой одиночной точности в эквивалентное логическое значение.", "Documentation": "ToBoolean(Single)" }, { "Name": "ToBoolean", "Description": "Преобразует заданное строковое представление логического значения в эквивалентное логическое значение.", "Documentation": "ToBoolean(String)" }, { "Name": "ToBoolean", "Description": "Преобразует заданное строковое представление логического значения в эквивалентное логическое значение, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToBoolean(String, IFormatProvider)" }, { "Name": "ToBoolean", "Description": "Преобразует значение заданного 16-битового целого числа без знака в эквивалентное логическое значение.", "Documentation": "ToBoolean(UInt16)" }, { "Name": "ToBoolean", "Description": "Преобразует значение заданного 32-битового целого числа без знака в эквивалентное логическое значение.", "Documentation": "ToBoolean(UInt32)" }, { "Name": "ToBoolean", "Description": "Преобразует значение заданного 64-битового целого числа без знака в эквивалентное логическое значение.", "Documentation": "ToBoolean(UInt64)" }, { "Name": "ToByte", "Description": "Преобразует заданное логическое значение в эквивалентное 8-битовое целое число без знака.", "Documentation": "ToByte(Boolean)" }, { "Name": "ToByte", "Description": "Возвращает заданное 8-битовое целое число без знака; фактическое преобразование не производится.", "Documentation": "ToByte(Byte)" }, { "Name": "ToByte", "Description": "Преобразует значение заданного символа Юникода в эквивалентное 8-битовое целое число без знака.", "Documentation": "ToByte(Char)" }, { "Name": "ToByte", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToByte(DateTime)" }, { "Name": "ToByte", "Description": "Преобразует значение заданного десятичного числа в эквивалентное 8-битовое целое число без знака.", "Documentation": "ToByte(Decimal)" }, { "Name": "ToByte", "Description": "Преобразует значение заданного числа с плавающей запятой двойной точности в эквивалентное 8-битовое целое число без знака.", "Documentation": "ToByte(Double)" }, { "Name": "ToByte", "Description": "Преобразует значение заданного 16-битового целого числа со знаком в эквивалентное 8-битовое целое число без знака.", "Documentation": "ToByte(Int16)" }, { "Name": "ToByte", "Description": "Преобразует значение заданного 32-битового целого числа со знаком в эквивалентное 8-битовое целое число без знака.", "Documentation": "ToByte(Int32)" }, { "Name": "ToByte", "Description": "Преобразует значение заданного 64-битового целого числа со знаком в эквивалентное 8-битовое целое число без знака.", "Documentation": "ToByte(Int64)" }, { "Name": "ToByte", "Description": "Преобразует значение заданного объекта в 8-разрядное целое число без знака.", "Documentation": "ToByte(Object)" }, { "Name": "ToByte", "Description": "Преобразует значение заданного объекта в эквивалентное 8-разрядное целое число без знака, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToByte(Object, IFormatProvider)" }, { "Name": "ToByte", "Description": "Преобразует значение заданного 8-битового целого числа со знаком в эквивалентное 8-битовое целое число без знака.", "Documentation": "ToByte(SByte)" }, { "Name": "ToByte", "Description": "Преобразует значение заданного числа с плавающей запятой одиночной точности в эквивалентное 8-битовое целое число без знака.", "Documentation": "ToByte(Single)" }, { "Name": "ToByte", "Description": "Преобразует заданное строковое представление числа в эквивалентное 8-битовое целое число без знака.", "Documentation": "ToByte(String)" }, { "Name": "ToByte", "Description": "Преобразует заданное строковое представление числа в эквивалентное 8-разрядное целое число без знака, учитывая сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToByte(String, IFormatProvider)" }, { "Name": "ToByte", "Description": "Преобразует строковое представление числа с указанным основанием системы счисления в эквивалентное ему 8-битовое целое число без знака.", "Documentation": "ToByte(String, Int32)" }, { "Name": "ToByte", "Description": "Преобразует значение заданного 16-разрядного целого числа без знака в эквивалентное 8-разрядное целое число без знака.", "Documentation": "ToByte(UInt16)" }, { "Name": "ToByte", "Description": "Преобразует значение заданного 32-битового целого числа без знака в эквивалентное 8-битовое целое число без знака.", "Documentation": "ToByte(UInt32)" }, { "Name": "ToByte", "Description": "Преобразует значение заданного 64-разрядного целого числа без знака в эквивалентное 8-разрядное целое число без знака.", "Documentation": "ToByte(UInt64)" }, { "Name": "ToChar", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToChar(Boolean)" }, { "Name": "ToChar", "Description": "Преобразует значение заданного 8-разрядного целого числа без знака в эквивалентный символ Юникода.", "Documentation": "ToChar(Byte)" }, { "Name": "ToChar", "Description": "Возвращает заданное значение символа Юникода; фактическое преобразование не производится.", "Documentation": "ToChar(Char)" }, { "Name": "ToChar", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToChar(DateTime)" }, { "Name": "ToChar", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToChar(Decimal)" }, { "Name": "ToChar", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToChar(Double)" }, { "Name": "ToChar", "Description": "Преобразует значение заданного 16-битового целого числа со знаком в эквивалентный символ Юникода.", "Documentation": "ToChar(Int16)" }, { "Name": "ToChar", "Description": "Преобразует значение заданного 32-битового целого числа со знаком в эквивалентный символ Юникода.", "Documentation": "ToChar(Int32)" }, { "Name": "ToChar", "Description": "Преобразует значение заданного 64-битового целого числа со знаком в эквивалентный символ Юникода.", "Documentation": "ToChar(Int64)" }, { "Name": "ToChar", "Description": "Преобразует значение заданного объекта в знак Юникода.", "Documentation": "ToChar(Object)" }, { "Name": "ToChar", "Description": "Преобразует значение заданного объекта в эквивалентный знак Юникода, используя указанные сведения о форматировании, связанные с языком и региональными параметрами.", "Documentation": "ToChar(Object, IFormatProvider)" }, { "Name": "ToChar", "Description": "Преобразует значение заданного 8-битового целого числа со знаком в эквивалентный символ Юникода.", "Documentation": "ToChar(SByte)" }, { "Name": "ToChar", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToChar(Single)" }, { "Name": "ToChar", "Description": "Преобразует первый знак указанной строки в знак Юникода.", "Documentation": "ToChar(String)" }, { "Name": "ToChar", "Description": "Преобразует первый знак заданной строки в знак Юникода, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToChar(String, IFormatProvider)" }, { "Name": "ToChar", "Description": "Преобразует значение заданного 16-разрядного целого числа без знака в эквивалентный символ Юникода.", "Documentation": "ToChar(UInt16)" }, { "Name": "ToChar", "Description": "Преобразует значение заданного 32-разрядного целого числа без знака в эквивалентный символ Юникода.", "Documentation": "ToChar(UInt32)" }, { "Name": "ToChar", "Description": "Преобразует значение заданного 64-разрядного целого числа без знака в эквивалентный символ Юникода.", "Documentation": "ToChar(UInt64)" }, { "Name": "ToDateTime", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDateTime(Boolean)" }, { "Name": "ToDateTime", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDateTime(Byte)" }, { "Name": "ToDateTime", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDateTime(Char)" }, { "Name": "ToDateTime", "Description": "Возвращает заданный объект DateTime; фактическое преобразование не производится.", "Documentation": "ToDateTime(DateTime)" }, { "Name": "ToDateTime", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDateTime(Decimal)" }, { "Name": "ToDateTime", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDateTime(Double)" }, { "Name": "ToDateTime", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDateTime(Int16)" }, { "Name": "ToDateTime", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDateTime(Int32)" }, { "Name": "ToDateTime", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDateTime(Int64)" }, { "Name": "ToDateTime", "Description": "Преобразует значение указанного объекта в объект DateTime.", "Documentation": "ToDateTime(Object)" }, { "Name": "ToDateTime", "Description": "Преобразует значение заданного объекта в объект DateTime, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToDateTime(Object, IFormatProvider)" }, { "Name": "ToDateTime", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDateTime(SByte)" }, { "Name": "ToDateTime", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDateTime(Single)" }, { "Name": "ToDateTime", "Description": "Преобразует заданное строковое представление даты и времени в эквивалентное значение даты и времени.", "Documentation": "ToDateTime(String)" }, { "Name": "ToDateTime", "Description": "Преобразует заданное строковое представление числа в эквивалентное значение даты и времени, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToDateTime(String, IFormatProvider)" }, { "Name": "ToDateTime", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDateTime(UInt16)" }, { "Name": "ToDateTime", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDateTime(UInt32)" }, { "Name": "ToDateTime", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDateTime(UInt64)" }, { "Name": "ToDecimal", "Description": "Преобразует заданное логическое значение в эквивалентное десятичное число.", "Documentation": "ToDecimal(Boolean)" }, { "Name": "ToDecimal", "Description": "Преобразует значение заданного 8-разрядного целого число без знака в эквивалентное десятичное число.", "Documentation": "ToDecimal(Byte)" }, { "Name": "ToDecimal", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDecimal(Char)" }, { "Name": "ToDecimal", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDecimal(DateTime)" }, { "Name": "ToDecimal", "Description": "Возвращает заданное десятичное число; фактическое преобразование не производится.", "Documentation": "ToDecimal(Decimal)" }, { "Name": "ToDecimal", "Description": "Преобразует значение заданного числа с плавающей запятой двойной точности в эквивалентное десятичное число.", "Documentation": "ToDecimal(Double)" }, { "Name": "ToDecimal", "Description": "Преобразует значение заданного 16-разрядного знакового целого числа в эквивалентное десятичное число.", "Documentation": "ToDecimal(Int16)" }, { "Name": "ToDecimal", "Description": "Преобразует значение заданного 32-разрядного знакового целого числа в эквивалентное десятичное число.", "Documentation": "ToDecimal(Int32)" }, { "Name": "ToDecimal", "Description": "Преобразует значение заданного 64-разрядного знакового целого числа в эквивалентное десятичное число.", "Documentation": "ToDecimal(Int64)" }, { "Name": "ToDecimal", "Description": "Преобразует значение заданного объекта в эквивалентное десятичное число.", "Documentation": "ToDecimal(Object)" }, { "Name": "ToDecimal", "Description": "Преобразует значение заданного объекта в эквивалентное десятичное число, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToDecimal(Object, IFormatProvider)" }, { "Name": "ToDecimal", "Description": "Преобразует значение заданного 8-разрядного знакового целого числа в эквивалентное десятичное число.", "Documentation": "ToDecimal(SByte)" }, { "Name": "ToDecimal", "Description": "Преобразует значение заданного числа с плавающей запятой одиночной точности в эквивалентное десятичное число.", "Documentation": "ToDecimal(Single)" }, { "Name": "ToDecimal", "Description": "Преобразует заданное строковое представление числа в эквивалентное десятичное число.", "Documentation": "ToDecimal(String)" }, { "Name": "ToDecimal", "Description": "Преобразует заданное строковое представление числа в эквивалентное десятичное число, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToDecimal(String, IFormatProvider)" }, { "Name": "ToDecimal", "Description": "Преобразует значение заданного 16-разрядного целого числа без знака в эквивалентное десятичное число.", "Documentation": "ToDecimal(UInt16)" }, { "Name": "ToDecimal", "Description": "Преобразует значение заданного 32-разрядного целого числа без знака в эквивалентное десятичное число.", "Documentation": "ToDecimal(UInt32)" }, { "Name": "ToDecimal", "Description": "Преобразует значение заданного 64-разрядного целого числа без знака в эквивалентное десятичное число.", "Documentation": "ToDecimal(UInt64)" }, { "Name": "ToDouble", "Description": "Преобразует заданное логическое значение в эквивалентное число с плавающей запятой двойной точности.", "Documentation": "ToDouble(Boolean)" }, { "Name": "ToDouble", "Description": "Преобразует значение заданного 8-разрядного целого числа без знака в эквивалентное число с плавающей запятой двойной точности.", "Documentation": "ToDouble(Byte)" }, { "Name": "ToDouble", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDouble(Char)" }, { "Name": "ToDouble", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToDouble(DateTime)" }, { "Name": "ToDouble", "Description": "Преобразует значение заданного десятичного числа в эквивалентное число с плавающей запятой двойной точности.", "Documentation": "ToDouble(Decimal)" }, { "Name": "ToDouble", "Description": "Возвращает заданное число с плавающей запятой двойной точности; фактическое преобразование не производится.", "Documentation": "ToDouble(Double)" }, { "Name": "ToDouble", "Description": "Преобразует значение заданного 16-разрядного знакового целого числа в эквивалентное число с плавающей запятой двойной точности.", "Documentation": "ToDouble(Int16)" }, { "Name": "ToDouble", "Description": "Преобразует значение заданного 32-разрядного знакового целого числа в эквивалентное число с плавающей запятой двойной точности.", "Documentation": "ToDouble(Int32)" }, { "Name": "ToDouble", "Description": "Преобразует значение заданного 64-разрядного знакового целого числа в эквивалентное число с плавающей запятой двойной точности.", "Documentation": "ToDouble(Int64)" }, { "Name": "ToDouble", "Description": "Преобразует значение заданного объекта в число с плавающей запятой двойной точности.", "Documentation": "ToDouble(Object)" }, { "Name": "ToDouble", "Description": "Преобразует значение заданного объекта в число с плавающей запятой двойной точности, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToDouble(Object, IFormatProvider)" }, { "Name": "ToDouble", "Description": "Преобразует значение заданного 8-разрядного знакового целого числа в эквивалентное число с плавающей запятой двойной точности.", "Documentation": "ToDouble(SByte)" }, { "Name": "ToDouble", "Description": "Преобразует значение заданного числа с плавающей запятой одинарной точности в эквивалентное число с плавающей запятой двойной точности.", "Documentation": "ToDouble(Single)" }, { "Name": "ToDouble", "Description": "Преобразует заданное строковое представление числа в эквивалентное число с плавающей запятой двойной точности.", "Documentation": "ToDouble(String)" }, { "Name": "ToDouble", "Description": "Преобразует заданное строковое представление числа в эквивалентное число с плавающей запятой двойной точности, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToDouble(String, IFormatProvider)" }, { "Name": "ToDouble", "Description": "Преобразует значение заданного 16-разрядного целого числа без знака в эквивалентное число с плавающей запятой двойной точности.", "Documentation": "ToDouble(UInt16)" }, { "Name": "ToDouble", "Description": "Преобразует значение заданного 32-разрядного целого числа без знака в эквивалентное число двойной точности с плавающей запятой.", "Documentation": "ToDouble(UInt32)" }, { "Name": "ToDouble", "Description": "Преобразует значение заданного 64-разрядного целого числа без знака в эквивалентное число двойной точности с плавающей запятой.", "Documentation": "ToDouble(UInt64)" }, { "Name": "ToInt16", "Description": "Преобразует заданное логическое значение в эквивалентное 16-битовое целое число со знаком.", "Documentation": "ToInt16(Boolean)" }, { "Name": "ToInt16", "Description": "Преобразует значение заданного 8-разрядного целого числа без знака в эквивалентное 16-разрядное целое число со знаком.", "Documentation": "ToInt16(Byte)" }, { "Name": "ToInt16", "Description": "Преобразует значение заданного символа Юникода в эквивалентное 16-битовое целое число со знаком.", "Documentation": "ToInt16(Char)" }, { "Name": "ToInt16", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToInt16(DateTime)" }, { "Name": "ToInt16", "Description": "Преобразует значение заданного десятичного числа в эквивалентное 16-битовое целое число со знаком.", "Documentation": "ToInt16(Decimal)" }, { "Name": "ToInt16", "Description": "Преобразует значение заданного числа с плавающей запятой двойной точности в эквивалентное 16-битовое целое число со знаком.", "Documentation": "ToInt16(Double)" }, { "Name": "ToInt16", "Description": "Возвращает заданное 16-битовое целое число со знаком; фактическое преобразование не производится.", "Documentation": "ToInt16(Int16)" }, { "Name": "ToInt16", "Description": "Преобразует значение заданного 32-битового целого числа со знаком в эквивалентное 16-битовое целое число со знаком.", "Documentation": "ToInt16(Int32)" }, { "Name": "ToInt16", "Description": "Преобразует значение заданного 64-битового целого числа со знаком в эквивалентное 16-битовое целое число со знаком.", "Documentation": "ToInt16(Int64)" }, { "Name": "ToInt16", "Description": "Преобразует значение заданного объекта в 16-битовое целое число со знаком.", "Documentation": "ToInt16(Object)" }, { "Name": "ToInt16", "Description": "Преобразует значение заданного объекта в эквивалентное 16-битовое целое число со знаком, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToInt16(Object, IFormatProvider)" }, { "Name": "ToInt16", "Description": "Преобразует значение заданного 8-разрядного целого числа со знаком в эквивалентное 16-разрядное целое число со знаком.", "Documentation": "ToInt16(SByte)" }, { "Name": "ToInt16", "Description": "Преобразует значение заданного числа с плавающей запятой одиночной точности в эквивалентное 16-битовое целое число со знаком.", "Documentation": "ToInt16(Single)" }, { "Name": "ToInt16", "Description": "Преобразует заданное строковое представление числа в эквивалентное 16-битовое целое число со знаком.", "Documentation": "ToInt16(String)" }, { "Name": "ToInt16", "Description": "Преобразует заданное строковое представление числа в эквивалентное 16-битовое целое число со знаком, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToInt16(String, IFormatProvider)" }, { "Name": "ToInt16", "Description": "Преобразует строковое представление числа с указанным основанием системы счисления в эквивалентное ему 16-битовое целое число со знаком.", "Documentation": "ToInt16(String, Int32)" }, { "Name": "ToInt16", "Description": "Преобразует значение заданного 16-битового целого числа без знака в эквивалентное 16-битовое целое число со знаком.", "Documentation": "ToInt16(UInt16)" }, { "Name": "ToInt16", "Description": "Преобразует значение заданного 32-битового целого числа без знака в эквивалентное 16-битовое целое число со знаком.", "Documentation": "ToInt16(UInt32)" }, { "Name": "ToInt16", "Description": "Преобразует значение заданного 64-битового целого числа без знака в эквивалентное 16-битовое целое число со знаком.", "Documentation": "ToInt16(UInt64)" }, { "Name": "ToInt32", "Description": "Преобразует заданное логическое значение в эквивалентное 32-битовое целое число со знаком.", "Documentation": "ToInt32(Boolean)" }, { "Name": "ToInt32", "Description": "Преобразует значение заданного 8-битового целого числа без знака в эквивалентное 32-битовое целое число со знаком.", "Documentation": "ToInt32(Byte)" }, { "Name": "ToInt32", "Description": "Преобразует значение заданного символа Юникода в эквивалентное 32-битовое целое число со знаком.", "Documentation": "ToInt32(Char)" }, { "Name": "ToInt32", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToInt32(DateTime)" }, { "Name": "ToInt32", "Description": "Преобразует значение заданного десятичного числа в эквивалентное 32-битовое целое число со знаком.", "Documentation": "ToInt32(Decimal)" }, { "Name": "ToInt32", "Description": "Преобразует значение заданного числа с плавающей запятой двойной точности в эквивалентное 32-битовое целое число со знаком.", "Documentation": "ToInt32(Double)" }, { "Name": "ToInt32", "Description": "Преобразует значение заданного 16-разрядного целого числа со знаком в эквивалентное 32-разрядное целое число со знаком.", "Documentation": "ToInt32(Int16)" }, { "Name": "ToInt32", "Description": "Возвращает заданное 32-битовое целое число со знаком; фактически, преобразование не производится.", "Documentation": "ToInt32(Int32)" }, { "Name": "ToInt32", "Description": "Преобразует значение заданного 64-разрядного целого числа со знаком в эквивалентное 32-разрядное целое число со знаком.", "Documentation": "ToInt32(Int64)" }, { "Name": "ToInt32", "Description": "Преобразует значение заданного объекта в 32-битовое целое число со знаком.", "Documentation": "ToInt32(Object)" }, { "Name": "ToInt32", "Description": "Преобразует значение заданного объекта в эквивалентное 32-битовое целое число со знаком, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToInt32(Object, IFormatProvider)" }, { "Name": "ToInt32", "Description": "Преобразует значение заданного 8-разрядного целого числа со знаком в эквивалентное 32-разрядное целое число со знаком.", "Documentation": "ToInt32(SByte)" }, { "Name": "ToInt32", "Description": "Преобразует значение заданного числа с плавающей запятой одиночной точности в эквивалентное 32-битовое целое число со знаком.", "Documentation": "ToInt32(Single)" }, { "Name": "ToInt32", "Description": "Преобразует заданное строковое представление числа в эквивалентное 32-битовое целое число со знаком.", "Documentation": "ToInt32(String)" }, { "Name": "ToInt32", "Description": "Преобразует заданное строковое представление числа в эквивалентное 32-битовое целое число со знаком, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToInt32(String, IFormatProvider)" }, { "Name": "ToInt32", "Description": "Преобразует строковое представление числа с указанным основанием системы счисления в эквивалентное ему 32-битовое целое число со знаком.", "Documentation": "ToInt32(String, Int32)" }, { "Name": "ToInt32", "Description": "Преобразует значение заданного 16-битового целого числа без знака в эквивалентное 32-битовое целое число со знаком.", "Documentation": "ToInt32(UInt16)" }, { "Name": "ToInt32", "Description": "Преобразует значение заданного 32-битового целого числа без знака в эквивалентное 32-битовое целое число со знаком.", "Documentation": "ToInt32(UInt32)" }, { "Name": "ToInt32", "Description": "Преобразует значение заданного 64-разрядного целого числа без знака в эквивалентное 32-разрядное целое число со знаком.", "Documentation": "ToInt32(UInt64)" }, { "Name": "ToInt64", "Description": "Преобразует заданное логическое значение в эквивалентное 64-битовое целое число со знаком.", "Documentation": "ToInt64(Boolean)" }, { "Name": "ToInt64", "Description": "Преобразует значение заданного 8-битового целого числа без знака в эквивалентное 64-битовое целое число со знаком.", "Documentation": "ToInt64(Byte)" }, { "Name": "ToInt64", "Description": "Преобразует значение заданного символа Юникода в эквивалентное 64-битовое целое число со знаком.", "Documentation": "ToInt64(Char)" }, { "Name": "ToInt64", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToInt64(DateTime)" }, { "Name": "ToInt64", "Description": "Преобразует значение заданного десятичного числа в эквивалентное 64-битовое целое число со знаком.", "Documentation": "ToInt64(Decimal)" }, { "Name": "ToInt64", "Description": "Преобразует значение заданного числа с плавающей запятой двойной точности в эквивалентное 64-битовое целое число со знаком.", "Documentation": "ToInt64(Double)" }, { "Name": "ToInt64", "Description": "Преобразует значение заданного 16-битового целого числа со знаком в эквивалентное 64-битовое целое число со знаком.", "Documentation": "ToInt64(Int16)" }, { "Name": "ToInt64", "Description": "Преобразует значение заданного 32-битового целого числа со знаком в эквивалентное 64-битовое целое число со знаком.", "Documentation": "ToInt64(Int32)" }, { "Name": "ToInt64", "Description": "Возвращает заданное 64-битовое целое число со знаком; фактическое преобразование не производится.", "Documentation": "ToInt64(Int64)" }, { "Name": "ToInt64", "Description": "Преобразует значение заданного объекта в 64-битовое целое число со знаком.", "Documentation": "ToInt64(Object)" }, { "Name": "ToInt64", "Description": "Преобразует значение заданного объекта в эквивалентное 64-битовое целое число со знаком, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToInt64(Object, IFormatProvider)" }, { "Name": "ToInt64", "Description": "Преобразует значение заданного 8-разрядного целого числа со знаком в эквивалентное 64-разрядное целое число со знаком.", "Documentation": "ToInt64(SByte)" }, { "Name": "ToInt64", "Description": "Преобразует значение заданного числа с плавающей запятой одиночной точности в эквивалентное 64-битовое целое число со знаком.", "Documentation": "ToInt64(Single)" }, { "Name": "ToInt64", "Description": "Преобразует заданное строковое представление числа в эквивалентное 64-битовое целое число со знаком.", "Documentation": "ToInt64(String)" }, { "Name": "ToInt64", "Description": "Преобразует заданное строковое представление числа в эквивалентное 64-битовое целое число со знаком, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToInt64(String, IFormatProvider)" }, { "Name": "ToInt64", "Description": "Преобразует строковое представление числа с указанным основанием системы счисления в эквивалентное ему 64-битовое целое число со знаком.", "Documentation": "ToInt64(String, Int32)" }, { "Name": "ToInt64", "Description": "Преобразует значение заданного 16-битового целого числа без знака в эквивалентное 64-битовое целое число со знаком.", "Documentation": "ToInt64(UInt16)" }, { "Name": "ToInt64", "Description": "Преобразует значение заданного 32-битового целого числа без знака в эквивалентное 64-битовое целое число со знаком.", "Documentation": "ToInt64(UInt32)" }, { "Name": "ToInt64", "Description": "Преобразует значение заданного 64-битового целого числа без знака в эквивалентное 64-битовое целое число со знаком.", "Documentation": "ToInt64(UInt64)" }, { "Name": "ToSByte", "Description": "Преобразует заданное логическое значение в эквивалентное 8-битовое целое число со знаком.", "Documentation": "ToSByte(Boolean)" }, { "Name": "ToSByte", "Description": "Преобразует значение заданного 8-битового целого числа без знака в эквивалентное 8-битовое целое число со знаком.", "Documentation": "ToSByte(Byte)" }, { "Name": "ToSByte", "Description": "Преобразует значение заданного символа Юникода в эквивалентное 8-битовое целое число со знаком.", "Documentation": "ToSByte(Char)" }, { "Name": "ToSByte", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToSByte(DateTime)" }, { "Name": "ToSByte", "Description": "Преобразует значение заданного десятичного числа в эквивалентное 8-битовое целое число со знаком.", "Documentation": "ToSByte(Decimal)" }, { "Name": "ToSByte", "Description": "Преобразует значение заданного числа с плавающей запятой двойной точности в эквивалентное 8-битовое целое число со знаком.", "Documentation": "ToSByte(Double)" }, { "Name": "ToSByte", "Description": "Преобразует значение заданного 8-разрядного целого числа со знаком в эквивалентное 16-разрядное целое число со знаком.", "Documentation": "ToSByte(Int16)" }, { "Name": "ToSByte", "Description": "Преобразует значение заданного 32-битового целого числа со знаком в эквивалентное 8-битовое целое число со знаком.", "Documentation": "ToSByte(Int32)" }, { "Name": "ToSByte", "Description": "Преобразует значение заданного 64-битового целого числа со знаком в эквивалентное 8-битовое целое число со знаком.", "Documentation": "ToSByte(Int64)" }, { "Name": "ToSByte", "Description": "Преобразует значение заданного объекта в 8-битовое целое число со знаком.", "Documentation": "ToSByte(Object)" }, { "Name": "ToSByte", "Description": "Преобразует значение заданного объекта в эквивалентное 8-разрядное знаковое целое число, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToSByte(Object, IFormatProvider)" }, { "Name": "ToSByte", "Description": "Возвращает заданное 8-битовое целое число со знаком; фактическое преобразование не производится.", "Documentation": "ToSByte(SByte)" }, { "Name": "ToSByte", "Description": "Преобразует значение заданного числа с плавающей запятой одиночной точности в эквивалентное 8-битовое целое число со знаком.", "Documentation": "ToSByte(Single)" }, { "Name": "ToSByte", "Description": "Преобразует заданное строковое представление числа в эквивалентное 8-битовое целое число со знаком.", "Documentation": "ToSByte(String)" }, { "Name": "ToSByte", "Description": "Преобразует заданное строковое представление числа в эквивалентное 8-битовое целое число со знаком, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToSByte(String, IFormatProvider)" }, { "Name": "ToSByte", "Description": "Преобразует строковое представление числа с указанным основанием системы счисления в эквивалентное ему 8-битовое целое число со знаком.", "Documentation": "ToSByte(String, Int32)" }, { "Name": "ToSByte", "Description": "Преобразует значение заданного 16-битового целого числа без знака в эквивалентное 8-битовое целое число со знаком.", "Documentation": "ToSByte(UInt16)" }, { "Name": "ToSByte", "Description": "Преобразует значение заданного 32-битового целого числа без знака в эквивалентное 8-битовое целое число со знаком.", "Documentation": "ToSByte(UInt32)" }, { "Name": "ToSByte", "Description": "Преобразует значение заданного 64-битового целого числа без знака в эквивалентное 8-битовое целое число со знаком.", "Documentation": "ToSByte(UInt64)" }, { "Name": "ToSingle", "Description": "Преобразует заданное логическое значение в эквивалентное число с плавающей запятой одиночной точности.", "Documentation": "ToSingle(Boolean)" }, { "Name": "ToSingle", "Description": "Преобразует значение заданного 8-битового целого числа без знака в эквивалентное число с плавающей запятой одиночной точности.", "Documentation": "ToSingle(Byte)" }, { "Name": "ToSingle", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToSingle(Char)" }, { "Name": "ToSingle", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToSingle(DateTime)" }, { "Name": "ToSingle", "Description": "Преобразует значение заданного десятичного числа в эквивалентное число с плавающей запятой одиночной точности.", "Documentation": "ToSingle(Decimal)" }, { "Name": "ToSingle", "Description": "Преобразует значение заданного числа с плавающей запятой двойной точности в эквивалентное число с плавающей запятой одинарной точности.", "Documentation": "ToSingle(Double)" }, { "Name": "ToSingle", "Description": "Преобразует значение заданного 16-битового целого числа со знаком в эквивалентное число с плавающей запятой одиночной точности.", "Documentation": "ToSingle(Int16)" }, { "Name": "ToSingle", "Description": "Преобразует значение заданного 32-битового целого числа со знаком в эквивалентное число с плавающей запятой одиночной точности.", "Documentation": "ToSingle(Int32)" }, { "Name": "ToSingle", "Description": "Преобразует значение заданного 64-битового целого числа со знаком в эквивалентное число с плавающей запятой одиночной точности.", "Documentation": "ToSingle(Int64)" }, { "Name": "ToSingle", "Description": "Преобразует значение заданного объекта в число с плавающей запятой одиночной точности.", "Documentation": "ToSingle(Object)" }, { "Name": "ToSingle", "Description": "Преобразует значение заданного объекта в число с плавающей запятой одиночной точности, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToSingle(Object, IFormatProvider)" }, { "Name": "ToSingle", "Description": "Преобразует значение заданного 8-битового целого числа со знаком в эквивалентное число с плавающей запятой одиночной точности.", "Documentation": "ToSingle(SByte)" }, { "Name": "ToSingle", "Description": "Возвращает заданное число с плавающей запятой одиночной точности; фактическое преобразование не производится.", "Documentation": "ToSingle(Single)" }, { "Name": "ToSingle", "Description": "Преобразует заданное строковое представление числа в эквивалентное число с плавающей запятой одиночной точности.", "Documentation": "ToSingle(String)" }, { "Name": "ToSingle", "Description": "Преобразует заданное строковое представление числа в эквивалентное число с плавающей запятой одиночной точности, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToSingle(String, IFormatProvider)" }, { "Name": "ToSingle", "Description": "Преобразует значение заданного 16-битового целого числа без знака в эквивалентное число с плавающей запятой одиночной точности.", "Documentation": "ToSingle(UInt16)" }, { "Name": "ToSingle", "Description": "Преобразует значение заданного 32-битового целого числа без знака в эквивалентное число с плавающей запятой одиночной точности.", "Documentation": "ToSingle(UInt32)" }, { "Name": "ToSingle", "Description": "Преобразует значение заданного 64-битового целого числа без знака в эквивалентное число с плавающей запятой одиночной точности.", "Documentation": "ToSingle(UInt64)" }, { "Name": "ToString", "Description": "Преобразует указанное логическое значение в эквивалентное строковое представление.", "Documentation": "ToString(Boolean)" }, { "Name": "ToString", "Description": "Преобразует указанное логическое значение в эквивалентное строковое представление.", "Documentation": "ToString(Boolean, IFormatProvider)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 8-битового целого числа без знака в эквивалентное строковое представление.", "Documentation": "ToString(Byte)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 8-битового целого числа без знака в эквивалентное строковое представление, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToString(Byte, IFormatProvider)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 8-битового целого числа без знака в эквивалентное строковое представление в указанной системе счисления.", "Documentation": "ToString(Byte, Int32)" }, { "Name": "ToString", "Description": "Преобразует значение заданного знака Юникода в эквивалентное строковое представление.", "Documentation": "ToString(Char)" }, { "Name": "ToString", "Description": "Преобразует значение заданного знака Юникода в эквивалентное строковое представление, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToString(Char, IFormatProvider)" }, { "Name": "ToString", "Description": "Преобразует значение заданного объекта DateTime в эквивалентное строковое представление.", "Documentation": "ToString(DateTime)" }, { "Name": "ToString", "Description": "Преобразует значение заданного объекта DateTime в эквивалентное строковое представление с использованием указанных сведений об особенностях форматирования для данного языка и региональных параметров.", "Documentation": "ToString(DateTime, IFormatProvider)" }, { "Name": "ToString", "Description": "Преобразует значение заданного десятичного числа в эквивалентное строковое представление.", "Documentation": "ToString(Decimal)" }, { "Name": "ToString", "Description": "Преобразует значение заданного десятичного числа в эквивалентное строковое представление, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToString(Decimal, IFormatProvider)" }, { "Name": "ToString", "Description": "Преобразует значение заданного числа с плавающей запятой двойной точности в эквивалентное строковое представление.", "Documentation": "ToString(Double)" }, { "Name": "ToString", "Description": "Преобразует значение заданного числа с плавающей запятой двойной точности в эквивалентное строковое представление.", "Documentation": "ToString(Double, IFormatProvider)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 16-битового целого числа со знаком в эквивалентное строковое представление.", "Documentation": "ToString(Int16)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 16-битового целого числа со знаком в эквивалентное строковое представление, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToString(Int16, IFormatProvider)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 16-битового целого числа со знаком в эквивалентное строковое представление в указанной системе счисления.", "Documentation": "ToString(Int16, Int32)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 32-битового целого числа со знаком в эквивалентное строковое представление.", "Documentation": "ToString(Int32)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 32-битового целого числа со знаком в эквивалентное строковое представление, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToString(Int32, IFormatProvider)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 32-битового целого числа со знаком в эквивалентное строковое представление в указанной системе счисления.", "Documentation": "ToString(Int32, Int32)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 64-битового целого числа со знаком в эквивалентное строковое представление.", "Documentation": "ToString(Int64)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 64-битового целого числа со знаком в эквивалентное строковое представление, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToString(Int64, IFormatProvider)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 64-битового целого числа со знаком в эквивалентное строковое представление в указанной системе счисления.", "Documentation": "ToString(Int64, Int32)" }, { "Name": "ToString", "Description": "Преобразует значение заданного объекта в эквивалентное строковое представление.", "Documentation": "ToString(Object)" }, { "Name": "ToString", "Description": "Преобразует значение указанного объекта в эквивалентное строковое представление с использованием указанных сведений об особенностях форматирования для данного языка и региональных параметров.", "Documentation": "ToString(Object, IFormatProvider)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 8-битового целого числа со знаком в эквивалентное строковое представление.", "Documentation": "ToString(SByte)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 8-битового целого числа со знаком в эквивалентное строковое представление, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToString(SByte, IFormatProvider)" }, { "Name": "ToString", "Description": "Преобразует значение заданного числа с плавающей запятой одиночной точности в эквивалентное строковое представление.", "Documentation": "ToString(Single)" }, { "Name": "ToString", "Description": "Преобразует значение заданного числа с плавающей запятой одиночной точности в эквивалентное строковое представление, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToString(Single, IFormatProvider)" }, { "Name": "ToString", "Description": "Возвращает заданное строковое представление; фактически, преобразование не производится.", "Documentation": "ToString(String)" }, { "Name": "ToString", "Description": "Возвращает заданное строковое представление; фактически, преобразование не производится.", "Documentation": "ToString(String, IFormatProvider)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 16-битового целого числа без знака в эквивалентное строковое представление.", "Documentation": "ToString(UInt16)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 16-битового целого числа без знака в эквивалентное строковое представление, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToString(UInt16, IFormatProvider)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 32-битового целого числа без знака в эквивалентное строковое представление.", "Documentation": "ToString(UInt32)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 32-битового целого числа без знака в эквивалентное строковое представление, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToString(UInt32, IFormatProvider)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 64-битового целого числа без знака в эквивалентное строковое представление.", "Documentation": "ToString(UInt64)" }, { "Name": "ToString", "Description": "Преобразует значение заданного 64-битового целого числа без знака в эквивалентное строковое представление, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToString(UInt64, IFormatProvider)" }, { "Name": "ToUInt16", "Description": "Преобразует заданное логическое значение в эквивалентное 16-битовое целое число без знака.", "Documentation": "ToUInt16(Boolean)" }, { "Name": "ToUInt16", "Description": "Преобразует значение заданного 8-разрядного целого числа без знака в эквивалентное 16-разрядное целое число без знака.", "Documentation": "ToUInt16(Byte)" }, { "Name": "ToUInt16", "Description": "Преобразует значение заданного символа Юникода в эквивалентное 16-битовое целое число без знака.", "Documentation": "ToUInt16(Char)" }, { "Name": "ToUInt16", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToUInt16(DateTime)" }, { "Name": "ToUInt16", "Description": "Преобразует значение заданного десятичного числа в эквивалентное 16-битовое целое число без знака.", "Documentation": "ToUInt16(Decimal)" }, { "Name": "ToUInt16", "Description": "Преобразует значение заданного числа с плавающей запятой двойной точности в эквивалентное 16-битовое целое число без знака.", "Documentation": "ToUInt16(Double)" }, { "Name": "ToUInt16", "Description": "Преобразует значение заданного 16-битового целого числа со знаком в эквивалентное 16-битовое целое число без знака.", "Documentation": "ToUInt16(Int16)" }, { "Name": "ToUInt16", "Description": "Преобразует значение заданного 32-битового целого числа со знаком в эквивалентное 16-битовое целое число без знака.", "Documentation": "ToUInt16(Int32)" }, { "Name": "ToUInt16", "Description": "Преобразует значение заданного 64-битового целого числа со знаком в эквивалентное 16-битовое целое число без знака.", "Documentation": "ToUInt16(Int64)" }, { "Name": "ToUInt16", "Description": "Преобразует значение заданного объекта в 16-битовое целое число без знака.", "Documentation": "ToUInt16(Object)" }, { "Name": "ToUInt16", "Description": "Преобразует значение заданного объекта в эквивалентное 16-битовое целое число без знака, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToUInt16(Object, IFormatProvider)" }, { "Name": "ToUInt16", "Description": "Преобразует значение заданного 8-битового целого числа со знаком в эквивалентное 16-битовое целое число без знака.", "Documentation": "ToUInt16(SByte)" }, { "Name": "ToUInt16", "Description": "Преобразует значение заданного числа с плавающей запятой одиночной точности в эквивалентное 16-битовое целое число без знака.", "Documentation": "ToUInt16(Single)" }, { "Name": "ToUInt16", "Description": "Преобразует заданное строковое представление числа в эквивалентное 16-битовое целое число без знака.", "Documentation": "ToUInt16(String)" }, { "Name": "ToUInt16", "Description": "Преобразует заданное строковое представление числа в эквивалентное 16-битовое целое число без знака, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToUInt16(String, IFormatProvider)" }, { "Name": "ToUInt16", "Description": "Преобразует строковое представление числа с указанным основанием системы счисления в эквивалентное ему 16-битовое целое число без знака.", "Documentation": "ToUInt16(String, Int32)" }, { "Name": "ToUInt16", "Description": "Возвращает заданное 16-битовое целое число без знака; фактически, преобразование не производится.", "Documentation": "ToUInt16(UInt16)" }, { "Name": "ToUInt16", "Description": "Преобразует значение заданного 32-разрядного целого числа без знака в эквивалентное 16-разрядное целое число без знака.", "Documentation": "ToUInt16(UInt32)" }, { "Name": "ToUInt16", "Description": "Преобразует значение заданного 64-разрядного целого числа без знака в эквивалентное 16-разрядное целое число без знака.", "Documentation": "ToUInt16(UInt64)" }, { "Name": "ToUInt32", "Description": "Преобразует заданное логическое значение в эквивалентное 32-битовое целое число без знака.", "Documentation": "ToUInt32(Boolean)" }, { "Name": "ToUInt32", "Description": "Преобразует значение заданного 8-битового целого числа без знака в эквивалентное 32-битовое целое число без знака.", "Documentation": "ToUInt32(Byte)" }, { "Name": "ToUInt32", "Description": "Преобразует значение заданного символа Юникода в эквивалентное 32-битовое целое число без знака.", "Documentation": "ToUInt32(Char)" }, { "Name": "ToUInt32", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToUInt32(DateTime)" }, { "Name": "ToUInt32", "Description": "Преобразует значение заданного десятичного числа в эквивалентное 32-битовое целое число без знака.", "Documentation": "ToUInt32(Decimal)" }, { "Name": "ToUInt32", "Description": "Преобразует значение заданного числа с плавающей запятой двойной точности в эквивалентное 32-битовое целое число без знака.", "Documentation": "ToUInt32(Double)" }, { "Name": "ToUInt32", "Description": "Преобразует значение заданного 16-битового целого числа со знаком в эквивалентное 32-битовое целое число без знака.", "Documentation": "ToUInt32(Int16)" }, { "Name": "ToUInt32", "Description": "Преобразует значение заданного 32-битового целого числа со знаком в эквивалентное 32-битовое целое число без знака.", "Documentation": "ToUInt32(Int32)" }, { "Name": "ToUInt32", "Description": "Преобразует значение заданного 64-битового целого числа со знаком в эквивалентное 32-битовое целое число без знака.", "Documentation": "ToUInt32(Int64)" }, { "Name": "ToUInt32", "Description": "Преобразует значение заданного объекта в 32-битовое целое число без знака.", "Documentation": "ToUInt32(Object)" }, { "Name": "ToUInt32", "Description": "Преобразует значение заданного объекта в эквивалентное 32-битовое целое число без знака, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToUInt32(Object, IFormatProvider)" }, { "Name": "ToUInt32", "Description": "Преобразует значение заданного 8-битового целого числа со знаком в эквивалентное 32-битовое целое число без знака.", "Documentation": "ToUInt32(SByte)" }, { "Name": "ToUInt32", "Description": "Преобразует значение заданного числа с плавающей запятой одиночной точности в эквивалентное 32-битовое целое число без знака.", "Documentation": "ToUInt32(Single)" }, { "Name": "ToUInt32", "Description": "Преобразует заданное строковое представление числа в эквивалентное 32-битовое целое число без знака.", "Documentation": "ToUInt32(String)" }, { "Name": "ToUInt32", "Description": "Преобразует заданное строковое представление числа в эквивалентное 32-битовое целое число без знака, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToUInt32(String, IFormatProvider)" }, { "Name": "ToUInt32", "Description": "Преобразует строковое представление числа с указанным основанием системы счисления в эквивалентное ему 32-битовое целое число без знака.", "Documentation": "ToUInt32(String, Int32)" }, { "Name": "ToUInt32", "Description": "Преобразует значение заданного 16-битового целого числа без знака в эквивалентное 32-битовое целое число без знака.", "Documentation": "ToUInt32(UInt16)" }, { "Name": "ToUInt32", "Description": "Возвращает заданное 32-битовое целое число без знака; фактически, преобразование не производится.", "Documentation": "ToUInt32(UInt32)" }, { "Name": "ToUInt32", "Description": "Преобразует значение заданного 64-разрядного целого числа без знака в эквивалентное 32-разрядное целое число без знака.", "Documentation": "ToUInt32(UInt64)" }, { "Name": "ToUInt64", "Description": "Преобразует заданное логическое значение в эквивалентное 64-битовое целое число без знака.", "Documentation": "ToUInt64(Boolean)" }, { "Name": "ToUInt64", "Description": "Преобразует значение заданного 8-битового целого числа без знака в эквивалентное 64-битовое целое число без знака.", "Documentation": "ToUInt64(Byte)" }, { "Name": "ToUInt64", "Description": "Преобразует значение заданного символа Юникода в эквивалентное 64-битовое целое число без знака.", "Documentation": "ToUInt64(Char)" }, { "Name": "ToUInt64", "Description": "При вызове этого метода всегда возникает исключение InvalidCastException.", "Documentation": "ToUInt64(DateTime)" }, { "Name": "ToUInt64", "Description": "Преобразует значение заданного десятичного числа в эквивалентное 64-битовое целое число без знака.", "Documentation": "ToUInt64(Decimal)" }, { "Name": "ToUInt64", "Description": "Преобразует значение заданного числа с плавающей запятой двойной точности в эквивалентное 64-битовое целое число без знака.", "Documentation": "ToUInt64(Double)" }, { "Name": "ToUInt64", "Description": "Преобразует значение заданного 16-битового целого числа со знаком в эквивалентное 64-битовое целое число без знака.", "Documentation": "ToUInt64(Int16)" }, { "Name": "ToUInt64", "Description": "Преобразует значение заданного 32-битового целого числа со знаком в эквивалентное 64-битовое целое число без знака.", "Documentation": "ToUInt64(Int32)" }, { "Name": "ToUInt64", "Description": "Преобразует значение заданного 64-битового целого числа со знаком в эквивалентное 64-битовое целое число без знака.", "Documentation": "ToUInt64(Int64)" }, { "Name": "ToUInt64", "Description": "Преобразует значение заданного объекта в 64-битовое целое число без знака.", "Documentation": "ToUInt64(Object)" }, { "Name": "ToUInt64", "Description": "Преобразует значение заданного объекта в эквивалентное 64-битовое целое число без знака, используя указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToUInt64(Object, IFormatProvider)" }, { "Name": "ToUInt64", "Description": "Преобразует значение заданного 8-битового целого числа со знаком в эквивалентное 64-битовое целое число без знака.", "Documentation": "ToUInt64(SByte)" }, { "Name": "ToUInt64", "Description": "Преобразует значение заданного числа с плавающей запятой одиночной точности в эквивалентное 64-битовое целое число без знака.", "Documentation": "ToUInt64(Single)" }, { "Name": "ToUInt64", "Description": "Преобразует заданное строковое представление числа в эквивалентное 64-битовое целое число без знака.", "Documentation": "ToUInt64(String)" }, { "Name": "ToUInt64", "Description": "Преобразует заданное строковое представление числа в эквивалентное 64-битовое целое число без знака, учитывая указанные сведения об особенностях форматирования, связанных с языком и региональными параметрами.", "Documentation": "ToUInt64(String, IFormatProvider)" }, { "Name": "ToUInt64", "Description": "Преобразует строковое представление числа с указанным основанием системы счисления в эквивалентное ему 64-битовое целое число без знака.", "Documentation": "ToUInt64(String, Int32)" }, { "Name": "ToUInt64", "Description": "Преобразует значение заданного 16-битового целого числа без знака в эквивалентное 64-битовое целое число без знака.", "Documentation": "ToUInt64(UInt16)" }, { "Name": "ToUInt64", "Description": "Преобразует значение заданного 32-разрядного целого числа без знака в эквивалентное 64-разрядное целое число без знака.", "Documentation": "ToUInt64(UInt32)" }, { "Name": "ToUInt64", "Description": "Возвращает заданное 64-битовое целое число без знака; фактически, преобразование не производится.", "Documentation": "ToUInt64(UInt64)" }],
	Enum: [{ "Name": "Format", "Description": "Преобразует указанное значение заданного перечислимого типа в эквивалентное строковое представление в соответствии с заданным форматом.", "Documentation": "Format(Type, Object, String)" }, { "Name": "GetName", "Description": "Возвращает имя константы с заданным значением из указанного перечисления.", "Documentation": "GetName(Type, Object)" }, { "Name": "GetNames", "Description": "Возвращает массив имен констант в указанном перечислении.", "Documentation": "GetNames(Type)" }, { "Name": "GetUnderlyingType", "Description": "Возвращает базовый тип заданного перечисления.", "Documentation": "GetUnderlyingType(Type)" }, { "Name": "GetValues", "Description": "Возвращает массив значений констант в указанном перечислении.", "Documentation": "GetValues(Type)" }, { "Name": "IsDefined", "Description": "Возвращает признак наличия константы с указанным значением в заданном перечислении.", "Documentation": "IsDefined(Type, Object)" }, { "Name": "Parse", "Description": "Преобразует строковое представление имени или числового значения одной или нескольких перечислимых констант в эквивалентный перечислимый объект.", "Documentation": "Parse(Type, String)" }, { "Name": "Parse", "Description": "Преобразует строковое представление имени или числового значения одной или нескольких перечислимых констант в эквивалентный перечислимый объект. Параметр указывает, учитывается ли в операции регистр.", "Documentation": "Parse(Type, String, Boolean)" }, { "Name": "ToObject", "Description": "Преобразует значение заданного 8-разрядного целого числа в член перечисления.", "Documentation": "ToObject(Type, Byte)" }, { "Name": "ToObject", "Description": "Преобразует значение заданного 16-разрядного знакового целого числа в член перечисления.", "Documentation": "ToObject(Type, Int16)" }, { "Name": "ToObject", "Description": "Преобразует значение заданного 32-разрядного знакового целого числа в член перечисления.", "Documentation": "ToObject(Type, Int32)" }, { "Name": "ToObject", "Description": "Преобразует значение заданного 64-разрядного знакового целого числа в член перечисления.", "Documentation": "ToObject(Type, Int64)" }, { "Name": "ToObject", "Description": "Преобразует заданный объект с целочисленным значением в член перечисления.", "Documentation": "ToObject(Type, Object)" }, { "Name": "ToObject", "Description": "Преобразует значение заданного 8-разрядного знакового целого числа в член перечисления.", "Documentation": "ToObject(Type, SByte)" }, { "Name": "ToObject", "Description": "Преобразует значение заданного 16-разрядного целого числа без знака в член перечисления.", "Documentation": "ToObject(Type, UInt16)" }, { "Name": "ToObject", "Description": "Преобразует значение заданного 32-разрядного целого числа без знака в член перечисления.", "Documentation": "ToObject(Type, UInt32)" }, { "Name": "ToObject", "Description": "Преобразует значение заданного 64-разрядного целого числа без знака в член перечисления.", "Documentation": "ToObject(Type, UInt64)" }, { "Name": "TryParse", "Description": "Преобразует строковое представление имени или числового значения одной или нескольких перечислимых констант в эквивалентный перечислимый объект. Возвращаемое значение указывает, успешно ли выполнено преобразование.", "Documentation": "TryParse<TEnum>(String, TEnum)" }, { "Name": "TryParse", "Description": "Преобразует строковое представление имени или числового значения одной или нескольких перечислимых констант в эквивалентный перечислимый объект. Параметр указывает, учитывается ли в операции регистр. Возвращаемое значение указывает, успешно ли выполнено преобразование.", "Documentation": "TryParse<TEnum>(String, Boolean, TEnum)" }],
	Math: [{ "Name": "Abs", "Description": "Возвращает абсолютное значение числа Decimal.", "Documentation": "Abs(Decimal)" }, { "Name": "Abs", "Description": "Возвращает абсолютное значение числа двойной точности с плавающей запятой.", "Documentation": "Abs(Double)" }, { "Name": "Abs", "Description": "Возвращает абсолютное значение 16-битового целого числа со знаком.", "Documentation": "Abs(Int16)" }, { "Name": "Abs", "Description": "Возвращает абсолютное значение 32-битового целого числа со знаком.", "Documentation": "Abs(Int32)" }, { "Name": "Abs", "Description": "Возвращает абсолютное значение 64-битового целого числа со знаком.", "Documentation": "Abs(Int64)" }, { "Name": "Abs", "Description": "Возвращает абсолютное значение 8-битового целого числа со знаком.", "Documentation": "Abs(SByte)" }, { "Name": "Abs", "Description": "Возвращает абсолютное значение числа одинарной точности с плавающей запятой.", "Documentation": "Abs(Single)" }, { "Name": "Acos", "Description": "Возвращает угол, косинус которого равен указанному числу.", "Documentation": "Acos(Double)" }, { "Name": "Asin", "Description": "Возвращает угол, синус которого равен указанному числу.", "Documentation": "Asin(Double)" }, { "Name": "Atan", "Description": "Возвращает угол, тангенс которого равен указанному числу.", "Documentation": "Atan(Double)" }, { "Name": "Atan2", "Description": "Возвращает угол, тангенс которого равен отношению двух указанных чисел.", "Documentation": "Atan2(Double, Double)" }, { "Name": "BigMul", "Description": "Умножает два 32-битовых числа.", "Documentation": "BigMul(Int32, Int32)" }, { "Name": "Ceiling", "Description": "Возвращает наименьшее целое число, которое больше или равно заданному десятичному числу.", "Documentation": "Ceiling(Decimal)" }, { "Name": "Ceiling", "Description": "Возвращает наименьшее целое число, которое больше или равно заданному числу с плавающей запятой двойной точности.", "Documentation": "Ceiling(Double)" }, { "Name": "Cos", "Description": "Возвращает косинус указанного угла.", "Documentation": "Cos(Double)" }, { "Name": "Cosh", "Description": "Возвращает гиперболический косинус указанного угла.", "Documentation": "Cosh(Double)" }, { "Name": "DivRem", "Description": "Вычисляет частное двух 32-битовых целых чисел со знаком и возвращает остаток в выходном параметре.", "Documentation": "DivRem(Int32, Int32, Int32)" }, { "Name": "DivRem", "Description": "Вычисляет частное двух 64-битовых целых чисел со знаком и возвращает остаток в выходном параметре.", "Documentation": "DivRem(Int64, Int64, Int64)" }, { "Name": "Exp", "Description": "Возвращает значение e, возведенное в указанную степень.", "Documentation": "Exp(Double)" }, { "Name": "Floor", "Description": "Возвращает наибольшее целое число, которое меньше или равно указанному десятичному числу.", "Documentation": "Floor(Decimal)" }, { "Name": "Floor", "Description": "Возвращает наибольшее целое число, которое меньше или равно заданному числу двойной точности с плавающей запятой.", "Documentation": "Floor(Double)" }, { "Name": "IEEERemainder", "Description": "Возвращает остаток от деления одного указанного числа на другое указанное число.", "Documentation": "IEEERemainder(Double, Double)" }, { "Name": "Log", "Description": "Возвращает натуральный логарифм (с основанием e) указанного числа.", "Documentation": "Log(Double)" }, { "Name": "Log", "Description": "Возвращает логарифм указанного числа по заданному основанию.", "Documentation": "Log(Double, Double)" }, { "Name": "Log10", "Description": "Возвращает логарифм с основанием 10 указанного числа.", "Documentation": "Log10(Double)" }, { "Name": "Max", "Description": "Возвращает большее из двух 8-битовых целых чисел без знака.", "Documentation": "Max(Byte, Byte)" }, { "Name": "Max", "Description": "Возвращает большее из двух десятичных чисел.", "Documentation": "Max(Decimal, Decimal)" }, { "Name": "Max", "Description": "Возвращает большее из двух чисел двойной точности с плавающей запятой.", "Documentation": "Max(Double, Double)" }, { "Name": "Max", "Description": "Возвращает большее из двух 16-битовых целых чисел со знаком.", "Documentation": "Max(Int16, Int16)" }, { "Name": "Max", "Description": "Возвращает большее из двух 32-битовых целых чисел со знаком.", "Documentation": "Max(Int32, Int32)" }, { "Name": "Max", "Description": "Возвращает большее из двух 64-битовых целых чисел со знаком.", "Documentation": "Max(Int64, Int64)" }, { "Name": "Max", "Description": "Возвращает большее из двух 8-битовых целых чисел со знаком.", "Documentation": "Max(SByte, SByte)" }, { "Name": "Max", "Description": "Возвращает большее из двух чисел одинарной точности с плавающей запятой.", "Documentation": "Max(Single, Single)" }, { "Name": "Max", "Description": "Возвращает большее из двух 16-битовых целых чисел без знака.", "Documentation": "Max(UInt16, UInt16)" }, { "Name": "Max", "Description": "Возвращает большее из двух 32-битовых целых чисел без знака.", "Documentation": "Max(UInt32, UInt32)" }, { "Name": "Max", "Description": "Возвращает большее из двух 64-битовых целых чисел без знака.", "Documentation": "Max(UInt64, UInt64)" }, { "Name": "Min", "Description": "Возвращает меньшее из двух 8-битовых целых чисел без знака.", "Documentation": "Min(Byte, Byte)" }, { "Name": "Min", "Description": "Возвращает меньшее из двух десятичных чисел.", "Documentation": "Min(Decimal, Decimal)" }, { "Name": "Min", "Description": "Возвращает меньшее из двух чисел двойной точности с плавающей запятой.", "Documentation": "Min(Double, Double)" }, { "Name": "Min", "Description": "Возвращает меньшее из двух 16-битовых целых чисел со знаком.", "Documentation": "Min(Int16, Int16)" }, { "Name": "Min", "Description": "Возвращает меньшее из двух 32-битовых целых чисел со знаком.", "Documentation": "Min(Int32, Int32)" }, { "Name": "Min", "Description": "Возвращает меньшее из двух 64-битовых целых чисел со знаком.", "Documentation": "Min(Int64, Int64)" }, { "Name": "Min", "Description": "Возвращает меньшее из двух 8-битовых целых чисел со знаком.", "Documentation": "Min(SByte, SByte)" }, { "Name": "Min", "Description": "Возвращает меньшее из двух чисел одинарной точности с плавающей запятой.", "Documentation": "Min(Single, Single)" }, { "Name": "Min", "Description": "Возвращает меньшее из двух 16-битовых целых чисел без знака.", "Documentation": "Min(UInt16, UInt16)" }, { "Name": "Min", "Description": "Возвращает меньшее из двух 32-битовых целых чисел без знака.", "Documentation": "Min(UInt32, UInt32)" }, { "Name": "Min", "Description": "Возвращает меньшее из двух 64-битовых целых чисел без знака.", "Documentation": "Min(UInt64, UInt64)" }, { "Name": "Pow", "Description": "Возвращает указанное число, возведенное в указанную степень.", "Documentation": "Pow(Double, Double)" }, { "Name": "Round", "Description": "Округляет десятичное значение до ближайшего целого.", "Documentation": "Round(Decimal)" }, { "Name": "Round", "Description": "Округляет десятичное значение до указанного числа дробных разрядов.", "Documentation": "Round(Decimal, Int32)" }, { "Name": "Round", "Description": "Округляет десятичное значение до указанного числа дробных разрядов. Параметр задает правило округления значения, если оно находится ровно посредине между двумя числами.", "Documentation": "Round(Decimal, Int32, MidpointRounding)" }, { "Name": "Round", "Description": "Округляет десятичное значение до ближайшего целого. Параметр задает правило округления значения, если оно находится ровно посредине между двумя числами.", "Documentation": "Round(Decimal, MidpointRounding)" }, { "Name": "Round", "Description": "Округляет заданное число с плавающей запятой двойной точности до ближайшего целого.", "Documentation": "Round(Double)" }, { "Name": "Round", "Description": "Округляет значение двойной точности с плавающей запятой до заданного количества дробных разрядов.", "Documentation": "Round(Double, Int32)" }, { "Name": "Round", "Description": "Округляет значение двойной точности с плавающей запятой до заданного количества дробных разрядов. Параметр задает правило округления значения, если оно находится ровно посредине между двумя числами.", "Documentation": "Round(Double, Int32, MidpointRounding)" }, { "Name": "Round", "Description": "Округляет заданное значение число двойной точности с плавающей запятой до ближайшего целого. Параметр задает правило округления значения, если оно находится ровно посредине между двумя числами.", "Documentation": "Round(Double, MidpointRounding)" }, { "Name": "Sign", "Description": "Возвращает целое число, указывающее знак десятичного числа.", "Documentation": "Sign(Decimal)" }, { "Name": "Sign", "Description": "Возвращает целое число, обозначающее знак числа двойной точности с плавающей запятой.", "Documentation": "Sign(Double)" }, { "Name": "Sign", "Description": "Возвращает целое число, указывающее знак 16-разрядного целого числа со знаком.", "Documentation": "Sign(Int16)" }, { "Name": "Sign", "Description": "Возвращает целое число, указывающее знак 32-разрядного целого числа со знаком.", "Documentation": "Sign(Int32)" }, { "Name": "Sign", "Description": "Возвращает целое число, указывающее знак 64-разрядного целого числа со знаком.", "Documentation": "Sign(Int64)" }, { "Name": "Sign", "Description": "Возвращает целое число, указывающее знак 8-разрядного целого числа со знаком.", "Documentation": "Sign(SByte)" }, { "Name": "Sign", "Description": "Возвращает целое число, обозначающее знак числа с плавающей запятой одиночной точности.", "Documentation": "Sign(Single)" }, { "Name": "Sin", "Description": "Возвращает синус указанного угла.", "Documentation": "Sin(Double)" }, { "Name": "Sinh", "Description": "Возвращает гиперболический синус указанного угла.", "Documentation": "Sinh(Double)" }, { "Name": "Sqrt", "Description": "Возвращает квадратный корень из указанного числа.", "Documentation": "Sqrt(Double)" }, { "Name": "Tan", "Description": "Возвращает тангенс указанного угла.", "Documentation": "Tan(Double)" }, { "Name": "Tanh", "Description": "Возвращает гиперболический тангенс указанного угла.", "Documentation": "Tanh(Double)" }, { "Name": "Truncate", "Description": "Вычисляет целую часть заданного десятичного числа.", "Documentation": "Truncate(Decimal)" }, { "Name": "Truncate", "Description": "Вычисляет целую часть заданного числа двойной точности с плавающей запятой.", "Documentation": "Truncate(Double)" }],
	Object: [{ "Name": "Equals", "Description": "Определяет, следует ли считать равными указанные экземпляры объектов.", "Documentation": "Equals(Object, Object)" }, { "Name": "ReferenceEquals", "Description": "Определяет, совпадают ли указанные экземпляры Object.", "Documentation": "ReferenceEquals(Object, Object)" }],
	Double: [{ "Name": "IsInfinity", "Description": "Возвращает значение, позволяющее определить, равно ли данное число плюс или минус бесконечности. ", "Documentation": "IsInfinity(Double)" }, { "Name": "IsNaN", "Description": "Возвращает значение, показывающее, что указанное значение не является числом (NaN).", "Documentation": "IsNaN(Double)" }, { "Name": "IsNegativeInfinity", "Description": "Возвращает значение, позволяющее определить, равно ли данное число минус бесконечности.", "Documentation": "IsNegativeInfinity(Double)" }, { "Name": "IsPositiveInfinity", "Description": "Возвращает значение, показывающее, равно ли данное число плюс бесконечности.", "Documentation": "IsPositiveInfinity(Double)" }, { "Name": "Parse", "Description": "Преобразует строковое представление числа в эквивалентное ему число двойной точности с плавающей запятой.", "Documentation": "Parse(String)" }, { "Name": "Parse", "Description": "Преобразует строковое представление числа, выраженное в заданном формате, связанном с языком и региональными параметрами, в эквивалентное ему число двойной точности с плавающей запятой.", "Documentation": "Parse(String, IFormatProvider)" }, { "Name": "Parse", "Description": "Преобразует строковое представление числа указанного стиля в эквивалентное ему число двойной точности с плавающей запятой.", "Documentation": "Parse(String, NumberStyles)" }, { "Name": "Parse", "Description": "Преобразует строковое представление числа указанного стиля, выраженное в формате, соответствующем определенному языку и региональным параметрам, в эквивалентное ему число двойной точности с плавающей запятой.", "Documentation": "Parse(String, NumberStyles, IFormatProvider)" }, { "Name": "TryParse", "Description": "Преобразует строковое представление числа в эквивалентное ему число двойной точности с плавающей запятой. Возвращает значение, указывающее, успешно ли выполнено преобразование.", "Documentation": "TryParse(String, Double)" }, { "Name": "TryParse", "Description": "Преобразует строковое представление числа указанного стиля, выраженное в формате, соответствующем определенному языку и региональным параметрам, в эквивалентное ему число двойной точности с плавающей запятой. Возвращает значение, указывающее, успешно ли выполнено преобразование.", "Documentation": "TryParse(String, NumberStyles, IFormatProvider, Double)" }],
	Enumerable: [{ "Name": "Aggregate", "Description": "Применяет к последовательности агрегатную функцию.", "Documentation": "Aggregate<TSource>(IEnumerable<TSource>, Func<TSource, TSource, TSource>)" }, { "Name": "Aggregate", "Description": "Применяет к последовательности агрегатную функцию. Указанное начальное значение используется в качестве исходного значения агрегатной операции.", "Documentation": "Aggregate<TSource, TAccumulate>(IEnumerable<TSource>, TAccumulate, Func<TAccumulate, TSource, TAccumulate>)" }, { "Name": "Aggregate", "Description": "Применяет к последовательности агрегатную функцию. Указанное начальное значение служит исходным значением для агрегатной операции, а указанная функция используется для выбора результирующего значения.", "Documentation": "Aggregate<TSource, TAccumulate, TResult>(IEnumerable<TSource>, TAccumulate, Func<TAccumulate, TSource, TAccumulate>, Func<TAccumulate, TResult>)" }, { "Name": "All", "Description": "Определяет, удовлетворяют ли условию ВСЕ элементы последовательности .", "Documentation": "All<TSource>(IEnumerable<TSource>, Func<TSource, Boolean>)" }, { "Name": "Any", "Description": "Определяет, содержит ли последовательность какие-либо элементы.", "Documentation": "Any<TSource>(IEnumerable<TSource>)" }, { "Name": "Any", "Description": "Определяет, удовлетворяет ли какой-либо элемент последовательности условию.", "Documentation": "Any<TSource>(IEnumerable<TSource>, Func<TSource, Boolean>)" }, { "Name": "AsEnumerable", "Description": "Возвращает входные данные, типизированного как IEnumerable<T>.", "Documentation": "AsEnumerable<TSource>(IEnumerable<TSource>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности Decimal значения.", "Documentation": "Average(IEnumerable<Decimal>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности Double значения.", "Documentation": "Average(IEnumerable<Double>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности Int32 значения.", "Documentation": "Average(IEnumerable<Int32>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности Int64 значения.", "Documentation": "Average(IEnumerable<Int64>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности nullable Decimal значения.", "Documentation": "Average(IEnumerable<Nullable<Decimal>>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности nullable Double значения.", "Documentation": "Average(IEnumerable<Nullable<Double>>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности Int32, допускающей значение null.", "Documentation": "Average(IEnumerable<Nullable<Int32>>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности nullable Int64 значения.", "Documentation": "Average(IEnumerable<Nullable<Int64>>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности nullable Single значения.", "Documentation": "Average(IEnumerable<Nullable<Single>>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности Single значения.", "Documentation": "Average(IEnumerable<Single>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности Decimal значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Average<TSource>(IEnumerable<TSource>, Func<TSource, Decimal>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности Double значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Average<TSource>(IEnumerable<TSource>, Func<TSource, Double>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности Int32 значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Average<TSource>(IEnumerable<TSource>, Func<TSource, Int32>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности Int64 значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Average<TSource>(IEnumerable<TSource>, Func<TSource, Int64>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности nullable Decimal значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Average<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Decimal>>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности nullable Double значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Average<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Double>>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности nullable Int32 значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Average<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Int32>>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности nullable Int64 значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Average<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Int64>>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности nullable Single значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Average<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Single>>)" }, { "Name": "Average", "Description": "Вычисляет среднее для последовательности Single значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Average<TSource>(IEnumerable<TSource>, Func<TSource, Single>)" }, { "Name": "Cast", "Description": "Приводит элементы IEnumerable для указанного типа.", "Documentation": "Cast<TResult>(IEnumerable)" }, { "Name": "Concat", "Description": "Объединяет две последовательности.", "Documentation": "Concat<TSource>(IEnumerable<TSource>, IEnumerable<TSource>)" }, { "Name": "Contains", "Description": "Определяет, содержит ли последовательность указанный элемент, используя компаратор проверки на равенство по умолчанию.", "Documentation": "Contains<TSource>(IEnumerable<TSource>, TSource)" }, { "Name": "Contains", "Description": "Определяет, содержит ли последовательность указанный элемент, используя указанный IEqualityComparer<T>.", "Documentation": "Contains<TSource>(IEnumerable<TSource>, TSource, IEqualityComparer<TSource>)" }, { "Name": "Count", "Description": "Возвращает количество элементов в последовательности.", "Documentation": "Count<TSource>(IEnumerable<TSource>)" }, { "Name": "Count", "Description": "Возвращает число, представляющее количество элементов в указанной последовательности удовлетворяют условию.", "Documentation": "Count<TSource>(IEnumerable<TSource>, Func<TSource, Boolean>)" }, { "Name": "DefaultIfEmpty", "Description": "Возвращает элементы указанной последовательности или значение по умолчанию параметра типа одноэлементную коллекцию, если последовательность пуста.", "Documentation": "DefaultIfEmpty<TSource>(IEnumerable<TSource>)" }, { "Name": "DefaultIfEmpty", "Description": "Возвращает элементы указанной последовательности или значение заданного одноэлементную коллекцию, если последовательность пуста.", "Documentation": "DefaultIfEmpty<TSource>(IEnumerable<TSource>, TSource)" }, { "Name": "Distinct", "Description": "Возвращает различающиеся элементы последовательности, используя для сравнения значений компаратор проверки на равенство по умолчанию.", "Documentation": "Distinct<TSource>(IEnumerable<TSource>)" }, { "Name": "Distinct", "Description": "Возвращает различающиеся элементы последовательности, используя указанную IEqualityComparer<T> для сравнения значений.", "Documentation": "Distinct<TSource>(IEnumerable<TSource>, IEqualityComparer<TSource>)" }, { "Name": "ElementAt", "Description": "Возвращает элемент по указанному индексу в последовательности.", "Documentation": "ElementAt<TSource>(IEnumerable<TSource>, Int32)" }, { "Name": "ElementAtOrDefault", "Description": "Возвращает элемент последовательности по указанному индексу или значение по умолчанию, если индекс вне допустимого диапазона.", "Documentation": "ElementAtOrDefault<TSource>(IEnumerable<TSource>, Int32)" }, { "Name": "Empty", "Description": "Возвращает пустую коллекцию IEnumerable<T> с указанным аргументом типа.", "Documentation": "Empty<TResult>()" }, { "Name": "Except", "Description": "Находит разность двух последовательностей, используя для сравнения значений компаратор проверки на равенство по умолчанию.", "Documentation": "Except<TSource>(IEnumerable<TSource>, IEnumerable<TSource>)" }, { "Name": "Except", "Description": "Находит разность двух последовательностей с помощью заданного IEqualityComparer<T> для сравнения значений.", "Documentation": "Except<TSource>(IEnumerable<TSource>, IEnumerable<TSource>, IEqualityComparer<TSource>)" }, { "Name": "First", "Description": "Возвращает первый элемент последовательности.", "Documentation": "First<TSource>(IEnumerable<TSource>)" }, { "Name": "First", "Description": "Возвращает первый элемент последовательности, удовлетворяющий указанному условию.", "Documentation": "First<TSource>(IEnumerable<TSource>, Func<TSource, Boolean>)" }, { "Name": "FirstOrDefault", "Description": "Возвращает первый элемент последовательности или значение по умолчанию, если последовательность не содержит элементов.", "Documentation": "FirstOrDefault<TSource>(IEnumerable<TSource>)" }, { "Name": "FirstOrDefault", "Description": "Возвращает первый элемент последовательности, удовлетворяющий указанному условию, или значение по умолчанию, если ни одного такого элемента не найдено.", "Documentation": "FirstOrDefault<TSource>(IEnumerable<TSource>, Func<TSource, Boolean>)" }, { "Name": "GroupBy", "Description": "Группирует элементы последовательности в соответствии с заданной функцией селектора ключа.", "Documentation": "GroupBy<TSource, TKey>(IEnumerable<TSource>, Func<TSource, TKey>)" }, { "Name": "GroupBy", "Description": "Группирует элементы последовательности в соответствии с заданной функцией селектора ключа и сравнивает ключи с помощью указанного компаратора.", "Documentation": "GroupBy<TSource, TKey>(IEnumerable<TSource>, Func<TSource, TKey>, IEqualityComparer<TKey>)" }, { "Name": "GroupBy", "Description": "Группирует элементы последовательности в соответствии с заданной функцией селектора ключа и проецирует элементы каждой группы с помощью указанной функции.", "Documentation": "GroupBy<TSource, TKey, TElement>(IEnumerable<TSource>, Func<TSource, TKey>, Func<TSource, TElement>)" }, { "Name": "GroupBy", "Description": "Группирует элементы последовательности в соответствии с функцией селектора ключа. Ключи сравниваются с помощью компаратора, элементы каждой группы проецируются с помощью указанной функции.", "Documentation": "GroupBy<TSource, TKey, TElement>(IEnumerable<TSource>, Func<TSource, TKey>, Func<TSource, TElement>, IEqualityComparer<TKey>)" }, { "Name": "GroupBy", "Description": "Группирует элементы последовательности в соответствии с заданной функцией селектора ключа и создает результирующее значение для каждой группы и ее ключа.", "Documentation": "GroupBy<TSource, TKey, TResult>(IEnumerable<TSource>, Func<TSource, TKey>, Func<TKey, IEnumerable<TSource>, TResult>)" }, { "Name": "GroupBy", "Description": "Группирует элементы последовательности в соответствии с заданной функцией селектора ключа и создает результирующее значение для каждой группы и ее ключа. Ключи сравниваются с использованием заданного компаратора.", "Documentation": "GroupBy<TSource, TKey, TResult>(IEnumerable<TSource>, Func<TSource, TKey>, Func<TKey, IEnumerable<TSource>, TResult>, IEqualityComparer<TKey>)" }, { "Name": "GroupBy", "Description": "Группирует элементы последовательности в соответствии с заданной функцией селектора ключа и создает результирующее значение для каждой группы и ее ключа. Элементы каждой группы проецируются с помощью указанной функции.", "Documentation": "GroupBy<TSource, TKey, TElement, TResult>(IEnumerable<TSource>, Func<TSource, TKey>, Func<TSource, TElement>, Func<TKey, IEnumerable<TElement>, TResult>)" }, { "Name": "GroupBy", "Description": "Группирует элементы последовательности в соответствии с заданной функцией селектора ключа и создает результирующее значение для каждой группы и ее ключа. Значения ключей сравниваются с помощью указанного компаратора, элементы каждой группы проецируются с помощью указанной функции.", "Documentation": "GroupBy<TSource, TKey, TElement, TResult>(IEnumerable<TSource>, Func<TSource, TKey>, Func<TSource, TElement>, Func<TKey, IEnumerable<TElement>, TResult>, IEqualityComparer<TKey>)" }, { "Name": "GroupJoin", "Description": "Устанавливает корреляцию между элементами двух последовательностей на основе равенства ключей и группирует результаты. Для сравнения ключей используется компаратор проверки на равенство по умолчанию.", "Documentation": "GroupJoin<TOuter, TInner, TKey, TResult>(IEnumerable<TOuter>, IEnumerable<TInner>, Func<TOuter, TKey>, Func<TInner, TKey>, Func<TOuter, IEnumerable<TInner>, TResult>)" }, { "Name": "GroupJoin", "Description": "Устанавливает корреляцию между элементами двух последовательностей на основе равенства ключа и группирует результаты. Указанный IEqualityComparer<T> используется для сравнения ключей.", "Documentation": "GroupJoin<TOuter, TInner, TKey, TResult>(IEnumerable<TOuter>, IEnumerable<TInner>, Func<TOuter, TKey>, Func<TInner, TKey>, Func<TOuter, IEnumerable<TInner>, TResult>, IEqualityComparer<TKey>)" }, { "Name": "Intersect", "Description": "Находит пересечение двух последовательностей, используя для сравнения значений компаратор проверки на равенство по умолчанию.", "Documentation": "Intersect<TSource>(IEnumerable<TSource>, IEnumerable<TSource>)" }, { "Name": "Intersect", "Description": "Находит пересечение двух последовательностей с помощью заданного IEqualityComparer<T> для сравнения значений.", "Documentation": "Intersect<TSource>(IEnumerable<TSource>, IEnumerable<TSource>, IEqualityComparer<TSource>)" }, { "Name": "Join", "Description": "Устанавливает корреляцию между элементами двух последовательностей на основе сопоставления ключей. Для сравнения ключей используется компаратор проверки на равенство по умолчанию.", "Documentation": "Join<TOuter, TInner, TKey, TResult>(IEnumerable<TOuter>, IEnumerable<TInner>, Func<TOuter, TKey>, Func<TInner, TKey>, Func<TOuter, TInner, TResult>)" }, { "Name": "Join", "Description": "Устанавливает корреляцию между элементами двух последовательностей на основе сопоставления ключей. Указанный IEqualityComparer<T> используется для сравнения ключей.", "Documentation": "Join<TOuter, TInner, TKey, TResult>(IEnumerable<TOuter>, IEnumerable<TInner>, Func<TOuter, TKey>, Func<TInner, TKey>, Func<TOuter, TInner, TResult>, IEqualityComparer<TKey>)" }, { "Name": "Last", "Description": "Возвращает последний элемент последовательности.", "Documentation": "Last<TSource>(IEnumerable<TSource>)" }, { "Name": "Last", "Description": "Возвращает последний элемент последовательности, удовлетворяющий указанному условию.", "Documentation": "Last<TSource>(IEnumerable<TSource>, Func<TSource, Boolean>)" }, { "Name": "LastOrDefault", "Description": "Возвращает последний элемент последовательности или значение по умолчанию, если последовательность не содержит элементов.", "Documentation": "LastOrDefault<TSource>(IEnumerable<TSource>)" }, { "Name": "LastOrDefault", "Description": "Возвращает последний элемент последовательности, удовлетворяющий указанному условию, или значение по умолчанию, если ни одного такого элемента не найдено.", "Documentation": "LastOrDefault<TSource>(IEnumerable<TSource>, Func<TSource, Boolean>)" }, { "Name": "LongCount", "Description": "Возвращает Int64 , представляет собой общее число элементов в последовательности.", "Documentation": "LongCount<TSource>(IEnumerable<TSource>)" }, { "Name": "LongCount", "Description": "Возвращает Int64 представляющий количество элементов в последовательности удовлетворяют условию.", "Documentation": "LongCount<TSource>(IEnumerable<TSource>, Func<TSource, Boolean>)" }, { "Name": "Max", "Description": "Возвращает максимальное значение в последовательности Decimal значения.", "Documentation": "Max(IEnumerable<Decimal>)" }, { "Name": "Max", "Description": "Возвращает максимальное значение в последовательности Double значения.", "Documentation": "Max(IEnumerable<Double>)" }, { "Name": "Max", "Description": "Возвращает максимальное значение в последовательности Int32 значения.", "Documentation": "Max(IEnumerable<Int32>)" }, { "Name": "Max", "Description": "Возвращает максимальное значение в последовательности Int64 значения.", "Documentation": "Max(IEnumerable<Int64>)" }, { "Name": "Max", "Description": "Возвращает максимальное значение в последовательности nullable Decimal значения.", "Documentation": "Max(IEnumerable<Nullable<Decimal>>)" }, { "Name": "Max", "Description": "Возвращает максимальное значение в последовательности nullable Double значения.", "Documentation": "Max(IEnumerable<Nullable<Double>>)" }, { "Name": "Max", "Description": "Возвращает максимальное значение в последовательности nullable Int32 значения.", "Documentation": "Max(IEnumerable<Nullable<Int32>>)" }, { "Name": "Max", "Description": "Возвращает максимальное значение в последовательности nullable Int64 значения.", "Documentation": "Max(IEnumerable<Nullable<Int64>>)" }, { "Name": "Max", "Description": "Возвращает максимальное значение в последовательности nullable Single значения.", "Documentation": "Max(IEnumerable<Nullable<Single>>)" }, { "Name": "Max", "Description": "Возвращает максимальное значение в последовательности Single значения.", "Documentation": "Max(IEnumerable<Single>)" }, { "Name": "Max", "Description": "Возвращает максимальное значение, содержащееся в универсальной последовательности.", "Documentation": "Max<TSource>(IEnumerable<TSource>)" }, { "Name": "Max", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает максимальное Decimal значение.", "Documentation": "Max<TSource>(IEnumerable<TSource>, Func<TSource, Decimal>)" }, { "Name": "Max", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает максимальное Double значение.", "Documentation": "Max<TSource>(IEnumerable<TSource>, Func<TSource, Double>)" }, { "Name": "Max", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает максимальное Int32 значение.", "Documentation": "Max<TSource>(IEnumerable<TSource>, Func<TSource, Int32>)" }, { "Name": "Max", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает максимальное Int64 значение.", "Documentation": "Max<TSource>(IEnumerable<TSource>, Func<TSource, Int64>)" }, { "Name": "Max", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает максимальное значение NULL Decimal значение.", "Documentation": "Max<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Decimal>>)" }, { "Name": "Max", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает максимальное значение NULL Double значение.", "Documentation": "Max<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Double>>)" }, { "Name": "Max", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает максимальное значение NULL Int32 значение.", "Documentation": "Max<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Int32>>)" }, { "Name": "Max", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает максимальное значение NULL Int64 значение.", "Documentation": "Max<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Int64>>)" }, { "Name": "Max", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает максимальное значение NULL Single значение.", "Documentation": "Max<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Single>>)" }, { "Name": "Max", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает максимальное Single значение.", "Documentation": "Max<TSource>(IEnumerable<TSource>, Func<TSource, Single>)" }, { "Name": "Max", "Description": "Вызывает функцию преобразования для каждого элемента универсальной последовательности и возвращает максимальное результирующее значение.", "Documentation": "Max<TSource, TResult>(IEnumerable<TSource>, Func<TSource, TResult>)" }, { "Name": "Min", "Description": "Возвращает минимальное значение в последовательности Decimal значения.", "Documentation": "Min(IEnumerable<Decimal>)" }, { "Name": "Min", "Description": "Возвращает минимальное значение в последовательности Double значения.", "Documentation": "Min(IEnumerable<Double>)" }, { "Name": "Min", "Description": "Возвращает минимальное значение в последовательности Int32 значения.", "Documentation": "Min(IEnumerable<Int32>)" }, { "Name": "Min", "Description": "Возвращает минимальное значение в последовательности Int64 значения.", "Documentation": "Min(IEnumerable<Int64>)" }, { "Name": "Min", "Description": "Возвращает минимальное значение в последовательности nullable Decimal значения.", "Documentation": "Min(IEnumerable<Nullable<Decimal>>)" }, { "Name": "Min", "Description": "Возвращает минимальное значение в последовательности nullable Double значения.", "Documentation": "Min(IEnumerable<Nullable<Double>>)" }, { "Name": "Min", "Description": "Возвращает минимальное значение в последовательности nullable Int32 значения.", "Documentation": "Min(IEnumerable<Nullable<Int32>>)" }, { "Name": "Min", "Description": "Возвращает минимальное значение в последовательности nullable Int64 значения.", "Documentation": "Min(IEnumerable<Nullable<Int64>>)" }, { "Name": "Min", "Description": "Возвращает минимальное значение в последовательности nullable Single значения.", "Documentation": "Min(IEnumerable<Nullable<Single>>)" }, { "Name": "Min", "Description": "Возвращает минимальное значение в последовательности Single значения.", "Documentation": "Min(IEnumerable<Single>)" }, { "Name": "Min", "Description": "Возвращает минимальное значение, содержащееся в универсальной последовательности.", "Documentation": "Min<TSource>(IEnumerable<TSource>)" }, { "Name": "Min", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает минимальное Decimal значение.", "Documentation": "Min<TSource>(IEnumerable<TSource>, Func<TSource, Decimal>)" }, { "Name": "Min", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает минимальное Double значение.", "Documentation": "Min<TSource>(IEnumerable<TSource>, Func<TSource, Double>)" }, { "Name": "Min", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает минимальное Int32 значение.", "Documentation": "Min<TSource>(IEnumerable<TSource>, Func<TSource, Int32>)" }, { "Name": "Min", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает минимальное Int64 значение.", "Documentation": "Min<TSource>(IEnumerable<TSource>, Func<TSource, Int64>)" }, { "Name": "Min", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает минимальное значение NULL Decimal значение.", "Documentation": "Min<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Decimal>>)" }, { "Name": "Min", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает минимальное значение NULL Double значение.", "Documentation": "Min<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Double>>)" }, { "Name": "Min", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает минимальное значение NULL Int32 значение.", "Documentation": "Min<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Int32>>)" }, { "Name": "Min", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает минимальное значение NULL Int64 значение.", "Documentation": "Min<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Int64>>)" }, { "Name": "Min", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает минимальное значение NULL Single значение.", "Documentation": "Min<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Single>>)" }, { "Name": "Min", "Description": "Вызывает функцию преобразования для каждого элемента последовательности и возвращает минимальное Single значение.", "Documentation": "Min<TSource>(IEnumerable<TSource>, Func<TSource, Single>)" }, { "Name": "Min", "Description": "Вызывает функцию преобразования для каждого элемента универсальной последовательности и возвращает минимальное результирующее значение.", "Documentation": "Min<TSource, TResult>(IEnumerable<TSource>, Func<TSource, TResult>)" }, { "Name": "OfType", "Description": "Фильтрует элементы IEnumerable на основе указанного типа.", "Documentation": "OfType<TResult>(IEnumerable)" }, { "Name": "OrderBy", "Description": "Сортирует элементы последовательности в возрастающем порядке по ключу.", "Documentation": "OrderBy<TSource, TKey>(IEnumerable<TSource>, Func<TSource, TKey>)" }, { "Name": "OrderBy", "Description": "Сортирует элементы последовательности в порядке возрастания с использованием указанного компаратора.", "Documentation": "OrderBy<TSource, TKey>(IEnumerable<TSource>, Func<TSource, TKey>, IComparer<TKey>)" }, { "Name": "OrderByDescending", "Description": "Сортирует элементы последовательности в порядке убывания ключа.", "Documentation": "OrderByDescending<TSource, TKey>(IEnumerable<TSource>, Func<TSource, TKey>)" }, { "Name": "OrderByDescending", "Description": "Сортирует элементы последовательности в порядке убывания с использованием указанного компаратора.", "Documentation": "OrderByDescending<TSource, TKey>(IEnumerable<TSource>, Func<TSource, TKey>, IComparer<TKey>)" }, { "Name": "Range", "Description": "Создает последовательность целых чисел в указанном диапазоне.", "Documentation": "Range(Int32, Int32)" }, { "Name": "Repeat", "Description": "Создает последовательность, содержащую одно повторяющееся значение.", "Documentation": "Repeat<TResult>(TResult, Int32)" }, { "Name": "Reverse", "Description": "Изменяет порядок элементов в последовательности.", "Documentation": "Reverse<TSource>(IEnumerable<TSource>)" }, { "Name": "Select", "Description": "Проецирует каждый элемент последовательности в новую форму.", "Documentation": "Select<TSource, TResult>(IEnumerable<TSource>, Func<TSource, TResult>)" }, { "Name": "Select", "Description": "Проецирует каждый элемент последовательности в новую форму, добавляя индекс элемента.", "Documentation": "Select<TSource, TResult>(IEnumerable<TSource>, Func<TSource, Int32, TResult>)" }, { "Name": "SelectMany", "Description": "Проецирует каждый элемент последовательности в IEnumerable<T> и объединяет результирующие последовательности в одну последовательность.", "Documentation": "SelectMany<TSource, TResult>(IEnumerable<TSource>, Func<TSource, IEnumerable<TResult>>)" }, { "Name": "SelectMany", "Description": "Проецирует каждый элемент последовательности в IEnumerable<T>, и объединяет результирующие последовательности в одну последовательность. Индекс каждого элемента исходной последовательности используется в проецированной форме этого элемента.", "Documentation": "SelectMany<TSource, TResult>(IEnumerable<TSource>, Func<TSource, Int32, IEnumerable<TResult>>)" }, { "Name": "SelectMany", "Description": "Проецирует каждый элемент последовательности в IEnumerable<T>, объединяет результирующие последовательности в одну и вызывает функцию селектора результата для каждого элемента этой последовательности.", "Documentation": "SelectMany<TSource, TCollection, TResult>(IEnumerable<TSource>, Func<TSource, IEnumerable<TCollection>>, Func<TSource, TCollection, TResult>)" }, { "Name": "SelectMany", "Description": "Проецирует каждый элемент последовательности в IEnumerable<T>, объединяет результирующие последовательности в одну и вызывает функцию селектора результата для каждого элемента этой последовательности. Индекс каждого элемента исходной последовательности используется в промежуточной проецированной форме этого элемента.", "Documentation": "SelectMany<TSource, TCollection, TResult>(IEnumerable<TSource>, Func<TSource, Int32, IEnumerable<TCollection>>, Func<TSource, TCollection, TResult>)" }, { "Name": "SequenceEqual", "Description": "Определяет, совпадают ли две последовательности, сравнивая элементы, используя компаратор проверки на равенство по умолчанию для их типа.", "Documentation": "SequenceEqual<TSource>(IEnumerable<TSource>, IEnumerable<TSource>)" }, { "Name": "SequenceEqual", "Description": "Определяет, равны ли две последовательности, сравнивая их элементы с помощью указанного IEqualityComparer<T>.", "Documentation": "SequenceEqual<TSource>(IEnumerable<TSource>, IEnumerable<TSource>, IEqualityComparer<TSource>)" }, { "Name": "Single", "Description": "Возвращает единственный элемент последовательности и вызывает исключение, если число элементов последовательности отлично от одного.", "Documentation": "Single<TSource>(IEnumerable<TSource>)" }, { "Name": "Single", "Description": "Возвращает единственный элемент последовательности, удовлетворяющий указанному условию, и вызывает исключение, если таких элементов больше одного.", "Documentation": "Single<TSource>(IEnumerable<TSource>, Func<TSource, Boolean>)" }, { "Name": "SingleOrDefault", "Description": "Возвращает единственный элемент последовательности или значение по умолчанию, если последовательность пуста; Этот метод создает исключение, если в последовательности более одного элемента.", "Documentation": "SingleOrDefault<TSource>(IEnumerable<TSource>)" }, { "Name": "SingleOrDefault", "Description": "Возвращает единственный элемент последовательности, удовлетворяющий указанному условию, или значение по умолчанию, если такого элемента не существует; если условию удовлетворяет более одного элемента, вызывается исключение.", "Documentation": "SingleOrDefault<TSource>(IEnumerable<TSource>, Func<TSource, Boolean>)" }, { "Name": "Skip", "Description": "Пропускает заданное число элементов в последовательности и возвращает остальные элементы.", "Documentation": "Skip<TSource>(IEnumerable<TSource>, Int32)" }, { "Name": "SkipWhile", "Description": "Пропускает элементы в последовательности, пока заданное условие истинно и затем возвращает оставшиеся элементы.", "Documentation": "SkipWhile<TSource>(IEnumerable<TSource>, Func<TSource, Boolean>)" }, { "Name": "SkipWhile", "Description": "Пропускает элементы в последовательности, пока заданное условие истинно и затем возвращает оставшиеся элементы. Индекс элемента используется в логике функции предиката.", "Documentation": "SkipWhile<TSource>(IEnumerable<TSource>, Func<TSource, Int32, Boolean>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности Decimal значения.", "Documentation": "Sum(IEnumerable<Decimal>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности Double значения.", "Documentation": "Sum(IEnumerable<Double>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности Int32 значения.", "Documentation": "Sum(IEnumerable<Int32>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности Int64 значения.", "Documentation": "Sum(IEnumerable<Int64>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности nullable Decimal значения.", "Documentation": "Sum(IEnumerable<Nullable<Decimal>>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности nullable Double значения.", "Documentation": "Sum(IEnumerable<Nullable<Double>>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности nullable Int32 значения.", "Documentation": "Sum(IEnumerable<Nullable<Int32>>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности nullable Int64 значения.", "Documentation": "Sum(IEnumerable<Nullable<Int64>>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности nullable Single значения.", "Documentation": "Sum(IEnumerable<Nullable<Single>>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности Single значения.", "Documentation": "Sum(IEnumerable<Single>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности Decimal значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Sum<TSource>(IEnumerable<TSource>, Func<TSource, Decimal>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности Double значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Sum<TSource>(IEnumerable<TSource>, Func<TSource, Double>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности Int32 значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Sum<TSource>(IEnumerable<TSource>, Func<TSource, Int32>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности Int64 значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Sum<TSource>(IEnumerable<TSource>, Func<TSource, Int64>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности nullable Decimal значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Sum<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Decimal>>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности nullable Double значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Sum<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Double>>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности nullable Int32 значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Sum<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Int32>>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности nullable Int64 значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Sum<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Int64>>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности nullable Single значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Sum<TSource>(IEnumerable<TSource>, Func<TSource, Nullable<Single>>)" }, { "Name": "Sum", "Description": "Вычисляет сумму последовательности Single значений, получаемой в результате применения функции преобразования к каждому элементу входной последовательности.", "Documentation": "Sum<TSource>(IEnumerable<TSource>, Func<TSource, Single>)" }, { "Name": "Take", "Description": "Возвращает заданное число смежных элементов с начала последовательности.", "Documentation": "Take<TSource>(IEnumerable<TSource>, Int32)" }, { "Name": "TakeWhile", "Description": "Возвращает цепочку элементов последовательности, до тех пор, пока условие истинно.", "Documentation": "TakeWhile<TSource>(IEnumerable<TSource>, Func<TSource, Boolean>)" }, { "Name": "TakeWhile", "Description": "Возвращает цепочку элементов последовательности, до тех пор, пока условие истинно.Индекс элемента используется в логике функции предиката.", "Documentation": "TakeWhile<TSource>(IEnumerable<TSource>, Func<TSource, Int32, Boolean>)" }, { "Name": "ThenBy", "Description": "Выполняет дополнительное упорядочение элементов последовательности в порядке по возрастанию по ключу.", "Documentation": "ThenBy<TSource, TKey>(IOrderedEnumerable<TSource>, Func<TSource, TKey>)" }, { "Name": "ThenBy", "Description": "Выполняет дополнительное упорядочение элементов последовательности в порядке возрастания с использованием указанного компаратора.", "Documentation": "ThenBy<TSource, TKey>(IOrderedEnumerable<TSource>, Func<TSource, TKey>, IComparer<TKey>)" }, { "Name": "ThenByDescending", "Description": "Выполняет дополнительное упорядочение элементов последовательности в порядке убывания ключа.", "Documentation": "ThenByDescending<TSource, TKey>(IOrderedEnumerable<TSource>, Func<TSource, TKey>)" }, { "Name": "ThenByDescending", "Description": "Выполняет дополнительное упорядочение элементов последовательности в порядке убывания с использованием указанного компаратора.", "Documentation": "ThenByDescending<TSource, TKey>(IOrderedEnumerable<TSource>, Func<TSource, TKey>, IComparer<TKey>)" }, { "Name": "ToArray", "Description": "Создает массив из IEnumerable<T>.", "Documentation": "ToArray<TSource>(IEnumerable<TSource>)" }, { "Name": "ToDictionary", "Description": "Создает Dictionary<TKey, TValue> из IEnumerable<T> в соответствии с заданной функцией селектора ключа.", "Documentation": "ToDictionary<TSource, TKey>(IEnumerable<TSource>, Func<TSource, TKey>)" }, { "Name": "ToDictionary", "Description": "Создает Dictionary<TKey, TValue> из IEnumerable<T> в соответствии с указанной функцией выбора ключа функции и компаратором ключей.", "Documentation": "ToDictionary<TSource, TKey>(IEnumerable<TSource>, Func<TSource, TKey>, IEqualityComparer<TKey>)" }, { "Name": "ToDictionary", "Description": "Создает Dictionary<TKey, TValue> из IEnumerable<T> в соответствии с указанной функцией выбора ключа и функции селектора элемента.", "Documentation": "ToDictionary<TSource, TKey, TElement>(IEnumerable<TSource>, Func<TSource, TKey>, Func<TSource, TElement>)" }, { "Name": "ToDictionary", "Description": "Создает Dictionary<TKey, TValue> из IEnumerable<T> в соответствии с заданной функцией селектора ключа, средства сравнения и функции выбора элементов.", "Documentation": "ToDictionary<TSource, TKey, TElement>(IEnumerable<TSource>, Func<TSource, TKey>, Func<TSource, TElement>, IEqualityComparer<TKey>)" }, { "Name": "ToList", "Description": "Создает List<T> из IEnumerable<T>.", "Documentation": "ToList<TSource>(IEnumerable<TSource>)" }, { "Name": "ToLookup", "Description": "Создает Lookup<TKey, TElement> из IEnumerable<T> в соответствии с заданной функцией селектора ключа.", "Documentation": "ToLookup<TSource, TKey>(IEnumerable<TSource>, Func<TSource, TKey>)" }, { "Name": "ToLookup", "Description": "Создает Lookup<TKey, TElement> из IEnumerable<T> в соответствии с указанной функцией выбора ключа функции и компаратором ключей.", "Documentation": "ToLookup<TSource, TKey>(IEnumerable<TSource>, Func<TSource, TKey>, IEqualityComparer<TKey>)" }, { "Name": "ToLookup", "Description": "Создает Lookup<TKey, TElement> из IEnumerable<T> в соответствии с указанной функцией выбора ключа и функции селектора элемента.", "Documentation": "ToLookup<TSource, TKey, TElement>(IEnumerable<TSource>, Func<TSource, TKey>, Func<TSource, TElement>)" }, { "Name": "ToLookup", "Description": "Создает Lookup<TKey, TElement> из IEnumerable<T> в соответствии с заданной функцией селектора ключа и компаратором функции выбора элементов.", "Documentation": "ToLookup<TSource, TKey, TElement>(IEnumerable<TSource>, Func<TSource, TKey>, Func<TSource, TElement>, IEqualityComparer<TKey>)" }, { "Name": "Union", "Description": "Находит объединения наборов двух последовательностей, используя компаратор проверки на равенство по умолчанию.", "Documentation": "Union<TSource>(IEnumerable<TSource>, IEnumerable<TSource>)" }, { "Name": "Union", "Description": "Создает объединения наборов двух последовательностей с использованием указанного IEqualityComparer<T>.", "Documentation": "Union<TSource>(IEnumerable<TSource>, IEnumerable<TSource>, IEqualityComparer<TSource>)" }, { "Name": "Where", "Description": "Выполняет фильтрацию последовательности значений на основе заданного предиката.", "Documentation": "Where<TSource>(IEnumerable<TSource>, Func<TSource, Boolean>)" }, { "Name": "Where", "Description": "Выполняет фильтрацию последовательности значений на основе заданного предиката. Индекс каждого элемента используется в логике функции предиката.", "Documentation": "Where<TSource>(IEnumerable<TSource>, Func<TSource, Int32, Boolean>)" }, { "Name": "Zip", "Description": "Применяет указанную функцию к соответствующим элементам двух последовательностей, возвращает полученную  последовательность.", "Documentation": "Zip<TFirst, TSecond, TResult>(IEnumerable<TFirst>, IEnumerable<TSecond>, Func<TFirst, TSecond, TResult>)" }],
	Regex: [{ "Name": "CompileToAssembly", "Description": "Компилирует один или несколько указанных Regex объекты в именованную сборку.", "Documentation": "CompileToAssembly(RegexCompilationInfo[], AssemblyName)" }, { "Name": "CompileToAssembly", "Description": "Компилирует один или несколько указанных Regex объекты в именованную сборку с заданными атрибутами.", "Documentation": "CompileToAssembly(RegexCompilationInfo[], AssemblyName, CustomAttributeBuilder[])" }, { "Name": "CompileToAssembly", "Description": "Компилирует один или несколько указанных Regex объекты и указанный файл ресурсов в именованную сборку с заданными атрибутами.", "Documentation": "CompileToAssembly(RegexCompilationInfo[], AssemblyName, CustomAttributeBuilder[], String)" }, { "Name": "Escape", "Description": "Преобразует минимальный набор символов (\\, *, +, ?, |, {, [, (,), ^, $,., # и пробел), заменяя их escape-кодами. При этом обработчику регулярных выражений дается команда интерпретировать эти символы буквально, а не как метасимволы.", "Documentation": "Escape(String)" }, { "Name": "IsMatch", "Description": "Указывает, обнаружено ли в указанной входной строке соответствие заданному регулярному выражению.", "Documentation": "IsMatch(String, String)" }, { "Name": "IsMatch", "Description": "Указывает, обнаружено ли в указанной входной строке соответствие заданному регулярному выражению, используя указанные параметры сопоставления.", "Documentation": "IsMatch(String, String, RegexOptions)" }, { "Name": "IsMatch", "Description": "Указывает, обнаружено ли в указанной входной строке соответствие заданному регулярному выражению, с помощью указанных параметров сопоставления и интервала времени ожидания.", "Documentation": "IsMatch(String, String, RegexOptions, TimeSpan)" }, { "Name": "Match", "Description": "Ищет в указанной входной строке первое вхождение заданного регулярного выражения.", "Documentation": "Match(String, String)" }, { "Name": "Match", "Description": "Ищет во входной строке первое вхождение заданного регулярного выражения, используя указанные параметры сопоставления.", "Documentation": "Match(String, String, RegexOptions)" }, { "Name": "Match", "Description": "Ищет во входной строке первое вхождение заданного регулярного выражения, используя указанные параметры сопоставления и интервал времени ожидания.", "Documentation": "Match(String, String, RegexOptions, TimeSpan)" }, { "Name": "Matches", "Description": "Ищет в указанной входной строке все вхождения заданного регулярного выражения.", "Documentation": "Matches(String, String)" }, { "Name": "Matches", "Description": "Ищет в указанной входной строке все вхождения заданного регулярного выражения, используя указанные параметры сопоставления.", "Documentation": "Matches(String, String, RegexOptions)" }, { "Name": "Matches", "Description": "Ищет в указанной входной строке все вхождения заданного регулярного выражения, используя указанные параметры сопоставления и интервал времени ожидания.", "Documentation": "Matches(String, String, RegexOptions, TimeSpan)" }, { "Name": "Replace", "Description": "В указанной входной строке заменяет все строки, соответствующие указанному регулярному выражению, строкой, возвращенной делегатом MatchEvaluator.", "Documentation": "Replace(String, String, MatchEvaluator)" }, { "Name": "Replace", "Description": "В указанной входной строке заменяет все строки, соответствующие указанному регулярному выражению, строкой, возвращенной делегатом MatchEvaluator. Указанные параметры изменяют операцию сопоставления.", "Documentation": "Replace(String, String, MatchEvaluator, RegexOptions)" }, { "Name": "Replace", "Description": "В указанной входной строке заменяет все подстроки, соответствующие указанному регулярному выражению, строкой, возвращенной делегатом MatchEvaluator. Дополнительные параметры определяют параметры, которые изменяют соответствующую операцию и интервал времени ожидания, если совпадение не найдено.", "Documentation": "Replace(String, String, MatchEvaluator, RegexOptions, TimeSpan)" }, { "Name": "Replace", "Description": "В указанной входной строке заменяет все строки, соответствующие указанному регулярному выражению, указанной строкой замены.", "Documentation": "Replace(String, String, String)" }, { "Name": "Replace", "Description": "В указанной входной строке заменяет все строки, соответствующие указанному регулярному выражению, указанной строкой замены. Указанные параметры изменяют операцию сопоставления.", "Documentation": "Replace(String, String, String, RegexOptions)" }, { "Name": "Replace", "Description": "В указанной входной строке заменяет все строки, соответствующие указанному регулярному выражению, указанной строкой замены. Дополнительные параметры определяют параметры, которые изменяют соответствующую операцию и интервал времени ожидания, если совпадение не найдено.", "Documentation": "Replace(String, String, String, RegexOptions, TimeSpan)" }, { "Name": "Split", "Description": "Разделяет входную строку в массив подстрок в позициях, определенных шаблоном регулярного выражения.", "Documentation": "Split(String, String)" }, { "Name": "Split", "Description": "Разделяет входную строку в массив подстрок в позициях, определенных указанным шаблоном регулярного выражения. Указанные параметры изменяют операцию сопоставления.", "Documentation": "Split(String, String, RegexOptions)" }, { "Name": "Split", "Description": "Разделяет входную строку в массив подстрок в позициях, определенных указанным шаблоном регулярного выражения. Дополнительные параметры определяют параметры, которые изменяют соответствующую операцию и интервал времени ожидания, если совпадение не найдено.", "Documentation": "Split(String, String, RegexOptions, TimeSpan)" }, { "Name": "Unescape", "Description": "Преобразует все escape-символы во входной строке обратно в символы.", "Documentation": "Unescape(String)" }, { "Name": "ValidateMatchTimeout", "Description": "Этот API поддерживает инфраструктуру продукт, и его не следует использовать напрямую из кода.Проверяет, попадает ли интервал времени ожидания в допустимый диапазон.", "Documentation": "ValidateMatchTimeout(TimeSpan)" }]
}


export const XMLFeatures = [
	{
		"prefix": "_sexList",
		"body": [
			"<List Id=\"sexList\">",
			"\t<Item Id=\"1\" Var=\"Мужчины\"><Text>Man</Text></Item>",
			"\t<Item Id=\"2\" Var=\"Женщины\"><Text>Woman</Text></Item>",
			"</List>"
		],
		"description": "Список всех возможных полов"
	},
	{
		"prefix": "_monthList",
		"body": [
			"<List Id=\"monthList\">",
			"\t<Item Id=\"1\"><Text>Январь</Text></Item>",
			"\t<Item Id=\"2\"><Text>Февраль</Text></Item>",
			"\t<Item Id=\"3\"><Text>Март</Text></Item>",
			"\t<Item Id=\"4\"><Text>Апрель</Text></Item>",
			"\t<Item Id=\"5\"><Text>Май</Text></Item>",
			"\t<Item Id=\"6\"><Text>Июнь</Text></Item>",
			"\t<Item Id=\"7\"><Text>Июль</Text></Item>",
			"\t<Item Id=\"8\"><Text>Август</Text></Item>",
			"\t<Item Id=\"9\"><Text>Сентябрь</Text></Item>",
			"\t<Item Id=\"10\"><Text>Октябрь</Text></Item>",
			"\t<Item Id=\"11\"><Text>Ноябрь</Text></Item>",
			"\t<Item Id=\"12\"><Text>Декабрь</Text></Item>",
			"</List>"
		],
		"description": "Список месяцев"
	},
	{
		"prefix": "_isolate",
		"body": "<Ui Isolate=\"1\"/>",
		"description": "AnswerUi: Кнопка Isolate"
	},
	{
		"prefix": "_reset",
		"body": [
			"<Answer Id=\"${1:99}\" Reset=\"true\" Fix=\"true\" NoUseInQstFilter=\"true\"><Ui Isolate=\"1\"/><Text>${2:Затрудняюсь ответить}</Text></Answer>"
		],
		"description": "Исключающий ответ"
	},
	{
		"prefix": "_resetShort",
		"body": [
			"<Answer Id=\"${1:99}\" Reset=\"true\" Fix=\"true\"><Text>${2:Затрудняюсь ответить}</Text></Answer>"
		],
		"description": "Исключающий ответ (кратко)"
	},
	{
		"prefix": "_open",
		"body": [
			"<Answer Id=\"${1:98}\" Type=\"Text\" Fix=\"true\" ExportLabel=\"Другое\"><Text>${2:Другое;Что именно?}</Text></Answer>"
		],
		"description": "Открытый ответ"
	},
	{
		"prefix": "_openSelected",
		"body": [
			"<Answer Id=\"${1:98}\" Fix=\"true\" ExportLabel=\"Другое\"><Filter>return AnswerExists(\"${2:Q1}\", \"${1}\");</Filter><Text>[c#]AnswerValue(\"${2}\", \"${1}\");[/c#]</Text></Answer>"
		],
		"description": "Подстнановка на основе открытого ответа"
	},
	{
		"prefix": "_stepQuestions",
		"body": [
			"<Ui Step=\"1\" HeaderFix=\"1\"/>"
		],
		"description": "PageUi для постепенного выпадения вопросов"
	},
	{
		"prefix": "_scaleInt",
		"body": [
			"<Ui Extend=\"Scale\" Gradient=\"1\" GradientReverse=\"0\" LabelStart=\"$1\" LabelEnd=\"$2\"/>"
		],
		"description": "QuestionUi: Градиентная шкала с цифрами"
	},
	{
		"prefix": "_scaleText",
		"body": [
			"<Ui Extend=\"Scale\" Gradient=\"1\" GradientReverse=\"0\"/>"
		],
		"description": "QuestionUi: Градиентная шкала с метками"
	},
	{
		"prefix": "_scaleTextVertical",
		"body": [
			"<Ui Extend=\"Scale\" Gradient=\"1\" Orientation=\"Vertical\"/>"
		],
		"description": "QuestionUi: Вертикальная градиентная шкала с метками"
	},
	{
		"prefix": "_shape",
		"body": [
			"<Ui Extend=\"Shape\" Color=\"#F0FF00\" Opacity=\"0.3\" OpacitySelected=\"0.6\" WidthBorder=\"2\" ColorBorder=\"#f00\" Src=\"@ContentUrl\"/>"
		],
		"description": "QuestionUi: Областной клик-тест/полка"
	},
	{
		"prefix": "_sliderDiscrete",
		"body": [
			"<Ui Extend=\"Slider\" Type=\"Discrete\"/>"
		],
		"description": "QuestionUi: Дискретный Slider"
	},
	{
		"prefix": "_sliderContinous",
		"body": [
			"<Ui Extend=\"Slider\" Type=\"Continuous\" MinVal=\"0\" MaxVal=\"250\" SliderStep=\"1\" LabelEnd=\" руб.\" LabelTop=\"1\" ValueShow=\"1\"/>"
		],
		"description": "QuestionUi: Непрерывный Slider"
	},
	{
		"prefix": "_stars",
		"body": [
			"<Ui Extend=\"Stars\" ClearCaption=\"Оценки нет\" HoverColor=\"#fde16d\" SelectedColor=\"#fde16d\" BackColor=\"#aaa\"/>"
		],
		"description": "QuestionUi: Звёзды"
	},
	{
		"prefix": "_clickText",
		"body": [
			"<Ui Extend=\"ClickText\" Type=\"AutoSplit\" SelectedFontColor=\"black\" SelectedBackgroundColor=\"orange\" SplittingType=\"1\"/>"
		],
		"description": "QuestionUi: Текстовый ClickTest"
	},
	{
		"prefix": "_dragItemRange",
		"body": [
			"<Ui Extend=\"DragItem\" Type=\"Range\" SourceContainer=\"0,0\" TargetContainer=\"0,0\" DragItemAllowClick=\"1\"/>"
		],
		"description": "QuestionUi: DragItem Range"
	},
	{
		"prefix": "_dragItemCard",
		"body": [
			"<Ui Extend=\"DragItem\" Type=\"Card\" SourceContainer=\"550,0\" TargetContainer=\"0,0\" DragItemAllowClick=\"1\" FontSizeSource=\"1rem\" FontSizeTarget=\".8rem\"/>"
		],
		"description": "QuestionUi: DragItem Card"
	},
	{
		"prefix": "_maxDiff",
		"body": [
			"<Ui Extend=\"MaxDiff\" LabelMost=\"$1\" LabelLeast=\"$2\" Reverse=\"0\"/>"
		],
		"description": "QuestionUi: MaxDiff"
	},
	{
		"prefix": "_video",
		"body": [
			"<Ui Extend=\"MediaPlayer\" Type=\"Video\" Src=\"@ContentUrl/$1/}/$1.mp4\" PlayAuto=\"1\" SeekEnable=\"1\"/>"
		],
		"description": "QuestionUi: MediaPlayer Video"
	},
	{
		"prefix": "_audio",
		"body": [
			"<Ui Extend=\"MediaPlayer\" Type=\"Audio\" Src='@ContentUrl/$1/}/$1.mp3' PlayAuto=\"1\" PlayRedirect=\"1\" PauseEnable=\"0\" SeekEnable=\"1\"/>"
		],
		"description": "QuestionUi: MediaPlayer Audio"
	},
	{
		"prefix": "_contentOnly",
		"body": [
			"<Ui Extend=\"ContentOnly\" Cols=\"${1:6}\" MinCols=\"2\"/>"
		],
		"description": "QuestionUi: ContentOnly"
	},
	{
		"prefix": "_comboBox",
		"body": [
			"<Ui Extend=\"ComboBox\" Search=\"0\" Label=\"Выберите\"/>"
		],
		"description": "QuestionUi: ComboBox"
	},
	{
		"prefix": "_completePage",
		"body": [
			"<Page Id=\"${1:complete}\" End=\"true\">",
			"\t<Header>$0</Header>",
			"</Page>"
		],
		"description": "Вы прошли отбор!"
	},
	{
		"prefix": "_completeRedirectPage",
		"body": [
			"<Page Id=\"${1:last}\" CountProgress=\"false\" StructIgnore=\"true\">",
			"\t<Filter>false;</Filter>",
			"\t<Redirect Status=\"18\"/>",
			"</Page>"
		],
		"description": "Последняя страница (заглушка)"
	},
	{
		"prefix": "_respInfo",
		"body": [
			"<Page Id=\"RespInfo\">",
			"\t<Filter>false;</Filter>",
			"\t<Header>Опросные данные</Header>",
			"\t$0",
			"</Page>\n"
		],
		"description": "Страница RespInfo"
	},
	{
		"prefix": "_yandexMetrika",
		"body": [
			"<CustomText2 Action=\"Append\"><![CDATA[",
			"\t<script src=\"@StoreUrl/t/adaptiveJsHelpers.js\"></script>",
			"\t<script>initYandexMetrika('[c#]InterviewPars.ProjectID;[/c#]', '[c#]InterviewPars.RespID;[/c#]');</script>",
			"]]></CustomText2>"
		],
		"description": "Яндекс.Метрика"
	},
	{
		"prefix": "_expand",
		"body": [
			"[div data-expand='${1|1,2,3|}']",
			"\t[div class='smallTextBlock']",
			"\t\t${2:основной текст}",
			"\t[/div]",
			"\t[div class='popUpText']",
			"\t\t${3:увеличенный текст}",
			"\t[/div]",
			"[/div]"
		],
		"description": "Увеличение по клику (2) или по наведению (3)"
	},
	{
		"prefix": "_counter",
		"body": [
			"<Footer>",
			"\tСумма:",
			"\t[c# Side=\"Client\"]AnswerIDs(\"${1:PageId}\", \"${2:QuestionId}\").Select(x => int.Parse(AnswerValue(\"${2:QuestionId}\", x))).Sum().ToString();[/c#]%",
			"</Footer>",
			"<Validate Message=\"Cумма должна быть 100%!\" PinQuestion=\"${2:QuestionId}\">",
			"\treturn AnswerIDs(\"${1:PageId}\", \"${2:QuestionId}\").Select(x => int.Parse(AnswerValue(\"${2:QuestionId}\", x))).Sum() == 100;",
			"</Validate>"
		],
		"description": "Счётчик (Footer + Validate)"
	},
	{
		"prefix": "_yesNoAnswers",
		"body": [
			"<Answer Id=\"1\"><Text>Да</Text></Answer>",
			"<Answer Id=\"2\"><Text>Нет</Text></Answer>"
		],
		"description": "Два ответа (Да + Нет)"
	},
	{
		"prefix": "_weightList",
		"body": [
			'<!-- Имя листа: weightingList, если нужен только один, или weightingList_{СУФФИКС} если нужно несколько -->',
			'<List Id="weightingList_age_women_5" SaveToDb="true">',
			'\t<!-- FILTER: фильтр для подгруппы взвешивания, фильтр общего формата: Q1=1,2,3 & !Q8.1=15 -->',
			'\t<Item Id="__filter"><Text><![CDATA[ Items=5 & pre_sex=2 ]]></Text></Item>',
			'\t',
			'\t<!-- SPLIT: указание переменной, определяющей подгруппы для взвешивания, складывается по И с FILTER, варианты:',
			'\t\tпо ответам - если указать просто Q1, то будут созданы подгруппы для каждого ответа из Q1;',
			'\t\tпо значениям - если указать Q1.1, будут созданы подгруппы для каждого значения ответа №1 из Q1 -->',
			'\t<Item Id="__split"><Text>Items</Text></Item>',
			'\t',
			'\t<!-- TOTAL: Text - к какому тоталу взвешивать подгруппу, если опущено, будет взвешиваться к текущему набранному,',
			'\t\tесли набрано менее 0.9 части от нужного TOTAL, то взвешивание в этой подгруппе происходить не будет',
			'\t\tVar(0) - если указано значение типа double - заменяет собой лимит 0.9 - например, указав 0.5 можно проверить взвешивание в середине поля -->',
			'\t<Item Id="__total"><Var>0.5</Var><Text>120</Text></Item>',
			'',
			'\t<!-- элементы: ячейки для взвешивания, интервью подгруппы принадлежит ячейке, если в указанном вопросе (не) содержатся указанные ответы/значения',
			'\t\tId - произвольное значение, не начинающееся на __',
			'\t\tText - имя вопроса, может начинаться с ! - тогда это будет полное отрицание',
			'\t\tVar(0) - список (через запятую или минус для диапазонов) вариантов ответов, если не указано - любые, например: 1,2-7,12',
			'\t\tVar(1) - список (через запятую или минус для диапазонов) вариантов значений ответов, если не указано - любые, например, 25-30,35-40',
			'\t\tVar(2) - число, к которому нужно взвесить интервью этой ячейки, могут быть указаны в интервью или % (знак % в конце)',
			'\t\t-->',
			'\t<Item Id="2"><Var></Var><Var>51-55</Var><Var>40</Var><Text>pre_age</Text></Item>',
			'\t<Item Id="3"><Var></Var><Var>56-60</Var><Var>40</Var><Text>pre_age</Text></Item>',
			'\t<Item Id="4"><Var></Var><Var>61-65</Var><Var>40</Var><Text>pre_age</Text></Item>',
			'</List>',
		],
		"description": "Лист для взвешивания"
	},
	{
		"prefix": "_uniList",
		"body": [
			"<Page Id=\"${1:Id}\">",
			"\t<Repeat List=\"$2\">",
			"\t\t<Question Id=\"${1:Id}_@ID\" Type=\"${3|RadioButton,CheckBox,Text,Memo,Integer,Number,File,Date|}\">",
			"\t\t\t<Text>@Text</Text>",
			"\t\t</Question>",
			"\t</Repeat>",
			"\t<Question Id=\"${1:Id}_dummy\" Union=\"\\$all\" Orientation=\"${5|Horizontal,Vertical|}\">",
			"\t\t<Header>$8</Header>",
			"\t\t$0",
			"\t</Question>",
			"</Page>\n"
		],
		"description": "Полная структура Page с Union, Repeat по List"
	},
	{
		"prefix": "_uniLength",
		"body": [
			"<Page Id=\"${1:Id}\">",
			"\t<Repeat Length=\"$2\">",
			"\t\t<Question Id=\"${1:Id}_@Itera\" Type=\"${3|RadioButton,CheckBox,Text,Memo,Integer,Number,File,Date|}\">",
			"\t\t\t<Text>@Itera</Text>",
			"\t\t</Question>",
			"\t</Repeat>",
			"\t<Question Id=\"${1:Id}_dummy\" Union=\"\\$all\" Orientation=\"${5|Horizontal,Vertical|}\">",
			"\t\t<Header>$8</Header>",
			"\t\t$0",
			"\t</Question>",
			"</Page>\n"
		],
		"description": "Полная структура Page с Union, Repeat по Length"
	},
	{
		"prefix": "_kano",
		"body": `
	<List Id="kanoList">

	</List>

	<Repeat List="kanoList" MixId="kanoMix">
		<Page Id="F_@ID">
			<Ui Step="1" HeaderFix="1"/>
            <Header>[div align='right' class='nt' style='font-size: 10px;']Экран [c#]MixItera(@ID);[/c#] из [c#]CurrentSurvey.Lists["kanoList"].Items.Items.Values.Count().ToString();[/c#][/div]
            [div class="c"][u]@Text[/u][/div]</Header>
			<Question Id="Q1_@ID" Type="RadioButton" ExportLabel="@Text">
				<Header>Вам понятна эта идея?</Header>
				<Ui Extend="Scale"/>
				<Answer Id="1"><Text>Да, понятна</Text></Answer>
				<Answer Id="2"><Text>Нет, не понятна</Text></Answer>
			</Question>
			<Question Id="R1_@ID" Type="RadioButton" ExportLabel="@Text">
				<Header>Как вы отнесетесь, если сервис [u]БУДЕТ[/u] показывать эту информацию при онлайн-бронировании жилья для краткосрочной аренды?</Header>
				<Ui Extend="Scale"/>
				<Answer Id="5"><Text>Мне это не нужно, будет мне мешать</Text></Answer>
				<Answer Id="4"><Text>Мне это не нужно, но и мешать не будет</Text></Answer>
				<Answer Id="3"><Text>Мне все равно</Text></Answer>
				<Answer Id="2"><Text>Это нормально, так и должно быть</Text></Answer>
				<Answer Id="1"><Text>Мне это очень понравится!</Text></Answer>
			</Question>
			<Question Id="R2_@ID" Type="RadioButton" ExportLabel="@Text">
				<Header>Как вы отнесетесь, если сервис [u]НЕ БУДЕТ[/u] показывать эту информацию при онлайн-бронировании жилья для краткосрочной аренды?</Header>
				<Ui Extend="Scale"/>
				<Answer Id="1"><Text>Очень хорошо, что этого НЕ будет!</Text></Answer>
				<Answer Id="2"><Text>Это нормально, так и должно быть</Text></Answer>
				<Answer Id="3"><Text>Мне все равно</Text></Answer>
				<Answer Id="4"><Text>Мне это нужно, но переживу и без этого</Text></Answer>
				<Answer Id="5"><Text>Мне это нужно! Плохо, что этого не будет!</Text></Answer>
			</Question>		
		</Page>
	</Repeat>`,
		"description": "КАНО"
	}
];


export const CSFeatures = [
	{
		"prefix": "#getConceptCell",
		"body": [
			"public string cell()",
			"{",
			"\treturn AnswerValue(\"RespInfo\", \"Cell\", \"1\");",
			"}"
		],
		"description": "Метод для получения ячейки"
	},
	{
		"prefix": "#getShape",
		"body": [
			"public string getShape(int shNum) ",
			"{",
			"\t/* число квадратиков */",
			"\tint X = 14;",
			"\tint Y = 25;",
			"",
			"\t/* размер картинки в пикселях */",
			"\tint W = 466;",
			"\tint H = 600;",
			"",
			"\t/* размер квадратика */",
			"\tdouble sizeX = (double)W/X;",
			"\tdouble sizeY = (double)H/Y;",
			"",
			"\t/* номер строки и столбца */",
			"\tint C = (shNum-1) % X + 1;",
			"\tint R = (shNum-1) / X + 1;",
			"",
			"\t/* левый верхний угол квадратика */",
			"\tdouble top = (double)(R-1)*sizeY;",
			"\tdouble left = (double)(C-1)*sizeX;",
			"",
			"\tstring ret = left.ToString() + \",\" + top.ToString() + \",\" + (left+sizeX).ToString() + \",\" + top.ToString() + \",\" + (left+sizeX).ToString() + \",\" + (top+sizeY).ToString() + \",\" + left.ToString() + \",\" + (top+sizeY).ToString();",
			"",
			"\treturn ret;",
			"}"
		],
		"description": "Метод для сеточного клик-теста"
	},
	{
		"prefix": "#isMoble",
		"body": [
			"InterviewPars.GetInstance().IsMobile"
		],
		"description": "Мобильное устройство"
	},
	{
		"prefix": "#debugPrint",
		"body": [
			"public string DebugPrint(string text)",
			"{",
			"\treturn \"[div class=\"d color-red\"]\" + text + \"[/div]\";",
			"}"
		],
		"description": "Метод для вывод отладочной информации (только для debug)"
	},
	{
		"prefix": "#debugData",
		"body": [
			"AnswerUpdateP(\"debug\", \"debug\", \"${1:1}\", $2);"
		],
		"description": "Сохранение данных для отладки"
	},
	{
		"prefix": "#sexText",
		"body": [
			"public string SexText(string man, string woman)",
			"{",
			"\t return AnswerExists(\"pre_sex\", \"1\") ? man : woman;",
			"}"
		],
		"description": "Метод: текст в зависимости от пола"
	},
	{
		"prefix": "#parseDateTime",
		"body": [
			"DateTime.ParseExact(${1:stringDate}, \"${2:dd.MM.yyyy hh:mm:ss}\", null)"
		],
		"description": "Приведение string к DateTime"
	},
	{
		"prefix": "#ageIntervals",
		"body": [
			'public void setAgeIntervals()',
			'{',
			'	int age = int.Parse(AnswerValue("pre_age","1"));',
			'	foreach (SurveyListItem item in CurrentSurvey.Lists["ageList"].Items)',
			'	{',
			'		if (age >= int.Parse(item.Vars[0]) && age <= int.Parse(item.Vars[3]))',
			'		{',
			'			AnswerUpdateP("RespInfo", "AgeInt", item.ID);',
			'			break;',
			'		}',
			'	}',
			'}'
		],
		"description": "Метод перекодировки возраста в интервалы"
	},
	{
		"prefix": "#ListItems",
		"body": [
			"CurrentSurvey.Lists[$1].Items.Items.Values"
		],
		"description": "Обращение к коллекции элементов листа"
	}
];




export const RangeQuestion = {
	QuestionSnippet: {
		"prefix": "_rangeQuestions",
		"body": [
			'<Page Id="${1:Q1}">',
			'\t<Question Id="$1" Type="CheckBox" MaxAnswers="@RangeCount" MixId="${8:rangeMix}">',
			'\t\t<Header></Header>',
			'\t\t<Ui Extend="ContentOnly" Cols="6" MinCols="2"/>',
			'\t\t<Repeat List="${3:list}">',
			'\t\t\t<Answer Id="@ID"><Text>[img src="@ContentUrl/$1/@ID.jpg"/]@Text</Text></Answer>',
			'\t\t</Repeat>',
			'\t\t<Answer Id="999" Reset="true" Fix="true" NoUseInQstFilter="true"><Ui Isolate="1"/><Text>${6:Ни один}</Text></Answer>',
			'\t</Question>',
			'\t<!--* оставляйте постфикс "_range", он учитывается SS-шаблоном при ранжировании -->',
			'\t<Question Id="$1_range" Type="Integer">',
			'\t\t<Filter>return false;</Filter>',
			'\t\t<Header>Ранги элементов</Header>',
			'\t\t<Repeat List="$3">',
			'\t\t\t<Answer Id="@ID"><Text>@Text</Text></Answer>',
			'\t\t</Repeat>',
			'\t</Question>',
			'</Page>',
			'',
			'<Page Id="$4">',
			'\t<Filter><![CDATA[ return AnswerExistsAny("$1", "\\$repeat($3){@ID[,]}") && AnswerCount("$1", "$1") > 1; ]]></Filter>',
			'\t<Ui RangeQuestions="1"/>',
			'\t<Repeat Length="@RangeCount">',
			'\t\t<Question Id="$4_@Itera" Type="RadioButton" MixId="$8" Imperative="false" StructIgnore="true">',
			'\t\t\t<Filter Side="Client"><![CDATA[ return AnswerCount("$4", "$4_@Itera") > 0 || AnswerEnabledForRanging("$4_", "999", @Itera, @RangeCount); ]]></Filter>',
			'\t\t\t<Header></Header>',
			'\t\t\t<Ui Extend="ContentOnly" Cols="6" MinCols="2"/>',
			'\t\t\t<Repeat List="$3">',
			'\t\t\t\t<Answer Id="@ID">',
			'\t\t\t\t\t<Filter><![CDATA[ return AnswerExists("$1", "@ID"); ]]></Filter>',
			'\t\t\t\t\t<Filter Side="Client"><![CDATA[ return AnswerEnabledForRanging("$4_", "@ID", @Itera(-1), @RangeCount); ]]></Filter>',
			'\t\t\t\t\t<Text>[img src="@ContentUrl/$1/@ID.jpg"/]@Text</Text>',
			'\t\t\t\t</Answer>',
			'\t\t\t</Repeat>',
			'\t\t\t<Answer Id="999" Reset="true" Fix="true" NoUseInQstFilter="true"><Ui Isolate="1"/><Text>$6</Text></Answer>',
			'\t\t</Question>',
			'\t</Repeat>',
			'\t<Redirect><![CDATA[',
			'\t\tif (AnswerCount("$1", "$1") == 1)',
			'\t\t{',
			'\t\t\tvar id = AnswerIDs("$1", "$1")[0];',
			'\t\t\tif (id != "999") AnswerUpdateP("$4", "$4_1", id);',
			'\t\t}',
			'\t\telse // проверяем на заполненность ранжирования',
			'\t\t{',
			'\t\t\tbool noAnswers = true;',
			'\t\t\tfor (int i = 1; i <= @RangeCount; i++)',
			'\t\t\t{',
			'\t\t\t\tif (AnswerCount("$4", "$4_" + i.ToString()) > 0)',
			'\t\t\t\t{',
			'\t\t\t\t\tnoAnswers = false;',
			'\t\t\t\t\tbreak;',
			'\t\t\t\t}',
			'\t\t\t}',
			'\t\t\tif (noAnswers) return false;',
			'\t\t}',
			'\t\t/** Считается что "$1" и "$1_range" находятся на странице "$1" */',
			'\t\t/** По умолчанию невыбранным элементам проставляется ранг в зависимости от длины листа "$3". Если нужен другой, то надо передать его ещё одним параметром в SetRanges. */',
			'\t\tSetRanges("$1", "$4_", "$1_range", "$3", "999");',
			'\t\treturn false;',
			'\t]]></Redirect>',
			'</Page>',
			''
		],
		"description": "Ранжирование"
	},

	Constant: '\t\t<Item Id="RangeCount"><Value>7</Value></Item>'

}


export const CognitoBlock = {
	prefix: "_cognito",
	body: `
	<List Id="agecheckList">
		<Item Id="1"><Text>Возраст совпал</Text></Item>
		<Item Id="2"><Text>Возраст не совпал</Text></Item>
	</List>
	
	<List Id="SegmentList">
		<Item Id="1"><Text>High-energy diva</Text></Item>
		<Item Id="2"><Text>Success-driven queen</Text></Item>
		<Item Id="3"><Text>Non-conformist princess</Text></Item>
		<Item Id="4"><Text>Creative rebel</Text></Item>
		<Item Id="5"><Text>Alternative arty girl</Text></Item>
		<Item Id="6"><Text>Social-status seeker</Text></Item>
		<Item Id="7"><Text>Holistic wellness lover</Text></Item>
		<Item Id="8"><Text>Nature amp; health protector</Text></Item>
		<Item Id="9"><Text>Cute dreamer</Text></Item>
		<Item Id="10"><Text>Self-confidence seeker</Text></Item>
		<Item Id="11"><Text>Antimaterialist</Text></Item>
	</List>


	<Page Id="RespInfo">
		<Filter>false;</Filter>
		<Header>Опросные данные</Header>
		<Question Id="Segment" Type="RadioButton">
			<Header>Сегмент</Header>
			<Repeat List="SegmentList">
				<Answer Id="@ID"><Text>@Text</Text></Answer>
			</Repeat>
		</Question>
		<Question Id="GenderCog" Type="RadioButton">
			<Header>Пол из Cognito</Header>
			<Answer Id="0"><Text>Мужской</Text></Answer>
			<Answer Id="1"><Text>Женский</Text></Answer>
		</Question>
		<Question Id="AgeCog" Type="Integer">
			<Header>Возраст из Cognito</Header>
			<Answer Id="1"><Text></Text></Answer>
		</Question>		
		<Question Id="Agecheck" Type="RadioButton">
			<Header>Совпадение возраста на круге и в Cognito</Header>
			<Repeat List="agecheckList">
				<Answer Id="@ID"><Text>@Text</Text></Answer>
			</Repeat>
		</Question>
	</Page>

<!--#block #Блок D. Демография -->

	<Page Id="techSOCIOVISION" CountProgress="false">
		<Header>[center]Пожалуйста, нажмите Далее для продолжения[/center]</Header>
		<Redirect><![CDATA[
			string url = "https://cognitosurvey.com/?cognito_id=LOREAL_SEG2019_WOMEN_RUSSIA&callback_url=https%3A%2F%2Fcloudsurvey.survstat.ru%2F%3Fp%3D"+InterviewPars.GetInstance().ProjectId+"%26a%3D"+\\$age+"%26back%3D1%26i%3D@RespID";
			if (AnswerValue("pre_data","back") != "1") {
				this.Url = url;
				return true;
			}
			return false;
		]]></Redirect>
	</Page>

	<Page Id="preD"><Header>[center]В заключение несколько вопросов о Вас.[/center]</Header>
		<Redirect><![CDATA[
			if (AnswerValue("pre_data","MAIN_TYPE").Length>1) AnswerUpdateP("RespInfo","Segment",AnswerValue("pre_data","MAIN_TYPE").Substring(1));
			string gender = AnswerValue("pre_data","GENDER");
			AnswerUpdateP("RespInfo","GenderCog",gender);
			if (gender == "0") return false;			
			int age_round = int.Parse(AnswerValue("pre_data","pre_age","1"));
			int age_cognito = int.Parse(AnswerValue("pre_data","AGE"));		
			AnswerUpdateP("RespInfo","AgeCog","1",AnswerValue("pre_data","AGE"));
			if (age_round != age_cognito)
			{
				AnswerUpdateP("RespInfo","Agecheck","2");
				return false;
			}
			if (age_round == age_cognito) AnswerUpdateP("RespInfo","Agecheck","1");
			return false;
		]]></Redirect>			
	</Page>

<!--#endblock-->
	`,
	description: "Блок XML для Cognito"
}
