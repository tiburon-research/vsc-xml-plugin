var raw = `

#region Обмен между сервером и валидейтом, неаккуратненько
public string PinQuestion
{
	get { return _pinQuestion; }
	set { _pinQuestion = value; }
}

public string PinAnswer
{
	get { return _pinAnswer; }
	set { _pinAnswer = value; }
}

public string Message
{
	get { return _message; }
	set { _message = value; }
}

public string MessageGeneral
{
	get { return _messageGeneral; }
	set { _messageGeneral = value; }
}

#endregion

#region Обмен между сервером и редиректом, неаккуратненько
public int Status
{
	get { return _status; }
	set { _status = value; }
}

public string Page
{
	get { return _page; }
	set { _page = value; }
}

public string Url
{
	get { return _url; }
	set { _url = value; }
}
#endregion

public int CurrentInterview
{
	get
	{
		return InterviewPars.GetInstance().InterviewId;
	}
}

public int CurrentSurveyId
{
	get
	{
		return AsyncHelpers.RunSync(async () =>
			await InterviewSharedService.GetSurveyByInterviewId(CurrentInterview) ?? -1
		);
	}
}

public int CurrentInterviewOrder
{
	get
	{
		return _db.StateInterviewGetOrder(CurrentInterview);
	}
}

#region Api services
private IQuotaSharedService QuotaSharedService { get; set; }
private IInterviewSharedService InterviewSharedService { get; set; }
private ISharedInterviewFacadeService SharedInterviewFacadeService { get; set; }
#endregion

#region Новые процедуры/функции

public bool InterviewExists(string questionId, string answerId, string val)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{ "Question", questionId},
	{"Answer", answerId}});
	return _db.DataInterviewExists(CurrentInterview, questionId, answerId, val);
}

#region AnswerInsert*
private void AnswerInsert(string pageId, string questionId, string answerId, string val)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId},
	{"Question", questionId},
	{"Answer", answerId}});

	this.ExtInterviewAnswerInsert(CurrentInterview, pageId, questionId, answerId, val);
}
private void AnswerInsert(string pageId, string questionId, string answerId)
{
	this.AnswerInsert(pageId, questionId, answerId, String.Empty);
}

private void AnswerInsertOnce(string pageId, string questionId, string answerId, string val)
{
	this.AnswerInsert(pageId, questionId, answerId, val);
}
private void AnswerInsertOnce(string pageId, string questionId, string answerId)
{
	this.AnswerInsertOnce(pageId, questionId, answerId, String.Empty);
}

private void ExtInterviewAnswerInsert(int interviewId, string pageId, string questionId, string answerId)
{
	this.ExtInterviewAnswerInsert(interviewId, pageId, questionId, answerId, String.Empty);
}

public void ExtSurveyAnswerInsert(int extSurveyId, string pageId, string questionId, string answerId, int[] statuses, string val = null)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
		ExtInterviewAnswerInsert((int)extInterviewIdSearchResult, pageId, questionId, answerId, val);
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return;
	}
}

public void ExtSurveyAnswerInsert(int extSurveyId, string pageId, string questionId, string answerId, string val = null)
{
	ExtSurveyAnswerInsert(extSurveyId, pageId, questionId, answerId, new int[] { 18 }, val);
}

private static void ExtSurveyInterviewSerchResultCeck(int extSurveyId, ExtInterviewSearchResult extInterviewIdSearchResult, [CallerMemberName]string methodName = null)
{
	switch (extInterviewIdSearchResult)
	{
		case ExtInterviewSearchResult.NotFound:
			Log.Write("", methodName, "Метод " + methodName + ". Указанный respuid не найден в проекте " + extSurveyId, null, errorLevel: SEServerCore.CustomExceptions.ErrorLevel.Warning);
			break;
		case ExtInterviewSearchResult.RespUidIsEmpty:
			Log.Write("", methodName, "Метод " + methodName + " вызван с пустым respuid", null, errorLevel: SEServerCore.CustomExceptions.ErrorLevel.Error);
			break;
		default:
			Log.Write("", methodName, "Ошибка выполнения метода " + methodName, null, errorLevel: SEServerCore.CustomExceptions.ErrorLevel.Error);
			break;
	}
}

private void ExtInterviewAnswerInsert(int interviewId, string pageId, string questionId, string answerId, string val)
{
	SharedInterviewFacadeService.InterviewResultAdd(pageId, questionId, answerId, val, CurrentSurvey.ID, interviewId);
}
#endregion

#region AnswerUpdate*
private void AnswerUpdate(int? surveyId, int interviewId, string pageId, string questionId, string answerId, string val)
{
	Dictionary<string, string> ids = new Dictionary<string, string>();
	List<string> nullRef = new List<string>();
	if (String.IsNullOrEmpty(questionId))
	{
		nullRef.Add("questionId");
	}
	if (String.IsNullOrEmpty(answerId))
	{
		nullRef.Add("answerId");
	}
	if (nullRef.Count != 0)
	{
		throw new Exception(String.Format("Следующие параметры записи данных пустые: {0}", String.Join(",", nullRef)));
	}
	if (!String.IsNullOrEmpty(pageId)) ids.Add("Page", pageId);
	ids.Add("Question", questionId);
	ids.Add("Answer", answerId);
	if (!surveyId.HasValue)
	{
		Common.ValidateID(ids);

		Common.CheckStructIgnore(pageId, questionId, answerId);
	}

	string answerValue = string.IsNullOrEmpty(val) ? null : val;

	int status = -1;
	if (pageId == "$interview" && questionId == "$interview" && answerId == "Status" && int.TryParse(answerValue, out status))
		SharedInterviewFacadeService.InterviewDataUpdate(status, surveyId ?? CurrentSurvey.ID, interviewId);
	else
		SharedInterviewFacadeService.InterviewResultAdd(pageId, questionId, answerId, answerValue, surveyId ?? CurrentSurvey.ID, interviewId);
}

private void AnswerUpdate(int interviewId, string questionId, string answerId, string val)
{
	AnswerUpdate(null, interviewId, string.Empty, questionId, answerId, val);
}

private void AnswerUpdateP(string pageId, string questionId, string answerId, string val)
{
	AnswerUpdate(null, CurrentInterview, pageId, questionId, answerId, val);
}

private void AnswerUpdateP(string pageId, string questionId, string answerId)
{
	this.AnswerUpdateP(pageId, questionId, answerId, String.Empty);
}

private void AnswerUpdateP(string pageId, string questionId, IEnumerable<string> answerIds)
{
	foreach (var answerId in answerIds)
	{
		this.AnswerUpdateP(pageId, questionId, answerId, String.Empty);
	}
}

private void AnswerUpdateP(string pageId, string questionId, Dictionary<string, string> answerDict)
{
	foreach (var answerD in answerDict)
	{
		this.AnswerUpdateP(pageId, questionId, answerD.Key, answerD.Value);
	}
}

private void AnswerUpdate(string questionId, string answerId, string val)
{
	this.AnswerUpdateP(String.Empty, questionId, answerId, val);
}

private void AnswerUpdate(string questionId, string answerId)
{
	this.AnswerUpdateP(String.Empty, questionId, answerId, String.Empty);
}

private void ExtInterviewAnswerUpdate(int interviewId, string pageId, string questionId, string answerId, string val)
{
	var id = AsyncHelpers.RunSync(async () => await InterviewSharedService.GetSurveyByInterviewId(interviewId));
	if (!id.HasValue) throw new Exception(String.Format("Cannot find survey for interview with id {0}", interviewId));
	AnswerUpdate(id.Value, interviewId, pageId, questionId, answerId, val);
}

public void ExtSurveyAnswerUpdateP(int extSurveyId, string pageId, string questionId, string answerId, int[] statuses, string val = null)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
		AnswerUpdate(extSurveyId, (int)extInterviewIdSearchResult, pageId, questionId, answerId, val);
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return;
	}
}

public void ExtSurveyAnswerUpdateP(int extSurveyId, string pageId, string questionId, string answerId, string val = null)
{
	ExtSurveyAnswerUpdateP(extSurveyId, pageId, questionId, answerId, new int[] { 18 }, val);
}

public void ExtSurveyAnswerUpdateP(int extSurveyId, string pageId, string questionId, IEnumerable<string> answerIds, int[] statuses)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
	{
		foreach (var aId in answerIds)
		{
			AnswerUpdate(extSurveyId, (int)extInterviewIdSearchResult, pageId, questionId, aId, string.Empty);
		}
	}
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return;
	}
}

public void ExtSurveyAnswerUpdateP(int extSurveyId, string pageId, string questionId, IEnumerable<string> answerIds)
{
	ExtSurveyAnswerUpdateP(extSurveyId, pageId, questionId, answerIds, new int[] { 18 });
}

public void ExtSurveyAnswerUpdateP(int extSurveyId, string pageId, string questionId, Dictionary<string, string> answerDict, int[] statuses)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
	{
		foreach (var aDict in answerDict)
		{
			AnswerUpdate(extSurveyId, (int)extInterviewIdSearchResult, pageId, questionId, aDict.Key, aDict.Value);
		}
	}
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return;
	}
}

public void ExtSurveyAnswerUpdateP(int extSurveyId, string pageId, string questionId, Dictionary<string, string> answerDict)
{
	ExtSurveyAnswerUpdateP(extSurveyId, pageId, questionId, answerDict, new int[] { 18 });
}

public void ExtInterviewAnswerUpdateP(int interviewId, string pageId, string questionId, IEnumerable<string> answerIds)
{
	var surveyId = AsyncHelpers.RunSync(async () => await InterviewSharedService.GetSurveyByInterviewId(interviewId));
	if (!surveyId.HasValue) throw new Exception(String.Format("Cannot find survey for interview with id {0}", interviewId));

	foreach (var aId in answerIds)
	{
		AnswerUpdate(surveyId, interviewId, pageId, questionId, aId, string.Empty);
	}
}

public void ExtInterviewAnswerUpdateP(int interviewId, string pageId, string questionId, Dictionary<string, string> answerDict)
{
	var surveyId = AsyncHelpers.RunSync(async () => await InterviewSharedService.GetSurveyByInterviewId(interviewId));
	if (!surveyId.HasValue) throw new Exception(String.Format("Cannot find survey for interview with id {0}", interviewId));

	foreach (var aDict in answerDict)
	{
		AnswerUpdate(surveyId, interviewId, pageId, questionId, aDict.Key, aDict.Value);
	}
}

public void ExtSurveyAnswerUpdate(int extSurveyId, string questionId, string answerId, int[] statuses, string val = null)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
		AnswerUpdate(extSurveyId, (int)extInterviewIdSearchResult, String.Empty, questionId, answerId, val);
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return;
	}
}

public void ExtSurveyAnswerUpdate(int extSurveyId, string questionId, string answerId, string val = null)
{
	ExtSurveyAnswerUpdate(extSurveyId, questionId, answerId, new int[] { 18 }, val);
}
#endregion

#region AnswerDelete*

///базовые методы удаления ответов
private void ExtInterviewResultsDeleteQuotaV3(int interviewId, string pageId, string questionId, string answerId)
{
	SharedInterviewFacadeService.InterviewResultsDelete(pageId, questionId, answerId, CurrentSurvey.ID, interviewId);

}

private void ExtInterviewAnswerDelete(int interviewId, string pageId, string questionId, string answerId)
{
	ExtInterviewResultsDeleteQuotaV3(interviewId, pageId, questionId, answerId);
}
private void ExtInterviewQuestionDelete(int interviewId, string questionId)
{
	ExtInterviewResultsDeleteQuotaV3(interviewId, null, questionId, null);
}
private void ExtInterviewPageDelete(int interviewId, string pageId)
{
	ExtInterviewResultsDeleteQuotaV3(interviewId, pageId, null, null);
}
private void ExtInterviewQuestionByPageDelete(int interviewId, string pageId, string questionId)
{
	ExtInterviewResultsDeleteQuotaV3(interviewId, pageId, questionId, null);
}
private void ExtInterviewResultsDelete(int interviewId)
{
	ExtInterviewResultsDeleteQuotaV3(interviewId, null, null, null);
}

private void ExtInterviewAnswerDelete(int interviewId, string questionId, string answerId)
{
	ExtInterviewAnswerDelete(interviewId, string.Empty, questionId, answerId);
}

public void ExtSurveyAnswerDelete(int extSurveyId, string pageId, string questionId, string answerId, int[] statuses)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
		ExtInterviewAnswerDelete((int)extInterviewIdSearchResult, pageId, questionId, answerId);
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return;
	}
}

public void ExtSurveyAnswerDelete(int extSurveyId, string pageId, string questionId, string answerId)
{
	ExtSurveyAnswerDelete(extSurveyId, pageId, questionId, answerId, new int[] { 18 });
}

public void ExtSurveyAnswerDelete(int extSurveyId, string questionId, string answerId, int[] statuses)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
		ExtInterviewAnswerDelete((int)extInterviewIdSearchResult, questionId, answerId);
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return;
	}
}

public void ExtSurveyAnswerDelete(int extSurveyId, string questionId, string answerId)
{
	ExtSurveyAnswerDelete(extSurveyId, questionId, answerId, new int[] { 18 });
}

private void AnswerDelete(string pageId, string questionId, string answerId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId},
	{"Question", questionId},
	{"Answer", answerId}});

	ExtInterviewAnswerDelete(CurrentInterview, pageId, questionId, answerId);
}

private void AnswerDelete(string questionId, string answerId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Question", questionId},
	{"Answer", answerId}});

	ExtInterviewAnswerDelete(CurrentInterview, questionId, answerId);
}

private void AnswerClear(string questionId, string answerId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Question", questionId},
	{"Answer", answerId}});
	ExtInterviewAnswerDelete(CurrentInterview, questionId, answerId);
}

private void PageClear(string pageId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId}});

	ExtInterviewPageDelete(CurrentInterview, pageId);
	//_db.DataResultClearList(CurrentInterview, pageId);
}
private void QuestionClear(string questionId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Question", questionId}});
	ExtInterviewQuestionDelete(CurrentInterview, questionId);
	//_db.DataResultClearQuestion(CurrentInterview, questionId);
}
private void QuestionClear(int interviewId, string questionId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Question", questionId}});
	ExtInterviewQuestionDelete(interviewId, questionId);
	//_db.DataResultClearQuestion(interviewId, questionId);
}

private void ClearResults(string pageId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId}});

	ExtInterviewPageDelete(CurrentInterview, pageId);
	//_db.DataResultClearList(CurrentInterview, pageId);
}

private void ClearResults(string pageId, string questionId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId},
	{"Question", questionId}});

	ExtInterviewQuestionByPageDelete(CurrentInterview, pageId, questionId);
	//_db.DataResultClearList(CurrentInterview, pageId, questionId);
}

private void InterviewResultClear()
{
	ExtInterviewResultsDelete(CurrentInterview);
}


#endregion

#region QuotaCount*
public double QuotaCount(string quotaId)
{
	return QuotaCount(CurrentSurvey.ID, quotaId);
}

public double QuotaCount(int surveyId, string quotaId)
{
	Common.ValidateQuotaID(quotaId);
	if (CurrentSurvey.Settings.QuotaType.GetVersion() == SurveyQuotaVersion.Version3)
	{
		var getCountResponse = AsyncHelpers.RunSync(async () => (await QuotaSharedService.GetCountByQuotaNamesAsync(surveyId, new[] { quotaId }, CurrentInterview)));
		if (getCountResponse.HasError)
			throw new Exception("Ошибка во время применения квот. Присутствуют необработанные данные");

		return getCountResponse.QuotaCounts.Count > 0 ? getCountResponse.QuotaCounts[quotaId].SumCountStatuses : 0;
	}
	else
		return _db.DataQuotaGetCount(surveyId, quotaId, CurrentInterview);
}

public double QuotaCount(string quotaName, string statuses)
{
	Common.ValidateQuotaID(quotaName);
	var intStatuses = statuses.Split(',')
		.Select(Int32.Parse);
	var quotaCountResponse = AsyncHelpers.RunSync(async () => (await QuotaSharedService.GetCountAsync(CurrentSurvey.ID, quotaName, interviewToSubstract: CurrentInterview)));
	if (quotaCountResponse.HasError)
		throw new Exception("Ошибка во время применения квот. Присутствуют необработанные данные");

	return (double)(quotaCountResponse.StatusCount.Where(x => intStatuses.Contains(x.Key)).Sum(x => x.Value));
}

public double QuotaCountStatus(string quotaId, int statusId)
{
	return QuotaCountStatus(CurrentSurvey.ID, quotaId, statusId);
}

public double QuotaCountStatus(int surveyId, string quotaId, int statusId)
{
	Common.ValidateQuotaID(quotaId);
	if (CurrentSurvey.Settings.QuotaType.GetVersion() == SurveyQuotaVersion.Version3)
	{
		var getCountResult = AsyncHelpers.RunSync(async () => await QuotaSharedService.GetCountByStatus(CurrentSurvey.ID, quotaId, statusId));
		if (getCountResult.HasError)
			throw new Exception("Ошибка во время применения квот. Присутствуют необработанные данные");

		return getCountResult.Count;
	}
	else
		return _db.DataQuotaGetCountStatus(surveyId, quotaId, statusId);
}
#endregion

private void InterviewStatusChange(int statusId)
{
	SharedInterviewFacadeService.InterviewDataUpdate(statusId, CurrentSurvey.ID, CurrentInterview);
}

public bool ExtSurveyAnswerExists(int extSurveyId, string pageId, string questionId, string answerId, int[] statuses)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
		return _dbWrapper.DataResultGetWithCache((int)extInterviewIdSearchResult, pageId, questionId, answerId).Found;
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return false;
	}
}

public bool ExtSurveyAnswerExists(int extSurveyId, string pageId, string questionId, string answerId)
{
	return ExtSurveyAnswerExists(extSurveyId, pageId, questionId, answerId, new int[] { 18 });
}

public bool ExtSurveyAnswerExists(int extSurveyId, string questionId, string answerId, int[] statuses)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
		return _dbWrapper.DataResultGetWithCache((int)extInterviewIdSearchResult, questionId, answerId).Found;
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return false;
	}
}

public bool ExtSurveyAnswerExists(int extSurveyId, string questionId, string answerId)
{
	return ExtSurveyAnswerExists(extSurveyId, questionId, answerId, new int[] { 18 });
}

public bool ExtSurveyAnswerExistsAny(int extSurveyId, string questionId, string srcRange, int[] statuses)
{
	return ExtSurveyAnswerExistsForRange(extSurveyId, questionId, srcRange, LogicalOperator.Or, statuses);
}

public bool ExtSurveyAnswerExistsAny(int extSurveyId, string questionId, string srcRange)
{
	return ExtSurveyAnswerExistsForRange(extSurveyId, questionId, srcRange, LogicalOperator.Or);
}

public bool ExtSurveyAnswerExistsAny(int extSurveyId, string pageId, string questionId, string srcRange, int[] statuses)
{
	return ExtSurveyAnswerExistsForRange(extSurveyId, questionId, srcRange, LogicalOperator.Or, statuses);
}

public bool ExtSurveyAnswerExistsAny(int extSurveyId, string pageId, string questionId, string srcRange)
{
	return ExtSurveyAnswerExistsForRange(extSurveyId, questionId, srcRange, LogicalOperator.Or);
}

public bool ExtSurveyAnswerExistsForRange(int extSurveyId, string questionId, string srcRange, LogicalOperator oper, int[] statuses)
{
	char replacementSymbol = '&';
	switch (oper)
	{
		case LogicalOperator.Or:
			replacementSymbol = '|';
			break;
		case LogicalOperator.Xor:
			replacementSymbol = '^';
			break;
	}

	Range range = new Range(QuestionType.Integer, srcRange.Replace(',', replacementSymbol));

	bool ret = (oper == LogicalOperator.Or ? false : true);

	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	var answers = _dbWrapper.DataAnswerSelectList((int)extInterviewIdSearchResult, String.Empty, questionId);

	foreach (var answer in answers)
	{
		if (oper == LogicalOperator.Or)
			ret |= range.IsInRange(answer[0]);
		else
			ret &= range.IsInRange(answer[0]);
	}

	if (extInterviewIdSearchResult > 0)
		return ret;
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return false;
	}
}

public bool ExtSurveyAnswerExistsForRange(int extSurveyId, string questionId, string srcRange, LogicalOperator oper)
{
	return ExtSurveyAnswerExistsForRange(extSurveyId, questionId, srcRange, oper, new int[] { 18 });
}

public string ExtSurveyAnswerValue(int extSurveyId, string pageId, string questionId, string answerId, int[] statuses)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
	{
		var ret = _dbWrapper.DataExtResultGet((int)extInterviewIdSearchResult, extSurveyId, pageId, questionId, answerId);
		return ret.Found ? ret.Value : String.Empty;
	}
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return null;
	}
}

public string ExtSurveyAnswerValue(int extSurveyId, string pageId, string questionId, string answerId)
{
	return ExtSurveyAnswerValue(extSurveyId, pageId, questionId, answerId, new int[] { 18 });
}

public string ExtSurveyAnswerValue(int extSurveyId, string questionId, string answerId, int[] statuses)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
	{
		var ret = _dbWrapper.DataExtInterviewResultGet((int)extInterviewIdSearchResult, questionId, answerId);
		return ret.Found ? ret.Value : String.Empty;
	}
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return null;
	}
}

public string ExtSurveyAnswerValue(int extSurveyId, string questionId, string answerId)
{
	return ExtSurveyAnswerValue(extSurveyId, questionId, answerId, new int[] { 18 });
}

public string ExtSurveyAnswerID(int extSurveyId, string pageId, string questionId, int[] statuses)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
		return _dbWrapper.GetExtSurveyAnswerId((int)extInterviewIdSearchResult, pageId, questionId);
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return null;
	}
}

public string ExtSurveyAnswerID(int extSurveyId, string pageId, string questionId)
{
	return ExtSurveyAnswerID(extSurveyId, pageId, questionId, new int[] { 18 });
}

private string[] ExtSurveyAnswerIDs(int extSurveyId, string pageId, string questionId, int[] statuses)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
		return _dbWrapper.DataAnswerSelectedId((int)extInterviewIdSearchResult, pageId, questionId).ToArray();
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return null;
	}
}

private string[] ExtSurveyAnswerIDs(int extSurveyId, string pageId, string questionId)
{
	return ExtSurveyAnswerIDs(extSurveyId, pageId, questionId, new int[] { 18 });
}

public int ExtSurveyAnswerCount(int extSurveyId, string pageId, string questionId, int[] statuses)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
		return _dbWrapper.DataAnswerGetCount((int)extInterviewIdSearchResult, pageId, questionId);
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return -1;
	}
}

public int ExtSurveyAnswerCount(int extSurveyId, string pageId, string questionId)
{
	return ExtSurveyAnswerCount(extSurveyId, pageId, questionId, new int[] { 18 });
}

public int ExtSurveyInterviewID(int extSurveyId, int[] statuses)
{
	return (int)_dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
}

public int ExtSurveyInterviewID(int extSurveyId)
{
	return ExtSurveyInterviewID(extSurveyId, new int[] { 18 });
}

public string ExtSurveyRespondent(int extSurveyId, int[] statuses)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
		return _dbWrapper.GetExtSurveyRespondent((int)extInterviewIdSearchResult);
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return null;
	}
}

public string ExtSurveyRespondent(int extSurveyId)
{
	return ExtSurveyRespondent(extSurveyId, new int[] { 18 });
}

public int ExtSurveyInterviewStatus(int extSurveyId, int[] statuses)
{
	var extInterviewIdSearchResult = _dbWrapper.GetExtSurveyInterviewID(extSurveyId, statuses);
	if (extInterviewIdSearchResult > 0)
		return _dbWrapper.GetExtSurveyInterviewStatus((int)extInterviewIdSearchResult);
	else
	{
		ExtSurveyInterviewSerchResultCeck(extSurveyId, extInterviewIdSearchResult);
		return -1;
	}
}

public int ExtSurveyInterviewStatus(int extSurveyId)
{
	return ExtSurveyInterviewStatus(extSurveyId, new int[] { 18 });
}

//end https://github.com/tinchurin/survey.engine/issues/345

public bool AnswerExistsForRange(string questionId, string srcRange, LogicalOperator oper)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Question", questionId}});

	char replacementSymbol = '&';
	switch (oper)
	{
		case LogicalOperator.Or:
			replacementSymbol = '|';
			break;
		case LogicalOperator.Xor:
			replacementSymbol = '^';
			break;
	}

	Range range = new Range(QuestionType.Integer, srcRange.Replace(',', replacementSymbol));

	bool ret = (oper == LogicalOperator.Or ? false : true);

	var answers = _dbWrapper.DataAnswerSelectList(CurrentInterview, String.Empty, questionId);

	List<int> resultAnswers = new List<int>();

	foreach (var answer in answers)
	{
		switch (oper)
		{
			case LogicalOperator.And:
				resultAnswers.Add(Common.GetInt32Value(answer[0]));
				//ret &= range.IsInRange(Common.GetInt32Value(dr["ResultAnswer"].ToString()), oper);
				break;
			case LogicalOperator.Or:
				ret |= range.IsInRange(Common.GetInt32Value(answer[0]));
				break;
			case LogicalOperator.Xor:
				break;
			default:
				break;
		}
	}

	if (oper == LogicalOperator.And)
	{
		foreach (var item in range.Sequence)
		{
			if (item is SingleValue && ((SingleValue)item).Value is Int32)
				ret &= resultAnswers.Contains((Int32)((SingleValue)item).Value);
		}
	}

	return ret;
}

public bool AnswerExistsAny(string questionId, string srcRange)
{
	return this.AnswerExistsForRange(questionId, srcRange, LogicalOperator.Or);
}
public bool AnswerExistsAll(string questionId, string srcRange)
{
	return this.AnswerExistsForRange(questionId, srcRange, LogicalOperator.And);
}

public bool AnswerExistsOnce(string pageId, string questionId, int answerStart, int answerEnd)
{
	bool ret = false;
	for (int i = answerStart; i <= answerEnd; i++)
	{
		if (AnswerExists(pageId, questionId, i.ToString()))
		{
			if (ret) return false;
			else ret = true;
		}
	}
	return ret;
}
public bool AnswerExistsOnce(string questionId, int answerStart, int answerEnd)
{
	bool ret = false;
	for (int i = answerStart; i <= answerEnd; i++)
	{
		if (AnswerExists(questionId, i.ToString()))
		{
			if (ret) return false;
			else ret = true;
		}
	}
	return ret;
}

public string AnswerID(string pageId, string questionId)
{
	Common.ValidateAnswerID(questionId, pageId);

	return this.AnswerMarked(pageId, questionId);
}
public string AnswerID(string questionId)
{
	Common.ValidateAnswerID(questionId);
	return this.AnswerMarked(questionId);
}

#endregion

public bool AnswerExists(string pageId, string questionId, string answerId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId},
	{"Question", questionId},
	{"Answer", answerId}});

	Common.ValidateAnswerExists(pageId, questionId, answerId);
	return _dbWrapper.DataResultGet(CurrentInterview, pageId, questionId, answerId).Found;
}
public bool AnswerExists(string questionId, string answerId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Question", questionId},
		{"Answer", answerId}});

	Common.ValidateAnswerExists(questionId, answerId);
	return _dbWrapper.DataResultGet(CurrentInterview, questionId, answerId).Found;
}

public bool ExtAnswerExists(int surveyId, string pageId, string questionId, string answerId)
{
	return _dbWrapper.DataExtResultGet(CurrentInterview, surveyId, pageId, questionId, answerId).Found;
}
public bool ExtAnswerExists(int surveyId, string questionId, string answerId)
{
	return _dbWrapper.DataExtResultGet(CurrentInterview, surveyId, questionId, answerId).Found;
}

public bool ExtInterviewAnswerExists(int extInterviewId, string pageId, string questionId, string answerId)
{
	return _dbWrapper.DataExtInterviewResultGet(extInterviewId, pageId, questionId, answerId).Found;
}

public bool ExtInterviewAnswerExists(int extInterviewId, string questionId, string srcRangeOrNot)
{
	return _dbWrapper.DataExtInterviewResultGet(extInterviewId, questionId, srcRangeOrNot).Found;
}

public bool ExtInterviewAnswerExistsForRange(int externalInterview, string questionId, string srcRange, LogicalOperator logicalOperator)
{
	char replacementSymbol = '&';
	switch (logicalOperator)
	{
		case LogicalOperator.Or:
			replacementSymbol = '|';
			break;
		case LogicalOperator.Xor:
			replacementSymbol = '^';
			break;
	}

	bool ret = !(logicalOperator == LogicalOperator.Or);
	Range range = new Range(QuestionType.Integer, srcRange.Replace(',', replacementSymbol));

	string[] ids = Common.GetAnswerIdArray(range);

	foreach (string id in ids)
	{
		if (logicalOperator == LogicalOperator.Or)
			ret |= ExtInterviewAnswerExists(externalInterview, questionId, id);
		else
			ret &= ExtInterviewAnswerExists(externalInterview, questionId, id);
	}

	return ret;
}
public bool ExtInterviewAnswerExistsAny(int externalInterview, string questionId, string srcRange)
{
	return this.ExtInterviewAnswerExistsForRange(externalInterview, questionId, srcRange, LogicalOperator.Or);
}
public bool ExtInterviewAnswerExistsAny(int externalInterview, string pageId, string questionId, string srcRange)
{
	return this.ExtInterviewAnswerExistsForRange(externalInterview, questionId, srcRange, LogicalOperator.Or);
}

public bool ExtInterviewAnswerExistsAll(int externalInterview, string questionId, string srcRange)
{
	return this.ExtInterviewAnswerExistsForRange(externalInterview, questionId, srcRange, LogicalOperator.And);
}

private void CheckRotation(string pageId, string questionId, string answerId, string val)
{
	Dictionary<string, string> ids = new Dictionary<string, string>();
	if (!String.IsNullOrEmpty(pageId))
	{
		ids.Add("Page", pageId);
	}
	if (!String.IsNullOrEmpty(questionId))
	{
		ids.Add("Question", questionId);
	}
	if (!String.IsNullOrEmpty(answerId))
	{
		ids.Add("Answer", answerId);
	}
	Common.ValidateID(ids);

	if (CurrentSurvey == null || String.IsNullOrEmpty(val) || CurrentQuestion == null)
		return;

	string totalPage = pageId;
	if (String.IsNullOrEmpty(pageId) && CurrentSurvey.QuestionPage != null && CurrentSurvey.QuestionPage.ContainsKey(questionId))
		totalPage = CurrentSurvey.QuestionPage[questionId];

	if (String.IsNullOrEmpty(totalPage))
		return;

	string totalQuestion = questionId;
	string totalAnswer = answerId;

	if (String.IsNullOrEmpty(totalQuestion) || String.IsNullOrEmpty(totalAnswer))
		return;

	if (CurrentSurvey.Pages[totalPage] == null || !CurrentSurvey.Pages[totalPage].HasStore)
		return;

	bool isContinue = false;
	string src = String.Empty;

	foreach (Question q in CurrentSurvey.Pages[totalPage].Questions)
		if (q.Store == totalQuestion)
		{
			src = "__" + q.ID;
			isContinue = true;
			break;
		}

	if (!isContinue)
		return;

	if (!AnswerExists("__rotation", src, CurrentQuestion.ID))
		AnswerInsert("__rotation", src, CurrentQuestion.ID, val);
}

public string AnswerValue(string pageId, string questionId, string answerId)
{
	Dictionary<string, string> ids = new Dictionary<string, string>();
	if (!String.IsNullOrEmpty(pageId))
	{
		ids.Add("Page", pageId);
	}
	if (!String.IsNullOrEmpty(questionId))
	{
		ids.Add("Question", questionId);
	}
	if (!String.IsNullOrEmpty(answerId))
	{
		ids.Add("Answer", answerId);
	}
	Common.ValidateID(ids);

	var result = _dbWrapper.DataResultGet(CurrentInterview, pageId, questionId, answerId);
	if (result.Found)
	{
		CheckRotation(pageId, questionId, answerId, result.Value);
		return result.Value;
	}
	else
		return String.Empty;
}
public string AnswerValue(string questionId, string answerId)
{
	var result = _dbWrapper.DataResultGet(CurrentInterview, questionId, answerId);
	if (result.Found)
	{
		CheckRotation(String.Empty, questionId, answerId, result.Value);
		return result.Value;
	}
	else
		return String.Empty;
}

public string ExtAnswerID(int surveyId, string pageId, string questionId)
{
	var result = _dbWrapper.DataExtResultGet(CurrentInterview, surveyId, pageId, questionId, String.Empty);
	return result.Found ? result.Value : String.Empty;
}

public string ExtAnswerID(int surveyId, string questionId)
{
	var result = _dbWrapper.DataExtResultGet(CurrentInterview, surveyId, questionId, String.Empty);
	return result.Found ? result.Value : String.Empty;
}

public string ExtAnswerValue(int surveyId, string pageId, string questionId, string answerId)
{
	var result = _dbWrapper.DataExtResultGet(CurrentInterview, surveyId, pageId, questionId, answerId);
	return result.Found ? result.Value : String.Empty;
}
public string ExtAnswerValue(int surveyId, string questionId, string answerId)
{
	var result = _dbWrapper.DataExtResultGet(CurrentInterview, surveyId, questionId, answerId);
	return result.Found ? result.Value : String.Empty;
}

public string ExtInterviewAnswerValue(int extInterviewId, string pageId, string questionId, string answerId)
{
	var result = _dbWrapper.DataExtInterviewResultGet(extInterviewId, pageId, questionId, answerId);
	return result.Found ? result.Value : String.Empty;
}
public string ExtInterviewAnswerValue(int extInterviewId, string questionId, string answerId)
{
	var result = _dbWrapper.DataExtInterviewResultGet(extInterviewId, questionId, answerId);
	return result.Found ? result.Value : String.Empty;
}

public int ExtInterview(int extSurveyId, string questionId, string answerId, string val)
{
	return _dbWrapper.DataExtInterviewGet(extSurveyId, questionId, answerId, val);
}

public int ExtInterview(int extSurveyId, string interviewRespondent)
{
	return _dbWrapper.DataExtInterviewGet(extSurveyId, interviewRespondent);
}

private int[] ExtInterviews(int extSurveyId, int statusId, string questionId, string answerId, string val)
{
	return _dbWrapper.DataExtInterviewsGet(extSurveyId, statusId, questionId, answerId, val);
}

private int[] ExtInterviews(int extSurveyId, int statusId, string questionId, string answerId)
{
	return _dbWrapper.DataExtInterviewsGet(extSurveyId, statusId, questionId, answerId, String.Empty);
}

private int[] ExtInterviews(int extSurveyId, string questionId, string answerId, string val)
{
	return _dbWrapper.DataExtInterviewsGet(extSurveyId, -1, questionId, answerId, val);
}

private int[] ExtInterviews(int extSurveyId, string questionId, string answerId)
{
	return _dbWrapper.DataExtInterviewsGet(extSurveyId, -1, questionId, answerId, String.Empty);
}

private bool[] ExtInterviewsAnswerExists(int[] interviewList, int statusId, string pageId, string questionId, string answerId)
{
	return _dbWrapper.DataInterviewListAnswerExists(interviewList, statusId, pageId, questionId, answerId);
}

private bool[] ExtInterviewsAnswerExists(int[] interviewList, string pageId, string questionId, string answerId)
{
	return _dbWrapper.DataInterviewListAnswerExists(interviewList, pageId, questionId, answerId);
}

private string[] ExtInterviewsAnswerValue(int[] interviewList, int statusId, string pageId, string questionId, string answerId)
{
	return _dbWrapper.DataInterviewListAnswerValue(interviewList, statusId, pageId, questionId, answerId);
}

private string[] ExtInterviewsAnswerValue(int[] interviewList, string pageId, string questionId, string answerId)
{
	return _dbWrapper.DataInterviewListAnswerValue(interviewList, pageId, questionId, answerId);
}

private string[] ExtInterviewsAnswerId(int[] interviewList, int statusId, string pageId, string questionId)
{
	return _dbWrapper.DataInterviewListAnswerId(interviewList, statusId, pageId, questionId);
}

private string[] ExtInterviewsAnswerId(int[] interviewList, string pageId, string questionId)
{
	return _dbWrapper.DataInterviewListAnswerId(interviewList, pageId, questionId);
}

public int AnswerCount(string pageId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId}});

	return _dbWrapper.DataAnswerGetCount(CurrentInterview, pageId);
}

public int AnswerCount(string pageId, string questionId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId},
	{"Question", questionId}});

	return _dbWrapper.DataAnswerGetCount(CurrentInterview, pageId, questionId);
}

public int AnswerCountRange(string questionId, string srcRange)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Question", questionId}});

	char replacementSymbol = '|';
	Range range = new Range(QuestionType.Integer, srcRange.Replace(',', replacementSymbol));

	var answers = _dbWrapper.DataAnswerSelectList(CurrentInterview, String.Empty, questionId);

	return answers.Where(x => range.IsInRange(Common.GetInt32Value(x[0]))).Count();
}

public string AnswerMarked(string pageId, string questionId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId},
	{"Question", questionId}});

	var result = _dbWrapper.DataAnswerMarked(CurrentInterview, pageId, questionId);
	return result.Found ? result.Value : String.Empty;
}

public string AnswerMarked(string questionId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Question", questionId}});

	var result = _dbWrapper.DataAnswerMarked(CurrentInterview, questionId);
	return result.Found ? result.Value : String.Empty;
}

public bool DataExists(int index, string val)
{
	return _dbWrapper.DataCustomDataExist(index, val);
}

private string[] DataGetCustom(int index, string value)
{
	return _dbWrapper.DataCustomGetIndexValue(index, value);
}

private string[][] DataGetCustoms(int index, string value)
{
	return _dbWrapper.DataCustomGetIndexValues(index, value);
}

private string[][] DataGetCustoms(string value)
{
	return _dbWrapper.DataCustomGetSurveyIdValues(CurrentSurvey.ID, value);
}

private string[] DataGetCustomSingleRandom(int index, int key, int updateKey)
{
	return _dbWrapper.DataCustomGetIndexKeySingleRandom(index, key, updateKey);
}

private string[] DataGetCustomSingleRandomWithConditions(int index, int key, int updateKey, string[] conditions)
{
	return _dbWrapper.DataCustomGetIndexKeySingleRandomWithConditions(index, key, updateKey, conditions);
}

public double QuotaLimit(string quotaId)
{
	Common.ValidateQuotaID(quotaId);
	if (CurrentSurvey.Settings.QuotaType.GetVersion() == SurveyQuotaVersion.Version2)
		return _db.DataQuotaGetLimit(CurrentSurvey.ID, quotaId);
	return AsyncHelpers.RunSync(async () => await QuotaSharedService.CountQuotaLimitAsync(quotaId, CurrentSurvey.ID));
}

public double QuotaLimit(int surveyId, string quotaId)
{
	Common.ValidateQuotaID(quotaId);
	if (CurrentSurvey.Settings.QuotaType.GetVersion() == SurveyQuotaVersion.Version2)
		return _db.DataQuotaGetLimit(surveyId, quotaId);
	return AsyncHelpers.RunSync(async () => await QuotaSharedService.CountQuotaLimitAsync(quotaId, surveyId));
}

public bool QuotaIsOpen(string quotaId)
{
	return QuotaLimit(quotaId) > QuotaCount(quotaId);
}

public bool QuotaIsOpen(int surveyId, string quotaId)
{
	return QuotaLimit(surveyId, quotaId) > QuotaCount(surveyId, quotaId);
}

public bool IsEmailCorrect(string email)
{
	Regex RegEmail = new Regex(@"\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*", RegexOptions.None);
	return RegEmail.IsMatch(email);
}

public string GetAnswerID(string pageId, string questionId, string val)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId},
	{"Question", questionId}});

	var result = _dbWrapper.DataAnswerIdByValueGet(CurrentInterview, pageId, questionId, val);
	return result.Found ? result.Value : String.Empty;
}

public string GetAnswerID(string questionId, string val)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Question", questionId}});

	var result = _dbWrapper.DataAnswerIdByValueGet(CurrentInterview, questionId, val);
	return result.Found ? result.Value : String.Empty;
}

public string WriteFlash(string id, int width, int height, string filePath, string flashVars)
{
	string script = String.Empty;
	script += "<object " + (id == String.Empty ? String.Empty : "id='" + id + "' ") + "classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' codebase='http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0' width='" + width.ToString() + "' height='" + height.ToString() + "' id='WINT' align='middle'>\n\r";
	script += "<param name='allowScriptAccess' value='sameDomain' />\n\r";
	script += "<param name='movie' value='" + filePath + "' />\n\r";
	script += "<param name='FlashVars' value='" + flashVars + "' />\n\r";
	script += "<param name='quality' value='high' />\n\r";
	script += "<param name='bgcolor' value='#ffffff' />\n\r";
	script += "<param name='swliveconnect' value='true' />\n\r";
	script += "<embed " + (id == String.Empty ? String.Empty : "name='" + id + "' ") + "src='" + filePath + "' FlashVars='" + flashVars + "' quality='high' bgcolor='#ffffff' width='" + width.ToString() + "' height='" + height.ToString() + "' name='WINT' align='middle' allowScriptAccess='sameDomain' type='application/x-shockwave-flash' pluginspage='http://www.macromedia.com/go/getflashplayer' swliveconnect='true' /></object>";
	return script;
}

public string WriteFlash(int width, int height, string filePath, string flashVars)
{
	return WriteFlash(String.Empty, width, height, filePath, flashVars);
}

private string[][] QuestionResults(string pageId, string questionId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId},
	{"Question", questionId}});

	return _dbWrapper.DataQuestionSelectedIdValue(CurrentInterview, pageId, questionId).ToArray();
}

private string[][] QuestionResults(int interviewId, string pageId, string questionId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId},
	{"Question", questionId}});

	return _dbWrapper.DataQuestionSelectedIdValue(interviewId, pageId, questionId).ToArray();
}

private string[] AnswerIDs(string pageId, string questionId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId},
	{"Question", questionId}});

	return _dbWrapper.DataAnswerSelectedId(CurrentInterview, pageId, questionId).ToArray();
}

private string[] AnswerIDs(int interviewId, string pageId, string questionId)
{
	return _dbWrapper.DataAnswerSelectedId(interviewId, pageId, questionId).ToArray();
}

private DataView AnswersSelect(string pageId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId}});

	return _db.DataAnswerSelectList(CurrentInterview, pageId);
}

private DataView AnswersSelect(string pageId, string questionId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId},
	{"Question", questionId}});

	return _db.DataAnswerSelectList(CurrentInterview, pageId, questionId);
}

public string AnswerText(string pageId, string questionId, string answerId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId},
	{"Question", questionId},
	{"Answer", answerId}});

	string ret = String.Empty;

	try
	{
		if (CurrentSurvey != null &&
				CurrentSurvey.Pages != null && CurrentSurvey.Pages.Contains(pageId) &&
				CurrentSurvey.Pages[pageId].Questions != null && CurrentSurvey.Pages[pageId].Questions.Contains(questionId) &&
				CurrentSurvey.Pages[pageId].Questions[questionId].Answers != null && CurrentSurvey.Pages[pageId].Questions[questionId].Answers.Contains(answerId)
			)
			return CurrentSurvey.Pages[pageId].Questions[questionId].Answers[answerId].Text;
	}
	catch { ret = String.Empty; }

	return ret;
}

public string QuestionText(string pageId, string questionId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId},
	{"Question", questionId}});

	return CurrentSurvey.Pages[pageId].Questions[questionId].Text;
}

public string QuestionHeader(string pageId, string questionId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId},
	{"Question", questionId}});

	return CurrentSurvey.Pages[pageId].Questions[questionId].Header;
}

public string PageHeader(string pageId)
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId}});

	return CurrentSurvey.Pages[pageId].Header;
}

public string[] GetMixOrder(string mixId)
{
	Common.ValidateMixID(mixId);
	string ret = _db.DataResultGetValue(InterviewPars.GetInstance().InterviewId, mixId + "_I", "1");

	if (ret != null)
		return ret.Split(';');
	else
		return new string[0];
}
public bool GetInvValue(string invId)
{
	Common.ValidateInvId(invId);
	Block block = null;
	Survey survey = CurrentSurvey;

	block = survey.InnerBlocks.Items.FirstOrDefault(x => x.Value.InvId == invId).Value;

	if (block != null)
	{
		var result = _dbWrapper.DataResultGet(InterviewPars.GetInstance().InterviewId, block.ID + "_Inv", "1");
		bool ret;
		if (result.Found)
			if (Boolean.TryParse(result.Value, out ret)) return ret;
	}
	return false;
}
public string MixItera(int defaultItera)
{
	try
	{
		if (CurrentSurvey.Settings.UseNewMix)
		{
			string itemId = InterviewPars.GetInstance().PageId;

			string blockId = CurrentSurvey.Pages[itemId].BlockID;
			if (!String.IsNullOrEmpty(blockId))
			{
				MixBlock block = InterviewPars.GetInstance().MixIteraBlocks.FirstOrDefault(x => x.ID == blockId);
				if (block != null)
				{
					for (int i = 0; i <= Math.Abs(defaultItera); i++)
					{
						while (block.ParentBlock != null && !block.InnerMix)
						{
							itemId = block.ID;
							block = block.ParentBlock;
						}
					}

					return (block.MixedItems.IndexOf(itemId) + 1).ToString();
				}

			}
		}
		else
		{
			if (CurrentSurvey.MixPageParent.ContainsKey(InterviewPars.GetInstance().PageId))
			{
				Mix mix = CurrentSurvey.Mixs[CurrentSurvey.MixPageParent[InterviewPars.GetInstance().PageId]];
				if (mix != null)
				{
					string itera = AnswerValue("__SurveyMixes", mix.ID + "_I", InterviewPars.GetInstance().PageId);
					return String.IsNullOrEmpty(itera) ? defaultItera.ToString() : itera;
				}
			}

			if (CurrentSurvey.BlockPageParent.ContainsKey(InterviewPars.GetInstance().PageId))
			{
				Block block = CurrentSurvey.Blocks[CurrentSurvey.BlockPageParent[InterviewPars.GetInstance().PageId]];
				if (block != null && CurrentSurvey.MixBlockParent.ContainsKey(block.ID))
				{
					Mix mix = CurrentSurvey.Mixs[CurrentSurvey.MixBlockParent[block.ID]];
					if (mix != null)
					{
						string itera = AnswerValue("__SurveyMixes", mix.ID + "_I", block.ID);
						return String.IsNullOrEmpty(itera) ? defaultItera.ToString() : itera;
					}
				}
			}

			if (CurrentAnswer != null && CurrentQuestion != null)
			{
				string questionId = CurrentQuestion.ID;

				string qaRaw = _db.StateQAGetLog(InterviewPars.GetInstance().InterviewId, CurrentSurvey.Pages[CurrentSurvey.QuestionPage[questionId]].ID);
				if (!String.IsNullOrEmpty(qaRaw))
				{
					string[] qaData = qaRaw.Split(';');
					string[] answers = Common.CutAnswerData(qaData, questionId).Split(',');

					return (Array.IndexOf<string>(answers, CurrentAnswer.ID) + 1).ToString();
				}
			}
		}
	}

	catch { }

	return defaultItera.ToString();
}

public string BlockItera(int defaultItera)
{
	try
	{
		string blockId = CurrentSurvey.BlockPageParent[InterviewPars.GetInstance().PageId];
		Mix mix = CurrentSurvey.Mixs[CurrentSurvey.MixBlockParent[blockId]];
		string itera = AnswerValue("__SurveyMixes", mix.ID + "_I", blockId);
		return String.IsNullOrEmpty(itera) ? defaultItera.ToString() : itera;
	}
	catch
	{
		return defaultItera.ToString();
	}
}

public string PlayAudio(string audioPath, bool autoPlay)
{
	string ret = String.Empty;
	string rootUrl = (Request != null ? "//" + Request.Url.Host + (Request.Url.Port != 80 ? ":" + Request.Url.Port.ToString() : String.Empty) + Request.ApplicationPath : "/");
	if (!rootUrl.EndsWith("/"))
		rootUrl += "/";

	ret = "<object type=\"application/x-shockwave-flash\" data=\"" + rootUrl + "players/ump3player_500x70.swf\" height=\"70\" width=\"470\"><param name=\"wmode\" VALUE=\"transparent\" /><param name=\"allowFullScreen\" value=\"true\" /><param name=\"allowScriptAccess\" value=\"always\" /><param name=\"movie\" value=\"" + rootUrl + "players/ump3player_500x70.swf\" /><param name=\"FlashVars\" value=\"way=" + audioPath + "&amp;swf=" + rootUrl + "players/ump3player_500x70.swf&amp;w=470&amp;h=70&amp;time_seconds=0&amp;autoplay=" + (autoPlay ? "1" : "0") + "&amp;q=&amp;skin=white&amp;volume=70&amp;comment=\" /></object>";
	return ret;
}

public string PlayAudio(string audioPath)
{
	return PlayAudio(audioPath, false);
}

public string PlayVideo(string videoPath, string splashPath)
{
	string ret = String.Empty;
	string rootUrl = (Request != null ? "//" + Request.Url.Host + (Request.Url.Port != 80 ? ":" + Request.Url.Port.ToString() : String.Empty) + Request.ApplicationPath : "/");
	if (!rootUrl.EndsWith("/"))
		rootUrl += "/";

	ret = "<object type=\"application/x-shockwave-flash\" data=\"" + rootUrl + "Players/uflvplayer_500x375.swf\" height=\"480\" width=\"640\"><param name=\"bgcolor\" value=\"#FFFFFF\" /><param name=\"allowFullScreen\" value=\"true\" /><param name=\"allowScriptAccess\" value=\"always\" /><param name=\"movie\" value=\"" + rootUrl + "Players/uflvplayer_500x375.swf\" /><param name=\"FlashVars\" value=\"way=" + videoPath + "&amp;swf=" + rootUrl + "Players/uflvplayer_500x375.swf&amp;w=640&amp;h=480&amp;pic=" + splashPath + "&amp;autoplay=1&amp;tools=0&amp;skin=white&amp;volume=70&amp;q=1&amp;comment=\" /></object>";
	return ret;
}

public string PlayVideo(string videPath)
{
	return PlayVideo(videPath, String.Empty);
}

private DateResult GetDateDiff(DateTime currentDate, DateTime subtractDate)
{
	DateResult ret = new DateResult();

	TimeSpan subVal = currentDate.Subtract(subtractDate);
	DateTime diff = DateTime.MinValue + subVal;

	ret.Year = diff.Year - 1;
	ret.Month = diff.Month - 1;

	return ret;
}

private DateResult GetAge(DateTime subtractDate)
{
	return this.GetDateDiff(DateTime.Now, subtractDate);
}

public int GetInt(string rawValue, int def = -1000)
{
	int res = Common.GetInt32Value(rawValue);
	if (res == Int32.MinValue) return def;
	return res;
}

public int TryGetInt(string rawValue)
{
	return Common.GetInt32Value(rawValue);
}

private double GetDouble(string rawValue)
{
	return Common.GetDoubleValue(rawValue);
}

private float GetFloat(string rawValue)
{
	return Common.GetFloatValue(rawValue);
}

private DateTime GetDateTime(string rawValue)
{
	return Common.GetDateTimeValue(rawValue);
}

private DateTime InterviewStartDate()
{
	return _db.InterviewGetStartDate(InterviewPars.GetInstance().InterviewId);
}

public string ListText(string listId, string itemId)
{
	Common.ValidateID(new Dictionary<string, string>() { { "List", listId }, { "ListItem", itemId } });

	if (CurrentSurvey != null && CurrentSurvey.Lists.Contains(listId) && CurrentSurvey.Lists[listId].Items.Contains(itemId))
		return CurrentSurvey.Lists[listId].Items[itemId].Text;

	return String.Empty;
}

private void MailSend(string recipient, string body, string subject)
{
	_db.StaffMailSend(recipient, body, subject);
}

private void MailSend(string recipient, string recipientBlind, string body, string subject)
{
	_db.StaffMailSend(recipient, recipientBlind, body, subject);
}

private void MailSend(string mailFrom, string recipient, string recipientBlind, string body, string subject, string attachments)
{
	Task.Factory.StartNew(() =>
	{
		SmtpClient smtp = new SmtpClient("post.survstat.ru");
		MailMessage mail = new MailMessage(mailFrom, recipient, subject, body);
		if (!string.IsNullOrEmpty(recipientBlind))
		{
			foreach (string bccAdress in recipientBlind.Split(';'))
			{
				mail.Bcc.Add(bccAdress);
			}
		}
		if (!string.IsNullOrEmpty(attachments))
		{
			foreach (string attachment in attachments.Split(';'))
			{
				mail.Attachments.Add(new Attachment(attachment));
			}
		}
		smtp.Send(mail);
	});
}

public string GetListItemVar(string listId, string itemId, int varIndex)
{
	Common.ValidateID(new Dictionary<string, string>() { { "List", listId }, { "ListItem", itemId }, { "ListItemVar", varIndex.ToString() } });

	string ret = "__" + Guid.NewGuid().ToString();

	//if (!String.IsNullOrEmpty(listId) && !String.IsNullOrEmpty(itemId) && CurrentSurvey != null && CurrentSurvey.Lists != null && CurrentSurvey.Lists.Contains(listId) && CurrentSurvey.Lists[listId].Items != null && CurrentSurvey.Lists[listId].Items.Contains(itemId) && CurrentSurvey.Lists[listId].Items[itemId].Vars != null && CurrentSurvey.Lists[listId].Items[itemId].Vars.Length > varIndex)
	ret = CurrentSurvey.Lists[listId].Items[itemId].Vars[varIndex];

	return ret;
}

public string GetListItemVar(string listId, int itemIndex, int varIndex)
{
	Common.ValidateID(new Dictionary<string, string>() { { "List", listId }, { "ListItemIndex", itemIndex.ToString() }, { "ListItemVar", varIndex.ToString() } });

	string ret = "__" + Guid.NewGuid().ToString();

	//if (!String.IsNullOrEmpty(listId) && itemIndex >= 0 && CurrentSurvey != null && CurrentSurvey.Lists != null && CurrentSurvey.Lists.Contains(listId) && CurrentSurvey.Lists[listId].Items != null && CurrentSurvey.Lists[listId].Items[itemIndex] != null && CurrentSurvey.Lists[listId].Items[itemIndex].Vars != null && CurrentSurvey.Lists[listId].Items[itemIndex].Vars.Length > varIndex)
	ret = CurrentSurvey.Lists[listId].Items[itemIndex].Vars[varIndex];

	return ret;
}

public string GetListItemText(string listId, string itemId)
{
	Common.ValidateID(new Dictionary<string, string>() { { "List", listId }, { "ListItem", itemId } });

	string ret = "__" + Guid.NewGuid().ToString();

	//if (!String.IsNullOrEmpty(listId) && !String.IsNullOrEmpty(itemId) && CurrentSurvey != null && CurrentSurvey.Lists != null && CurrentSurvey.Lists.Contains(listId) && CurrentSurvey.Lists[listId].Items != null && CurrentSurvey.Lists[listId].Items.Contains(itemId))
	ret = CurrentSurvey.Lists[listId].Items[itemId].Text;

	return ret;
}

public string GetListItemText(string listId, int itemIndex)
{
	Common.ValidateID(new Dictionary<string, string>() { { "List", listId }, { "ListItemIndex", itemIndex.ToString() } });

	string ret = "__" + Guid.NewGuid().ToString();

	//if (!String.IsNullOrEmpty(listId) && itemIndex >= 0 && CurrentSurvey != null && CurrentSurvey.Lists != null && CurrentSurvey.Lists.Contains(listId) && CurrentSurvey.Lists[listId].Items != null && CurrentSurvey.Lists[listId].Items[itemIndex] != null)
	ret = CurrentSurvey.Lists[listId].Items[itemIndex].Text;

	return ret;
}

private void AuthCookieReset()
{
	if (Request == null || Request.Cookies == null)
		return;
	HttpCookie cookie = (HttpCookie)Request.Cookies["survey.survstat." + InterviewPars.GetInstance().ProjectId];
	if (cookie != null)
	{
		cookie.Expires = DateTime.Now.AddYears(-1);
		if (Response != null && Response.Cookies != null)
		{
			Response.Cookies.Add(cookie);
			if (Session != null)
			{
				Response.Cookies["ASP.NET_SessionId"].Expires = DateTime.Now.AddYears(-1);
				Session.Abandon();
			}
		}
	}
}

public string getRedirectUrl()
{
	string redirectUrl = String.Empty;
	string redirectParams = String.Empty;

	if (CurrentSurvey.DefaultParams.Count > 0)
	{
		redirectUrl = CurrentSurvey.DefaultParams[CurrentSurvey.DefaultParams.Count - 1].RedirectUrl;
		if (!String.IsNullOrEmpty(redirectUrl))
		{
			if (CurrentSurvey.Lists.Contains(CurrentSurvey.DefaultParams[CurrentSurvey.DefaultParams.Count - 1].RedirectParamsList))
			{
				foreach (SurveyListItem item in CurrentSurvey.Lists[CurrentSurvey.DefaultParams[CurrentSurvey.DefaultParams.Count - 1].RedirectParamsList].Items.Items.Values)
				{
					if (!String.IsNullOrEmpty(item.Text))
						redirectParams += item.ID + "=" + item.Text + "&";
				}
				if (!String.IsNullOrEmpty(redirectParams))
					redirectParams = redirectParams.Substring(0, redirectParams.Length - 2);
			}
			return redirectUrl + "/?" + redirectParams;
		}
	}

	return String.Empty;
}

public int GetPageTime(string pageId, string side = "Client")
{
	Common.ValidateID(new Dictionary<string, string>()
	{{"Page", pageId}});

	return _dbWrapper.GetPageTime(InterviewPars.InterviewID, pageId, side);
}

public bool DataHashExist(string hash)
{
	return _db.DataHashExist(hash);
}


public string GetPanelRespData(byte panelId, string RespondentExtID, string fieldName)
{
	return _db.GetPanelRespData(panelId, RespondentExtID, fieldName);
}

public dynamic GetObjectFromJson(string json)
{
	return Common.GetObjectFromJson(json);
}


public string GetFileURL(string questionId, string answerId)
{
	return Common.GetFileURL(questionId, answerId);
}


// ранжирование

public void SetRanges(string selectionQuestion, string rangeQuestionPrefix, string questionForRanges, string listId, string resetAnswers, int rangeForNotChosen = -974527)
{
	var listItems = CurrentSurvey.Lists[listId].Items.ItemsIdArray;
	var answers = AnswerIDs(selectionQuestion, selectionQuestion);
	var selected = listItems.Intersect(answers); /* тут не учитывается другое */
	var notSelected = listItems.Except(answers);

	/* проставляем ранг не выбранным в selectionQuestion */
	var listLength = listItems.Length;
	var rangeValue = 8;
	if (rangeForNotChosen != -974527) rangeValue = rangeForNotChosen;
	else if (listLength > 10) rangeValue = 10;
	else if (listLength < 8) rangeValue = listLength;
	string value = rangeValue.ToString();
	foreach (var item in notSelected)
	{
		AnswerUpdateP(selectionQuestion, questionForRanges, item, value);
	}

	/* проставляем ранги оценённым */
	int selectedCount = selected.Count();
	var ranged = new List<string>();
	var resetAnswersArray = resetAnswers.Split(new char[] { ',' });
	for (int i = 1; i <= selectedCount; i++)
	{
		var currentRange = i.ToString();
		var ans = AnswerID(rangeQuestionPrefix + currentRange);
		if (resetAnswersArray.Contains(ans))
		{ /* Если з.о., то всем остальным проставляется вот такой ранг */
			string resetRange = Math.Ceiling((double)(i + selectedCount) / 2).ToString();
			var selectedNotRanged = selected.Except(ranged);
			foreach (var item in selectedNotRanged)
			{
				AnswerUpdateP(selectionQuestion, questionForRanges, item, resetRange);
			}
			break;
		}
		else
		{
			AnswerUpdateP(selectionQuestion, questionForRanges, ans, currentRange);
			ranged.Add(ans);
		}
	}
}

public bool AnswerEnabledForRanging(string prefix, string answer, int current, int len)
{
	for (int i = 1; i <= len; i++)
	{
		if (i == current) continue;
		if (AnswerExists(prefix + i.ToString(), answer)) return false;
	}
	return true;
}
`;


