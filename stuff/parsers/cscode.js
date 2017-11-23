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
public int CurrentInterviewOrder
{
    get
    {
        return _db.StateInterviewGetOrder(CurrentInterview);
    }
}

#region Новые процедуры/функции

public bool InterviewExists(string questionId, string answerId, string val)
{
    return _db.DataInterviewExists(CurrentInterview, questionId, answerId, val);
}
private void AnswerInsert(string pageId, string questionId, string answerId, string val)
{
    _db.DataResultAdd(CurrentInterview, pageId, questionId, answerId, String.IsNullOrEmpty(val) ? "$$s" : val);
}
private void AnswerInsert(string pageId, string questionId, string answerId)
{
    this.AnswerInsert(pageId, questionId, answerId, String.Empty);
}

private void ExtInterviewAnswerInsert(int interviewId, string pageId, string questionId, string answerId, string val)
{
    _db.DataExtResultAdd(interviewId, pageId, questionId, answerId, String.IsNullOrEmpty(val) ? "$$s" : val);
}
private void ExtInterviewAnswerInsert(int interviewId, string pageId, string questionId, string answerId)
{
    this.ExtInterviewAnswerInsert(interviewId, pageId, questionId, answerId, String.Empty);
}

private void ExtInterviewAnswerUpdate(int interviewId, string pageId, string questionId, string answerId, string val)
{
    _db.DataResultUpdate(interviewId, pageId, questionId, answerId, String.IsNullOrEmpty(val) ? "$$s" : val);
}

private void ExtInterviewAnswerDelete(int interviewId, string pageId, string questionId, string answerId)
{
    _db.DataAnswerDelete(interviewId, pageId, questionId, answerId);
}

private void ExtInterviewAnswerDelete(int interviewId, string questionId, string answerId)
{
    _db.DataAnswerDelete(interviewId, questionId, answerId);
}

private void AnswerInsertOnce(string pageId, string questionId, string answerId, string val)
{
    _db.DataResultAddOnce(CurrentInterview, pageId, questionId, answerId, String.IsNullOrEmpty(val) ? "$$s" : val);
}
private void AnswerInsertOnce(string pageId, string questionId, string answerId)
{
    this.AnswerInsertOnce(pageId, questionId, answerId, String.Empty);
}

private void AnswerUpdateP(string pageId, string questionId, string answerId, string val)
{
    if (String.IsNullOrEmpty(pageId))
        _db.DataResultUpdate(CurrentInterview, questionId, answerId, String.IsNullOrEmpty(val) ? null : val);
    else
        _db.DataResultUpdate(CurrentInterview, pageId, questionId, answerId, String.IsNullOrEmpty(val) ? null : val);
}
private void AnswerUpdateP(string pageId, string questionId, string answerId)
{
    this.AnswerUpdateP(pageId, questionId, answerId, String.Empty);
}

private void AnswerUpdate(string questionId, string answerId, string val)
{
    this.AnswerUpdateP(String.Empty, questionId, answerId, val);
}
private void AnswerUpdate(string questionId, string answerId)
{
    this.AnswerUpdateP(String.Empty, questionId, answerId, String.Empty);
}

private void PageClear(string pageId)
{
    _db.DataResultClearList(CurrentInterview, pageId);
}
private void QuestionClear(string questionId)
{
    _db.DataResultClearQuestion(CurrentInterview, questionId);
}
private void QuestionClear(int interviewId, string questionId)
{
    _db.DataResultClearQuestion(interviewId, questionId);
}
private void AnswerClear(string questionId, string answerId)
{
    _db.DataAnswerDelete(CurrentInterview, questionId, answerId);
}

public bool AnswerExistsForRange(string questionId, string srcRange, LogicalOperator oper)
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

    DataView dvAnswers = _db.DataAnswerSelectList(CurrentInterview, String.Empty, questionId);

    foreach (DataRowView dr in dvAnswers)
    {
        if (oper == LogicalOperator.Or)
            ret |= range.IsInRange(Common.GetInt32Value(dr["ResultAnswer"].ToString()));
        else
            ret &= range.IsInRange(Common.GetInt32Value(dr["ResultAnswer"].ToString()));
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
    bool ret = AnswerExists(pageId, questionId, answerStart.ToString());
    for (int i = answerStart + 1; i <= answerEnd; i++)
        ret |= AnswerExists(pageId, questionId, i.ToString());
    return ret;
}
public bool AnswerExistsOnce(string questionId, int answerStart, int answerEnd)
{
    bool ret = AnswerExists(questionId, answerStart.ToString());
    for (int i = answerStart + 1; i <= answerEnd; i++)
        ret |= AnswerExists(questionId, i.ToString());
    return ret;
}

