raw = {
	"Items": [
		{
			"StringAttributes": {
				"Attr": [
					{
						"Id": "VarDelimiter",
						"Default": "."
					},
					{
						"Id": "Statuses",
						"Default": "all"
					}
				]
			},
			"BooleanAttributes": {
				"Attr": [
					{
						"Id": "Utf8",
						"Default": "false"
					},
					{
						"Id": "CheckBoxMultiple",
						"Default": "false"
					},
					{
						"Id": "CheckBoxBinary",
						"Default": "false"
					},
					{
						"Id": "CutLabels",
						"Default": "false"
					},
					{
						"Id": "WriteCsvLabels",
						"Default": "false"
					},
					{
						"Id": "ExportPageTime",
						"Default": "true"
					}
				]
			},
			"Id": "ExportDataSettings"
		},
		{
			"StringAttributes": {
				"Attr": [
					{
						"Id": "LogoText"
					},
					{
						"Id": "StartPage",
						"Default": "pre_data"
					},
					{
						"Id": "CompletePage"
					},
					{
						"Id": "ClosePage"
					},
					{
						"Id": "CompleteUrl"
					},
					{
						"Id": "UrlSuccess",
						"Default": "//launch.survstat.ru/finish?id=@RespID&type=@StatusID&sel=@AnswerValue('pre_data', 'sel')"
					},
					{
						"Id": "UrlScreenoutEarly",
						"Default": "//launch.survstat.ru/finish?id=@RespID&type=@StatusID&sel=@AnswerValue('pre_data', 'sel')"
					},
					{
						"Id": "UrlScreenoutLate",
						"Default": "//launch.survstat.ru/finish?id=@RespID&type=@StatusID&sel=@AnswerValue('pre_data', 'sel')"
					},
					{
						"Id": "UrlQuota",
						"Default": "//launch.survstat.ru/finish?id=@RespID&type=@StatusID&sel=@AnswerValue('pre_data', 'sel')"
					},
					{
						"Id": "UrlFinedUnfinished",
						"Default": "//launch.survstat.ru/finish?id=@RespID&type=@StatusID&sel=@AnswerValue('pre_data', 'sel')"
					},
					{
						"Id": "ExtPars",
						"Default": "resp/Внешний ID,s/Пол,a/Возраст"
					},
					{
						"Id": "Culture",
						"Default": "ru-RU"
					},
					{
						"Id": "StatusAltSuccess"
					},
					{
						"Id": "StatusAltScreenoutEarly"
					},
					{
						"Id": "StatusAltScreenoutLate"
					},
					{
						"Id": "StatusAltQuota"
					},
					{
						"Id": "TimeoutMessage",
						"Default": "Данные на странице устарели. Обновляем.."
					},
					{
						"Id": "DbDataConnection"
					},
					{
						"Id": "UrlAgreement",
						"Default": "https://survey.survstat.ru/agreement"
					},
					{
						"Id": "UrlPrivacy",
						"Default": "https://docs.survstat.ru/privacy"
					},
					{
						"Id": "SupportServiceUrl",
						"Default": "https://support.api.corp.tiburon-research.ru"
					},
					{
						"Id": "SupportServicePassword",
						"Default": "KbzQ3vyeAq"
					},
					{
						"Id": "ExtLibs"
					},
					{
						"Id": "PrefferedDelimiter",
						"Default": "."
					}
				]
			},
			"BooleanAttributes": {
				"Attr": [
					{
						"Id": "Utf8",
						"Default": "true"
					},
					{
						"Id": "AutoMonadic",
						"Default": "true"
					},
					{
						"Id": "ColorConstructor",
						"Default": "false",
						"DbValue": "true"
					},
					{
						"Id": "UseNewMix",
						"Default": "true"
					},
					{
						"Id": "UseJSManager",
						"Default": "false"
					},
					{
						"Id": "UseNewQuotas",
						"Default": "false"
					},
					{
						"Id": "QuotaOptimistic"
					}
				]
			},
			"IntegerAttributes": {
				"Attr": {
					"Id": "QuotaVersion",
					"Default": "2"
				}
			},
			"Id": "Settings"
		},
		{
			"IntegerAttributes": {
				"Attr": {
					"Id": "Index",
					"Default": "2"
				}
			},
			"StringAttributes": {
				"Attr": [
					{
						"Id": "Action",
						"Default": "Replace"
					},
					{
						"Id": "Value",
						"AllowCode": "true"
					}
				]
			},
			"Id": "CustomText"
		},
		{
			"StringAttributes": {
				"Attr": [
					{
						"Id": "RedirectUrl"
					},
					{
						"Id": "RedirectParamsList"
					},
					{
						"Id": "LogoText"
					},
					{
						"Id": "LogoUrl"
					},
					{
						"Id": "CompletePage",
						"Default": "__Complete"
					},
					{
						"Id": "ClosePage",
						"Default": "__Close"
					},
					{
						"Id": "NextButton",
						"Default": "Далее"
					},
					{
						"Id": "PrevButton",
						"Default": "Назад"
					},
					{
						"Id": "Progress",
						"Default": "Пройдено"
					},
					{
						"Id": "PopupCancelText",
						"Default": "Отмена"
					},
					{
						"Id": "PopupOkText",
						"Default": "Ок"
					},
					{
						"Id": "LandscapeOrientationText",
						"Default": "ПОВЕРНИТЕ ВАШЕ УСТРОЙСТВО"
					},
					{
						"Id": "LandscapeOrientationHintText",
						"Default": "в горизонтальное положение для более комфортного просмотра"
					},
					{
						"Id": "PortraitOrientationText",
						"Default": "ПОВЕРНИТЕ ВАШЕ УСТРОЙСТВО"
					},
					{
						"Id": "PortraitOrientationHintText",
						"Default": "в вертикальное положение для более комфортного просмотра"
					},
					{
						"Id": "EmptyError",
						"Default": "Пожалуйста, не оставляйте вопросы без ответа"
					},
					{
						"Id": "TextError",
						"Default": "Пожалуйста, введите текст"
					},
					{
						"Id": "IntError",
						"Default": "Пожалуйста, введите целое число"
					},
					{
						"Id": "NumberError",
						"Default": "Пожалуйста, введите число"
					},
					{
						"Id": "DateError",
						"Default": "Пожалуйста, укажите дату"
					},
					{
						"Id": "SelectError",
						"Default": "Эти варианты ответа не могут быть отмечены одновременно"
					},
					{
						"Id": "RangeError",
						"Default": "Выбранный вариант ответа должен иметь другое значение"
					},
					{
						"Id": "LengthError",
						"Default": "Введённый Вами текст слишком длинный"
					},
					{
						"Id": "MaxAnswersError",
						"Default": "Укажите, пожалуйста, меньшее количество ответов"
					},
					{
						"Id": "MinAnswersError",
						"Default": "Укажите, пожалуйста, большее количество ответов"
					},
					{
						"Id": "ExchangeError",
						"Default": "Неверный запрос к странице"
					},
					{
						"Id": "CommentText",
						"Default": "Здесь Вы можете оставить любой комментарий по ходу опроса"
					},
					{
						"Id": "ErrorTitle",
						"Default": "Ошибка"
					},
					{
						"Id": "GeneralErrorText",
						"Default": "Проверьте, пожалуйста, правильность заполнения страницы"
					},
					{
						"Id": "GeneralErrorButton",
						"Default": "Ок"
					},
					{
						"Id": "WaitingText",
						"Default": "Пожалуйста, подождите, пока загрузится страница"
					},
					{
						"Id": "AgreementText",
						"Default": "Пользовательское соглашение"
					},
					{
						"Id": "PrivacyText",
						"Default": "Политика конфиденциальности"
					},
					{
						"Id": "SupportText",
						"Default": "Нашли ошибку или что-то не работает?"
					},
					{
						"Id": "SupportEditText",
						"Default": "Сообщить о проблеме"
					},
					{
						"Id": "SupportSendText",
						"Default": "Сообщить о проблеме"
					},
					{
						"Id": "SupportCloseText",
						"Default": "Отмена"
					},
					{
						"Id": "SupportSuccessHeader",
						"Default": "Сообщение успешно отправлено!"
					},
					{
						"Id": "SupportSuccessText",
						"Default": "Спасибо за обращение, в ближайшее время мы постараемся решить Вашу проблему."
					},
					{
						"Id": "SupportSuccessButton",
						"Default": "Продолжить"
					},
					{
						"Id": "SupportFailText",
						"Default": "Сообщение не было отправлено"
					},
					{
						"Id": "CommentHeader",
						"Default": "Здесь Вы можете оставить любой комментарий по ходу опроса"
					},
					{
						"Id": "Copyright",
						"Default": "Powered by SurveyStat"
					},
					{
						"Id": "NoflashText",
						"Default": "<p>На Вашем компьютере установлена старая версия flash-плеера, либо плеер не установлен. Вы можете скачать последнюю версию пройдя по ссылке ниже</p><a href='http://get.adobe.com/flashplayer/'><img border='0' src='http://www.adobe.com/images/shared/download_buttons/get_adobe_flash_player.png' alt='Скачать flash-плеер' /></a>"
					},
					{
						"Id": "Title",
						"Default": "Исследование"
					},
					{
						"Id": "HintRadioButton",
						"Default": "Один ответ"
					},
					{
						"Id": "HintCheckBox",
						"Default": "Отметьте все подходящие ответы"
					},
					{
						"Id": "HintText",
						"Default": "Запишите ответ в поле ниже"
					},
					{
						"Id": "HintInteger",
						"Default": "Введите число в поле ниже"
					},
					{
						"Id": "HintMemo",
						"Default": "Мы будем благодарны Вам за подробный ответ"
					},
					{
						"Id": "HintUnionVertical",
						"Default": "колонке"
					},
					{
						"Id": "HintUnionHorizontal",
						"Default": "строке"
					},
					{
						"Id": "HintUnion",
						"Default": "@HintType по каждой @HintOrientation"
					},
					{
						"Id": "ButtonTimeoutWaitText",
						"Default": "Ждите @Countdown сек"
					},
					{
						"Id": "WarnClosingText",
						"Default": "Опрос ещё не завершён, Вы уверены, что хотите закрыть его?"
					},
					{
						"Id": "CompleteUrl"
					},
					{
						"Id": "ClickPointRemoveText",
						"Default": "Удалить"
					},
					{
						"Id": "VideoCaptureStartText",
						"Default": "Начать запись"
					},
					{
						"Id": "VideoCaptureCancelText",
						"Default": "Отмена"
					},
					{
						"Id": "VideoCaptureEndText",
						"Default": "Завершить запись"
					},
					{
						"Id": "VideoCaptureRemoveText",
						"Default": "Удалить видеоответ"
					},
					{
						"Id": "VideoCaptureAsyncLoadText",
						"Default": "Видеоответ загружается на сервер..."
					},
					{
						"Id": "VideoCapturePlayerWidth",
						"Default": "640"
					},
					{
						"Id": "VideoCapturePlayerHeight",
						"Default": "480"
					},
					{
						"Id": "VideoCaptureImgUrl",
						"Default": "/Content/images/camera.png"
					},
					{
						"Id": "VideoCaptureMinLengthText",
						"Default": "Минимальная длина видео"
					},
					{
						"Id": "VideoCaptureLengthMeasureText",
						"Default": "сек"
					},
					{
						"Id": "VideoCaptureTimerText",
						"Default": "Текущая длина видео"
					},
					{
						"Id": "HintMinAnswers",
						"Default": "Не менее @count ответов"
					},
					{
						"Id": "HintMaxAnswers",
						"Default": "Не более @count ответов"
					},
					{
						"Id": "HintEqualsAnswers",
						"Default": "Укажите точное количество ответов: @count"
					},
					{
						"Id": "HintMaxDiffDesktop",
						"Default": "Выберите вариант ответа, который Вам @labelleast, и вариант ответа, который Вам @labelmost"
					},
					{
						"Id": "HintMaxDiffMobile",
						"Default": "Сделайте жест влево для варианта ответа, который Вам @labelleast, и жест вправо для варианта ответа, который Вам @labelmost"
					},
					{
						"Id": "HintScaleOrderDesktop",
						"Default": "Проставьте ранг каждому элементу"
					},
					{
						"Id": "HintScaleOrderMobile",
						"Default": "Проставьте ранг каждому элементу"
					},
					{
						"Id": "HintMediaPlayerVideoDesktop",
						"Default": "Посмотрите видеоролик"
					},
					{
						"Id": "HintMediaPlayerVideoMobile",
						"Default": "Посмотрите видеоролик"
					},
					{
						"Id": "HintMediaPlayerAudioDesktop",
						"Default": "Прослушайте аудиозапись"
					},
					{
						"Id": "HintMediaPlayerAudioMobile",
						"Default": "Прослушайте аудиозапись"
					},
					{
						"Id": "MediaPlayerVideoError",
						"Default": "Пожалуйста, досмотрите видеоролик до конца"
					},
					{
						"Id": "MediaPlayerAudioError",
						"Default": "Пожалуйста, дослушайте аудиозапись до конца"
					}
				]
			},
			"BooleanAttributes": {
				"Attr": [
					{
						"Id": "ShowProgress",
						"Default": "true"
					},
					{
						"Id": "ShowNextButton",
						"Default": "true"
					},
					{
						"Id": "ShowPrevButton",
						"Default": "false",
						"AllowCode": "true",
						"DbValue": "true"
					},
					{
						"Id": "ProhibitSelection",
						"Default": "true"
					},
					{
						"Id": "ProhibitPrintscreen"
					},
					{
						"Id": "Caching",
						"Default": "false"
					},
					{
						"Id": "CountPageTime",
						"Default": "true"
					},
					{
						"Id": "HideSurveyHeader"
					},
					{
						"Id": "ShowSupport",
						"Default": "true"
					},
					{
						"Id": "ShowAgreement",
						"Default": "true"
					},
					{
						"Id": "ShowPrivacy",
						"Default": "true"
					},
					{
						"Id": "ShowComment",
						"Default": "false"
					},
					{
						"Id": "NumberAnswers",
						"Default": "false"
					},
					{
						"Id": "LogoShow"
					},
					{
						"Id": "LogoOnce"
					},
					{
						"Id": "LoadAsync",
						"Default": "false"
					},
					{
						"Id": "WarnClosing"
					},
					{
						"Id": "ShowQuestionIds",
						"Default": "false",
						"DbValue": "true"
					},
					{
						"Id": "ShowInterruptButton",
						"Default": "false"
					},
					{
						"Id": "MaxAnswersDisable",
						"Default": "false"
					},
					{
						"Id": "TrimClientModel",
						"Default": "false"
					}
				]
			},
			"IntegerAttributes": {
				"Attr": [
					{
						"Id": "WaitingDelay",
						"Default": "2000"
					},
					{
						"Id": "EmphaseTimeout",
						"Default": "3000"
					},
					{
						"Id": "LoadAsyncTimeout",
						"Default": "0"
					}
				]
			},
			"Id": "Defaults"
		},
		{
			"StringAttributes": {
				"Attr": [
					{
						"Id": "SyncId",
						"AllowCode": "true"
					},
					{
						"Id": "Header",
						"AllowCode": "true"
					},
					{
						"Id": "ScreenOrientation",
						"AllowCode": "true"
					},
					{
						"Id": "OptionalHeader",
						"AllowCode": "true"
					},
					{
						"Id": "Footer",
						"AllowCode": "true"
					},
					{
						"Id": "Template",
						"AllowCode": "true"
					},
					{
						"Id": "Itera"
					},
					{
						"Id": "IteraID"
					},
					{
						"Id": "DefaultControl"
					},
					{
						"Id": "GenerablePar"
					},
					{
						"Id": "Quota"
					},
					{
						"Id": "SaveMixOrder"
					},
					{
						"Id": "RestoreMixOrder"
					},
					{
						"Id": "DefaultsId"
					},
					{
						"Id": "ExportLabel"
					},
					{
						"Id": "MixId"
					},
					{
						"Id": "InvId"
					}
				]
			},
			"IntegerAttributes": {
				"Attr": [
					{
						"Id": "ButtonTimeout",
						"AllowCode": "true"
					},
					{
						"Id": "DefaultCode",
						"Default": "13"
					},
					{
						"Id": "CustomProgress",
						"AllowCode": "true"
					}
				]
			},
			"DoubleAttributes": {
				"Attr": {
					"Id": "PostbackTimeout",
					"AllowCode": "true"
				}
			},
			"BooleanAttributes": {
				"Attr": [
					{
						"Id": "Reverse",
						"AllowCode": "true"
					},
					{
						"Id": "CountProgress",
						"Default": "true"
					},
					{
						"Id": "Mix"
					},
					{
						"Id": "Inv"
					},
					{
						"Id": "Fix"
					},
					{
						"Id": "End"
					},
					{
						"Id": "FastLoad"
					},
					{
						"Id": "ShowModalError",
						"Default": "true"
					},
					{
						"Id": "StructIgnore"
					}
				]
			},
			"FilteredObjectAttributes": {
				"Attr": {
					"Id": "OnloadFilter"
				}
			},
			"Id": "Page"
		},
		{
			"StringAttributes": {
				"Attr": [
					{
						"Id": "Text",
						"AllowCode": "true"
					},
					{
						"Id": "ChildList"
					}
				]
			},
			"BooleanAttributes": {
				"Attr": {
					"Id": "Fix"
				}
			},
			"Id": "ListItem"
		},
		{
			"BooleanAttributes": {
				"Attr": [
					{
						"Id": "Mix"
					},
					{
						"Id": "SaveToDb"
					}
				]
			},
			"Id": "List"
		},
		{
			"QuestionTypeAttributes": {
				"Attr": {
					"Id": "Type",
					"Default": "RadioButton"
				}
			},
			"StringAttributes": {
				"Attr": [
					{
						"Id": "SyncId",
						"AllowCode": "true"
					},
					{
						"Id": "Multiply"
					},
					{
						"Id": "Text",
						"AllowCode": "true"
					},
					{
						"Id": "EndText",
						"AllowCode": "true"
					},
					{
						"Id": "Header",
						"AllowCode": "true"
					},
					{
						"Id": "OptionalHeader",
						"AllowCode": "true"
					},
					{
						"Id": "Hint",
						"AllowCode": "true"
					},
					{
						"Id": "SubText",
						"AllowCode": "true"
					},
					{
						"Id": "Title",
						"AllowCode": "true"
					},
					{
						"Id": "SelectionBackColor",
						"Default": "#FFFF00"
					},
					{
						"Id": "SelectionColor",
						"Default": "#000000"
					},
					{
						"Id": "SelectedBackColor",
						"Default": "#000000"
					},
					{
						"Id": "SelectedColor",
						"Default": "#FFFFFF"
					},
					{
						"Id": "OverColor"
					},
					{
						"Id": "GenerablePar"
					},
					{
						"Id": "SplitOpen",
						"Default": "{"
					},
					{
						"Id": "SplitClose",
						"Default": "}"
					},
					{
						"Id": "Store"
					},
					{
						"Id": "CornerText",
						"AllowCode": "true"
					},
					{
						"Id": "Template"
					},
					{
						"Id": "SubstPage",
						"AllowCode": "true"
					},
					{
						"Id": "SubstQuestion",
						"AllowCode": "true"
					},
					{
						"Id": "Image",
						"AllowCode": "true"
					},
					{
						"Id": "Union"
					},
					{
						"Id": "Tag",
						"Default": "z"
					},
					{
						"Id": "RestoreMixOrder"
					},
					{
						"Id": "RestoreUnionMixOrder"
					},
					{
						"Id": "Range",
						"AllowCode": "true"
					},
					{
						"Id": "ExportLabel"
					},
					{
						"Id": "UnionMixId"
					},
					{
						"Id": "MixId"
					},
					{
						"Id": "InvId"
					},
					{
						"Id": "Coding"
					},
					{
						"Id": "CodingEntity",
						"AllowCode": "true"
					}
				]
			},
			"BooleanAttributes": {
				"Attr": [
					{
						"Id": "VideoAnswer",
						"Default": "false"
					},
					{
						"Id": "AutoSetSingle",
						"AllowCode": "true",
						"Default": "false"
					},
					{
						"Id": "Reverse",
						"AllowCode": "true"
					},
					{
						"Id": "Mix"
					},
					{
						"Id": "Inv"
					},
					{
						"Id": "SaveMixOrder"
					},
					{
						"Id": "SaveUnionMixOrder"
					},
					{
						"Id": "Visible",
						"Default": "true"
					},
					{
						"Id": "Imperative",
						"Default": "true"
					},
					{
						"Id": "ImperativeAll"
					},
					{
						"Id": "UnionMix"
					},
					{
						"Id": "Fix"
					},
					{
						"Id": "HideOnFilter"
					},
					{
						"Id": "Separate"
					},
					{
						"Id": "StructIgnore"
					},
					{
						"Id": "ExcludeFromClientFilters",
						"Default": "false"
					}
				]
			},
			"IntegerAttributes": {
				"Attr": [
					{
						"Id": "TextWidth",
						"Default": "100"
					},
					{
						"Id": "EndTextWidth",
						"Default": "20"
					},
					{
						"Id": "MinAnswers",
						"AllowCode": "true"
					},
					{
						"Id": "MaxAnswers",
						"AllowCode": "true"
					},
					{
						"Id": "EqualsAnswers",
						"AllowCode": "true"
					},
					{
						"Id": "ColsPerRow"
					},
					{
						"Id": "Cols"
					},
					{
						"Id": "Length"
					},
					{
						"Id": "NumCodes"
					}
				]
			},
			"Id": "Question"
		},
		{
			"StringAttributes": {
				"Attr": [
					{
						"Id": "EvenClass",
						"Default": "SEEvenRow"
					},
					{
						"Id": "OddClass",
						"Default": "SEOddRow"
					},
					{
						"Id": "TitleClass",
						"Default": "SETitle"
					},
					{
						"Id": "ErrorCellClass",
						"Default": "SEErrorCell"
					},
					{
						"Id": "ComboBoxClass",
						"Default": "SEComboBox"
					},
					{
						"Id": "SingleClass",
						"Default": "SESingle"
					},
					{
						"Id": "MemoClass",
						"Default": "SEMemo"
					},
					{
						"Id": "ContainerClass",
						"Default": "SEQuestionContainer"
					},
					{
						"Id": "SelTextContainerClass",
						"Default": "SESelTextQuestionContainer"
					},
					{
						"Id": "HoverClass",
						"Default": "SEHover"
					},
					{
						"Id": "SelectedClass",
						"Default": "SESelected"
					},
					{
						"Id": "AnswersClass",
						"Default": "SEAnswers"
					},
					{
						"Id": "HeaderClass",
						"Default": "SEHeader"
					},
					{
						"Id": "SelectionClass",
						"Default": "SESelection"
					},
					{
						"Id": "SeparatorClass",
						"Default": "SESeparator"
					},
					{
						"Id": "Width"
					},
					{
						"Id": "ShelfCellClass",
						"Default": "SEShelfCell"
					},
					{
						"Id": "ShelfSelDivClass",
						"Default": "SEShelfSelDiv"
					}
				]
			},
			"BooleanAttributes": {
				"Attr": [
					{
						"Id": "AnswersVisible",
						"Default": "true"
					},
					{
						"Id": "DetailsVisible",
						"Default": "true"
					},
					{
						"Id": "IgnoreStyle"
					}
				]
			},
			"Id": "QuestionStyle"
		},
		{
			"StringAttributes": {
				"Attr": [
					{
						"Id": "SyncId",
						"AllowCode": "true"
					},
					{
						"Id": "Text",
						"AllowCode": "true"
					},
					{
						"Id": "EndText",
						"AllowCode": "true"
					},
					{
						"Id": "Label",
						"AllowCode": "true"
					},
					{
						"Id": "Title",
						"AllowCode": "true"
					},
					{
						"Id": "Placeholder",
						"AllowCode": "true"
					},
					{
						"Id": "Value",
						"AllowCode": "true"
					},
					{
						"Id": "GenerablePar"
					},
					{
						"Id": "ResetGroups"
					},
					{
						"Id": "Resets"
					},
					{
						"Id": "Range",
						"AllowCode": "true"
					},
					{
						"Id": "RangeSpread"
					},
					{
						"Id": "Image",
						"AllowCode": "true"
					},
					{
						"Id": "ExportLabel"
					},
					{
						"Id": "Partial",
						"AllowCode": "true"
					}
				]
			},
			"BooleanAttributes": {
				"Attr": [
					{
						"Id": "Fix"
					},
					{
						"Id": "NoUseInQstFilter",
						"Default": "false"
					},
					{
						"Id": "Visible",
						"Default": "true"
					},
					{
						"Id": "ShowDay",
						"Default": "true"
					},
					{
						"Id": "ShowMonth",
						"Default": "true"
					},
					{
						"Id": "ShowYear",
						"Default": "true"
					},
					{
						"Id": "Solo"
					},
					{
						"Id": "Imperative",
						"Default": "true"
					},
					{
						"Id": "HideOnFilter"
					},
					{
						"Id": "Reset"
					},
					{
						"Id": "Separate"
					},
					{
						"Id": "StructIgnore"
					}
				]
			},
			"QuestionTypeAttributes": {
				"Attr": {
					"Id": "Type"
				}
			},
			"IntegerAttributes": {
				"Attr": {
					"Id": "Length"
				}
			},
			"Id": "Answer"
		},
		{
			"BooleanAttributes": {
				"Attr": {
					"Id": "Generable"
				}
			},
			"StringAttributes": {
				"Attr": {
					"Id": "Spread"
				}
			},
			"LogicalOperatorAttributes": {
				"Attr": {
					"Id": "Operator",
					"Default": "And"
				}
			},
			"ProcessSideAttributes": {
				"Attr": {
					"Id": "Side",
					"Default": "Server"
				}
			},
			"RuntimeTypeAttributes": {
				"Attr": {
					"Id": "Runtime",
					"Default": "Declaring"
				}
			},
			"Id": "Filter"
		},
		{
			"LogicalOperatorAttributes": {
				"Attr": {
					"Id": "Operator",
					"Default": "Or"
				}
			},
			"Id": "Condition"
		},
		{
			"StringAttributes": {
				"Attr": [
					{
						"Id": "Page"
					},
					{
						"Id": "Question"
					},
					{
						"Id": "Answer"
					},
					{
						"Id": "Value"
					}
				]
			},
			"LogicalOperatorAttributes": {
				"Attr": [
					{
						"Id": "Operator",
						"Default": "Nothing"
					},
					{
						"Id": "RangeOperator",
						"Default": "Or"
					}
				]
			},
			"BooleanAttributes": {
				"Attr": [
					{
						"Id": "Apply"
					},
					{
						"Id": "Generable"
					}
				]
			},
			"Id": "ConditionItem"
		},
		{
			"StringAttributes": {
				"Attr": [
					{
						"Id": "Page"
					},
					{
						"Id": "Url"
					}
				]
			},
			"IntegerAttributes": {
				"Attr": {
					"Id": "Status"
				}
			},
			"LogicalOperatorAttributes": {
				"Attr": {
					"Id": "Operator",
					"Default": "And"
				}
			},
			"RuntimeTypeAttributes": {
				"Attr": {
					"Id": "Runtime",
					"Default": "Declaring"
				}
			},
			"ProcessSideAttributes": {
				"Attr": {
					"Id": "Side",
					"Default": "Server"
				}
			},
			"Id": "Redirect"
		},
		{
			"IntegerAttributes": {
				"Attr": {
					"Id": "Status",
					"Default": "21"
				}
			},
			"BooleanAttributes": {
				"Attr": [
					{
						"Id": "Enabled",
						"Default": "true"
					},
					{
						"Id": "Counter",
						"Default": "false"
					}
				]
			},
			"StringAttributes": {
				"Attr": [
					{
						"Id": "Limit"
					},
					{
						"Id": "Page"
					},
					{
						"Id": "Description"
					},
					{
						"Id": "Url"
					},
					{
						"Id": "Apply"
					},
					{
						"Id": "Monadic"
					},
					{
						"Id": "CountStatuses",
						"Default": "18"
					}
				]
			},
			"LogicalOperatorAttributes": {
				"Attr": {
					"Id": "Operator",
					"Default": "And"
				}
			},
			"ProcessSideAttributes": {
				"Attr": {
					"Id": "Side",
					"Default": "Server"
				}
			},
			"RuntimeTypeAttributes": {
				"Attr": {
					"Id": "Runtime",
					"Default": "Declaring"
				}
			},
			"NullableBooleanAttributes": {
				"Attr": {
					"Id": "Optimistic"
				}
			},
			"Id": "Quota"
		},
		{
			"Id": "QuotaContactGroup"
		},
		{
			"StringAttributes": {
				"Attr": [
					{
						"Id": "Items"
					},
					{
						"Id": "Title",
						"AllowCode": "true"
					},
					{
						"Id": "Text"
					},
					{
						"Id": "SyncId",
						"AllowCode": "true"
					},
					{
						"Id": "MixId",
						"AllowCode": "true"
					},
					{
						"Id": "InvId",
						"AllowCode": "true"
					}
				]
			},
			"BooleanAttributes": {
				"Attr": [
					{
						"Id": "Fix"
					},
					{
						"Id": "InnerMix"
					},
					{
						"Id": "Mix"
					},
					{
						"Id": "Inv"
					},
					{
						"Id": "LocalProgress"
					}
				]
			},
			"IntegerAttributes": {
				"Attr": [
					{
						"Id": "LocalProgressStart"
					},
					{
						"Id": "LocalProgressEnd"
					}
				]
			},
			"Id": "Block"
		},
		{
			"StringAttributes": {
				"Attr": [
					{
						"Id": "Items"
					},
					{
						"Id": "SaveMixOrder"
					},
					{
						"Id": "RestoreMixOrder"
					}
				]
			},
			"BooleanAttributes": {
				"Attr": {
					"Id": "Reverse",
					"AllowCode": "true"
				}
			},
			"Id": "Mix"
		},
		{
			"StringAttributes": {
				"Attr": {
					"Id": "Text",
					"AllowCode": "true"
				}
			},
			"Id": "FlashVar"
		},
		{
			"StringAttributes": {
				"Attr": {
					"Id": "Src",
					"AllowCode": "true"
				}
			},
			"Id": "PreloadImage"
		},
		{
			"BooleanAttributes": {
				"Attr": [
					{
						"Id": "Block"
					},
					{
						"Id": "Mix"
					}
				]
			},
			"StringAttributes": {
				"Attr": [
					{
						"Id": "List"
					},
					{
						"Id": "MixId"
					},
					{
						"Id": "Range",
						"AllowCode": "true"
					}
				]
			},
			"IntegerAttributes": {
				"Attr": {
					"Id": "Length"
				}
			},
			"Id": "Repeat"
		},
		{
			"StringAttributes": {
				"Attr": [
					{
						"Id": "PinQuestion"
					},
					{
						"Id": "PinAnswer"
					},
					{
						"Id": "Message"
					}
				]
			},
			"LogicalOperatorAttributes": {
				"Attr": {
					"Id": "Operator",
					"Default": "And"
				}
			},
			"ProcessSideAttributes": {
				"Attr": {
					"Id": "Side",
					"Default": "Server"
				}
			},
			"RuntimeTypeAttributes": {
				"Attr": {
					"Id": "Runtime",
					"Default": "Code"
				}
			},
			"Id": "Validate"
		},
		{
			"StringAttributes": {
				"Attr": [
					{
						"Id": "Name"
					},
					{
						"Id": "Source"
					}
				]
			},
			"Id": "Split"
		},
		{
			"StringAttributes": {
				"Attr": {
					"Id": "Text"
				}
			},
			"Id": "SplitItem"
		},
		{
			"IntegerAttributes": {
				"Attr": [
					{
						"Id": "BindInterval"
					},
					{
						"Id": "Group"
					},
					{
						"Id": "Union"
					}
				]
			},
			"StringAttributes": {
				"Attr": [
					{
						"Id": "Name"
					},
					{
						"Id": "Source"
					},
					{
						"Id": "Split"
					},
					{
						"Id": "Base"
					},
					{
						"Id": "Status"
					},
					{
						"Id": "Quota"
					},
					{
						"Id": "GroupName"
					}
				]
			},
			"BooleanAttributes": {
				"Attr": [
					{
						"Id": "AllowQuota",
						"Default": "false"
					},
					{
						"Id": "AllowStatus",
						"Default": "false"
					},
					{
						"Id": "HideSplit"
					},
					{
						"Id": "QuotaOnTop"
					}
				]
			},
			"Id": "Statistic"
		},
		{
			"StringAttributes": {
				"Attr": [
					{
						"Id": "Name"
					},
					{
						"Id": "Source"
					},
					{
						"Id": "Func",
						"Default": "Pct"
					},
					{
						"Id": "Ignores"
					},
					{
						"Id": "Color"
					}
				]
			},
			"Id": "StatisticItem"
		},
		{
			"StringAttributes": {
				"Attr": {
					"Id": "Text",
					"AllowCode": "true"
				}
			},
			"Id": "Comment"
		},
		{
			"BooleanAttributes": {
				"Attr": {
					"Id": "Fix",
					"Default": "false"
				}
			},
			"StringAttributes": {
				"Attr": [
					{
						"Id": "Questions"
					},
					{
						"Id": "Align",
						"Default": "right"
					},
					{
						"Id": "Valign"
					},
					{
						"Id": "Text",
						"AllowCode": "true"
					},
					{
						"Id": "Width",
						"Default": "30%"
					}
				]
			},
			"Id": "Holder"
		},
		{
			"StringAttributes": {
				"Attr": {
					"Id": "Text",
					"AllowCode": "true"
				}
			},
			"Id": "Footer"
		}
	]
};

var obj = {};

function restructAttrObj(obj) {
	let res = {};
	for (let key in obj) {
		res[key == "Id" ? "Name" : key] = obj[key];
	}
	return res;
}

raw.Items.forEach(function (e) {
	var ar = [];
	for (var key in e) {
		if (key != "Id") {
			var tmp = [];
			if (!Array.isArray(e[key]["Attr"])) {
				tmp = [];
				tmp.push(restructAttrObj(e[key]["Attr"]));
			}
			else tmp = tmp.concat(e[key]["Attr"].map(a => restructAttrObj(a)));
			tmp.forEach(function (item) {
				item["Type"] = key.replace(/Attributes$/, '');
			});
			ar = ar.concat(tmp);
		}
		obj[e["Id"]] = [];
		obj[e["Id"]] = obj[e["Id"]].concat(ar);
	}
});

console.log(JSON.stringify(obj));