Object.defineProperty(String.prototype, 'hashCode', {
	value: function() {
	  var hash = 0, i, chr;
	  for (i = 0; i < this.length; i++) {
		chr   = this.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	  }
	  return hash;
	}
});
  

/** Сортировка элементов */
function sortArray(a, b) {
    var aVal = a.Name;
    var bVal = b.Name;
    if (!!a.Documentation && !!b.Documentation) {
        aVal = a.Documentation;
        bVal = b.Documentation;
	}
    return aVal.hashCode() - bVal.hashCode();
}


var res = raw.match(/((public)|(private)|(protected))\s+([^\s]+)\s+((\w+)(\(.*\))?)\n/g);

var ar = [];

var excludeNames = ['GetPanelRespData', 'AnswersSelect', 'ExtInterviewPageDelete', 'ExtAnswerID', 'PlayAudio', 'ExtInterviewResultsDelete', 'ListText', 'BlockItera', 'ExtAnswerValue', 'ExtInterviewQuestionByPageDelete', 'PlayVideo', 'WriteFlash', 'CheckRotation', 'ExtAnswerID', 'ClearResults', 'AnswersSelect', 'ExtInterviewResultsDeleteQuotaV3', 'AnswerMarked', 'ClearResults', 'AuthCookieReset', ]

var redirectProperies = ['Page', 'Status', 'Url'];
var validateProperies = ['Message', 'MessageGeneral', 'PinQuestion', 'PinAnswer'];

res.forEach(function (e)
{
    let obj = {};
	let parse = e.match(/((public)|(private)|(protected))\s+([^\s]+)\s+((\w+)(\(.*\))?)/);
	let name = parse[7];
	if (excludeNames.indexOf(name) > -1) return;
	obj["Name"] = name;
	obj["Detail"] = parse[5];
	let isFunction = !!parse[8];
	obj["Kind"] = isFunction ? "Function" : "Property";
	if (!isFunction) {
		if (redirectProperies.indexOf(name) > -1) {
			obj["ParentTag"] = 'Redirect';
			obj["Parent"] = 'this';
		}
		else if (validateProperies.indexOf(name) > -1) {
			obj["ParentTag"] = 'Validate';
			obj["Parent"] = 'this';
		}
	}	
	obj["Documentation"] = parse[5] + " " + parse[6];
	ar.push(obj);
});

console.log(JSON.stringify(ar.sort(sortArray)));