public string AnswerID(string pageId, string questionId)
{
    return this.AnswerMarked(pageId, questionId);
}
public string AnswerID(string questionId)
{
    return this.AnswerMarked(questionId);
}

#endregion

public bool AnswerExists(string pageId, string questionId, string answerId)
{
    Common.ValidateAnswerExists(pageId, questionId, answerId);
    return (_db.DataResultGet(CurrentInterview, pageId, questionId, answerId).Return == 0);
}
public bool AnswerExists(string questionId, string srcRangeOrNot)
{
    /*if (srcRangeOrNot.Contains("[") || srcRangeOrNot.Contains(",") || srcRangeOrNot.Contains(";") || srcRangeOrNot.Contains("|") || srcRangeOrNot.Contains("&") || srcRangeOrNot.Contains("^"))
    {
        return AnswerExistsAny(questionId, srcRangeOrNot);
    }*/
    Common.ValidateAnswerExists(questionId, srcRangeOrNot);
    return (_db.DataResultGet(CurrentInterview, questionId, srcRangeOrNot).Return == 0);
}

public bool ExtAnswerExists(int surveyId, string pageId, string questionId, string answerId)
{
    return (_db.DataExtResultGet(CurrentInterview, surveyId, pageId, questionId, answerId).Return == 0);
}
public bool ExtAnswerExists(int surveyId, string questionId, string answerId)
{
    return (_db.DataExtResultGet(CurrentInterview, surveyId, questionId, answerId).Return == 0);
}

public bool ExtInterviewAnswerExists(int extInterviewId, string pageId, string questionId, string answerId)
{
    return (_db.DataExtInterviewResultGet(CurrentInterview, extInterviewId, pageId, questionId, answerId).Return == 0);
}

public bool ExtInterviewAnswerExists(int extInterviewId, string questionId, string srcRangeOrNot)
{
    /*if (srcRangeOrNot.Contains("[") || srcRangeOrNot.Contains(",") || srcRangeOrNot.Contains(";") || srcRangeOrNot.Contains("|") || srcRangeOrNot.Contains("&") || srcRangeOrNot.Contains("^"))
    {
        return ExtInterviewAnswerExistsAny(extInterviewId, questionId, srcRangeOrNot);
    }*/
    return (_db.DataExtInterviewResultGet(CurrentInterview, extInterviewId, questionId, srcRangeOrNot).Return == 0);
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
    SurveyEngine.Server.DB.ResultValue ret = _db.DataResultGet(CurrentInterview, pageId, questionId, answerId);
    if (ret.Return == 0)
    {
        CheckRotation(pageId, questionId, answerId, ret.Value);
        return ret.Value;
    }
    else
        return String.Empty;
}
public string AnswerValue(string questionId, string answerId)
{
    SurveyEngine.Server.DB.ResultValue ret = _db.DataResultGet(CurrentInterview, questionId, answerId);
    if (ret.Return == 0)
    {
        CheckRotation(String.Empty, questionId, answerId, ret.Value);
        return ret.Value;
    }
    else
        return String.Empty;
}

public string ExtAnswerID(int surveyId, string pageId, string questionId)
{
    SurveyEngine.Server.DB.ResultValue ret = _db.DataExtResultGet(CurrentInterview, surveyId, pageId, questionId, String.Empty);
    if (ret.Return == 0)
        return ret.Value;
    else
        return String.Empty;
}

public string ExtAnswerID(int surveyId, string questionId)
{
    SurveyEngine.Server.DB.ResultValue ret = _db.DataExtResultGet(CurrentInterview, surveyId, questionId, String.Empty);
    if (ret.Return == 0)
        return ret.Value;
    else
        return String.Empty;
}

public string ExtAnswerValue(int surveyId, string pageId, string questionId, string answerId)
{
    SurveyEngine.Server.DB.ResultValue ret = _db.DataExtResultGet(CurrentInterview, surveyId, pageId, questionId, answerId);
    if (ret.Return == 0)
        return ret.Value;
    else
        return String.Empty;
}
public string ExtAnswerValue(int surveyId, string questionId, string answerId)
{
    SurveyEngine.Server.DB.ResultValue ret = _db.DataExtResultGet(CurrentInterview, surveyId, questionId, answerId);
    if (ret.Return == 0)
        return ret.Value;
    else
        return String.Empty;
}

public string ExtInterviewAnswerValue(int extInterviewId, string pageId, string questionId, string answerId)
{
    SurveyEngine.Server.DB.ResultValue ret = _db.DataExtInterviewResultGet(CurrentInterview, extInterviewId, pageId, questionId, answerId);
    if (ret.Return == 0)
        return ret.Value;
    else
        return String.Empty;
}
public string ExtInterviewAnswerValue(int extInterviewId, string questionId, string answerId)
{
    SurveyEngine.Server.DB.ResultValue ret = _db.DataExtInterviewResultGet(CurrentInterview, extInterviewId, questionId, answerId);
    if (ret.Return == 0)
        return ret.Value;
    else
        return String.Empty;
}

public int ExtInterview(int extSurveyId, string questionId, string answerId, string val)
{
    return _db.DataExtInterviewGet(extSurveyId, questionId, answerId, val);
}

public int ExtInterview(int extSurveyId, string interviewRespondent)
{
    return _db.DataExtInterviewGet(extSurveyId, interviewRespondent);
}

private int[] ExtInterviews(int extSurveyId, int statusId, string questionId, string answerId, string val)
{
    return _db.DataExtInterviewsGet(extSurveyId, statusId, questionId, answerId, val);
}

private int[] ExtInterviews(int extSurveyId, int statusId, string questionId, string answerId)
{
    return _db.DataExtInterviewsGet(extSurveyId, statusId, questionId, answerId, String.Empty);
}

private int[] ExtInterviews(int extSurveyId, string questionId, string answerId, string val)
{
    return _db.DataExtInterviewsGet(extSurveyId, -1, questionId, answerId, val);
}

private int[] ExtInterviews(int extSurveyId, string questionId, string answerId)
{
    return _db.DataExtInterviewsGet(extSurveyId, -1, questionId, answerId, String.Empty);
}

private bool[] ExtInterviewsAnswerExists(int[] interviewList, int statusId, string pageId, string questionId, string answerId)
{
    return _db.DataInterviewListAnswerExists(String.Join(",", interviewList), statusId, pageId, questionId, answerId);
}

private bool[] ExtInterviewsAnswerExists(int[] interviewList, string pageId, string questionId, string answerId)
{
    return _db.DataInterviewListAnswerExists(String.Join(",", interviewList), pageId, questionId, answerId);
}

private string[] ExtInterviewsAnswerValue(int[] interviewList, int statusId, string pageId, string questionId, string answerId)
{
    return _db.DataInterviewListAnswerValue(String.Join(",", interviewList), statusId, pageId, questionId, answerId);
}

private string[] ExtInterviewsAnswerValue(int[] interviewList, string pageId, string questionId, string answerId)
{
    return _db.DataInterviewListAnswerValue(String.Join(",", interviewList), pageId, questionId, answerId);
}

private string[] ExtInterviewsAnswerId(int[] interviewList, int statusId, string pageId, string questionId)
{
    return _db.DataInterviewListAnswerId(String.Join(",", interviewList), statusId, pageId, questionId);
}

private string[] ExtInterviewsAnswerId(int[] interviewList, string pageId, string questionId)
{
    return _db.DataInterviewListAnswerId(String.Join(",", interviewList), pageId, questionId);
}

public int AnswerCount(string pageId)
{
    return _db.DataAnswerGetCount(CurrentInterview, pageId);
}

public int AnswerCount(string pageId, string questionId)
{
    return _db.DataAnswerGetCount(CurrentInterview, pageId, questionId);
}

public int AnswerCountRange(string questionId, string srcRange)
{
    int ret = 0;
    char replacementSymbol = '|';
    Range range = new Range(QuestionType.Integer, srcRange.Replace(',', replacementSymbol));

    DataView dvAnswers = _db.DataAnswerSelectList(CurrentInterview, String.Empty, questionId);

    foreach (DataRowView dr in dvAnswers)
    {
        if (range.IsInRange(Common.GetInt32Value(dr["ResultAnswer"].ToString())))
            ret++;
    }

    return ret;
}

private void InsertResult(string pageId, string questionId, string answerId, string val)
{
    _db.DataResultAdd(CurrentInterview, pageId, questionId, answerId, String.IsNullOrEmpty(val) ? "$$s" : val);
}

private void InsertResult(string pageId, string questionId, string answerId)
{
    InsertResult(pageId, questionId, answerId, String.Empty);
}

public string AnswerMarked(string pageId, string questionId)
{
    SurveyEngine.Server.DB.ResultValue ret = _db.DataAnswerMarked(CurrentInterview, pageId, questionId);
    if (ret.Return == 0)
        return ret.Value;
    return String.Empty;
}

public string AnswerMarked(string questionId)
{
    SurveyEngine.Server.DB.ResultValue ret = _db.DataAnswerMarked(CurrentInterview, questionId);
    if (ret.Return == 0)
        return ret.Value;
    return String.Empty;
}

public bool DataExists(int index, string val)
{
    return _db.DataExists(index, val);
}

private string[] DataGetCustom(int index, string value)
{
    return _db.DataCustomGetIndexValue(index, value);
}

private string[][] DataGetCustoms(int index, string value)
{
    return _db.DataCustomGetIndexValues(index, value);
}

private string[] DataGetCustomSingleRandom(int index, int key, int updateKey)
{
    return _db.DataCustomGetIndexKeySingleRandom(index, key, updateKey);
}

private string[] DataGetCustomSingleRandomWithConditions(int index, int key, int updateKey, string[] conditions)
{
    return _db.DataCustomGetIndexKeySingleRandomWithConditions(index, key, updateKey, conditions);
}

private void ClearResults(string pageId)
{
    _db.DataResultClearList(CurrentInterview, pageId);
}

private void ClearResults(string pageId, string questionId)
{
    _db.DataResultClearList(CurrentInterview, pageId, questionId);
}

public int QuotaCount(string quotaId)
{
    return _db.DataQuotaGetCount(CurrentSurvey.ID, quotaId, CurrentInterview);
}

public int QuotaCount(int surveyId, string quotaId)
{
    return _db.DataQuotaGetCount(surveyId, quotaId);
}

public int QuotaCountStatus(string quotaId, int statusId)
{
    return _db.DataQuotaGetCountStatus(CurrentSurvey.ID, quotaId, statusId, CurrentInterview);
}

public int QuotaCountStatus(int surveyId, string quotaId, int statusId)
{
    return _db.DataQuotaGetCountStatus(surveyId, quotaId, statusId);
}

public int QuotaLimit(string quotaId)
{
    return _db.DataQuotaGetLimit(CurrentSurvey.ID, quotaId);
}

public int QuotaLimit(int surveyId, string quotaId)
{
    return _db.DataQuotaGetLimit(surveyId, quotaId);
}

public bool IsEmailCorrect(string email)
{
    Regex RegEmail = new Regex(@"\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*", RegexOptions.None);
    return RegEmail.IsMatch(email);
}

public string GetAnswerID(string pageId, string questionId, string val)
{
    SurveyEngine.Server.DB.ResultValue ret = _db.DataAnswerIdByValueGet(CurrentInterview, pageId, questionId, val);
    if (ret.Return == 0)
        return ret.Value;
    return String.Empty;
}

public string GetAnswerID(string questionId, string val)
{
    SurveyEngine.Server.DB.ResultValue ret = _db.DataAnswerIdByValueGet(CurrentInterview, questionId, val);
    if (ret.Return == 0)
        return ret.Value;
    return String.Empty;
}

public List<string[]> GetSurveyUserMails(int surveyId)
{
    return _db.DataSurveyUserMails(surveyId);
}

private void AnswerDelete(string pageId, string questionId, string answerId)
{
    _db.DataAnswerDelete(CurrentInterview, pageId, questionId, answerId);
}

private void AnswerDelete(string questionId, string answerId)
{
    _db.DataAnswerDelete(CurrentInterview, questionId, answerId);
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
    return _db.DataQuestionSelectedIdValue(CurrentInterview, pageId, questionId);
}

private string[][] QuestionResults(int interviewId, string pageId, string questionId)
{
    return _db.DataQuestionSelectedIdValue(interviewId, pageId, questionId);
}

private string[] AnswerIDs(string pageId, string questionId)
{
    return _db.DataAnswerSelectedId(CurrentInterview, pageId, questionId);
}

private string[] AnswerIDs(int interviewId, string pageId, string questionId)
{
    return _db.DataAnswerSelectedId(interviewId, pageId, questionId);
}

private DataView AnswersSelect(string pageId)
{
    return _db.DataAnswerSelectList(CurrentInterview, pageId);
}

private DataView AnswersSelect(string pageId, string questionId)
{
    return _db.DataAnswerSelectList(CurrentInterview, pageId, questionId);
}

public string AnswerText(string pageId, string questionId, string answerId)
{
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

private void InterviewResultClear()
{
    _db.DataInterviewClearResult(CurrentInterview);
}

private void InterviewStatusChange(int statusId)
{
    _db.DataInterviewChangeStatus(CurrentInterview, statusId);
}

public string QuestionText(string pageId, string questionId)
{
    return CurrentSurvey.Pages[pageId].Questions[questionId].Text;
}

public string QuestionHeader(string pageId, string questionId)
{
    return CurrentSurvey.Pages[pageId].Questions[questionId].Header;
}

public string PageHeader(string pageId)
{
    return CurrentSurvey.Pages[pageId].Header;
}

public string[] GetMixOrder(string mixId)
{
    string ret = _db.DataResultGetValue(InterviewPars.GetInstance().InterviewId, mixId + "_I", "1");
    return ret.Split(';');
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
    return defaultItera.ToString();
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
    string ret = "__" + Guid.NewGuid().ToString();

    //if (!String.IsNullOrEmpty(listId) && !String.IsNullOrEmpty(itemId) && CurrentSurvey != null && CurrentSurvey.Lists != null && CurrentSurvey.Lists.Contains(listId) && CurrentSurvey.Lists[listId].Items != null && CurrentSurvey.Lists[listId].Items.Contains(itemId) && CurrentSurvey.Lists[listId].Items[itemId].Vars != null && CurrentSurvey.Lists[listId].Items[itemId].Vars.Length > varIndex)
    ret = CurrentSurvey.Lists[listId].Items[itemId].Vars[varIndex];

    return ret;
}

public string GetListItemVar(string listId, int itemIndex, int varIndex)
{
    string ret = "__" + Guid.NewGuid().ToString();

    //if (!String.IsNullOrEmpty(listId) && itemIndex >= 0 && CurrentSurvey != null && CurrentSurvey.Lists != null && CurrentSurvey.Lists.Contains(listId) && CurrentSurvey.Lists[listId].Items != null && CurrentSurvey.Lists[listId].Items[itemIndex] != null && CurrentSurvey.Lists[listId].Items[itemIndex].Vars != null && CurrentSurvey.Lists[listId].Items[itemIndex].Vars.Length > varIndex)
    ret = CurrentSurvey.Lists[listId].Items[itemIndex].Vars[varIndex];

    return ret;
}

public string GetListItemText(string listId, string itemId)
{
    string ret = "__" + Guid.NewGuid().ToString();

    //if (!String.IsNullOrEmpty(listId) && !String.IsNullOrEmpty(itemId) && CurrentSurvey != null && CurrentSurvey.Lists != null && CurrentSurvey.Lists.Contains(listId) && CurrentSurvey.Lists[listId].Items != null && CurrentSurvey.Lists[listId].Items.Contains(itemId))
    ret = CurrentSurvey.Lists[listId].Items[itemId].Text;

    return ret;
}

public string GetListItemText(string listId, int itemIndex)
{
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

public DateTime GetPageTime(string pageId, string side = "Client")
{
    return _db.GetPageTime(InterviewPars.InterviewID, pageId, side);
}

public bool DataHashExist(string hash)
{
    return _db.DataHashExist(hash);
}
`;


var res = raw.match(/((public)|(private)|(protected))\s+(\w+)\s+((\w+)(\(.*\))?)\n/g);

var ar = [];

res.forEach(function(e)
{
    var obj = {};
    var parse = e.match(/((public)|(private)|(protected))\s+(\w+)\s+((\w+)(\(.*\))?)/);
    obj["Name"] = parse[7];
    obj["Detail"] = parse[5];
    obj["Kind"] = parse[8] ? "Function" : "Property";
    obj["Documentation"] = parse[5] + " " + parse[6];
    ar.push(obj);
});

console.log(JSON.stringify(ar));