'use strict'



/** Тип сборки */
export const _pack: ("debug" | "release") = "release";

export const OpenQuestionTagNames = ["Memo", "Text"];

/** Snippets для разных типов Item */
export const ItemSnippets = {
	List: "Item Id=\"$1\"><Text>$2</Text></Item>",
	Quota: "Item Page=\"{{Pages}}\" Question=\"{{Questions}}\" Answer=\"$3\"/>",
	Validate: "Item Page=\"{{Pages}}\" Question=\"{{Questions}}\" Answer=\"$3\"/>",
	Redirect: "Item Page=\"{{Pages}}\" Question=\"{{Questions}}\" Answer=\"$3\"/>",
	Filter: "Item Page=\"{{Pages}}\" Question=\"{{Questions}}\" Answer=\"$3\"/>",
	Constants: "Item Id=\"$1\"><Value>$2</Value></Item>",
	Split: "Item Id=\"$1\" Text=\"http://storage.internetopros.ru/Content/t/tib_${TM_FILENAME/^(\\d+)(.*)$/$1/}/$2.jpg,${3:Описание}\"/>",
	Stat: "Item Id=\"$1\" Name=\"${2:Total}\" Source=\"1_X,2_X,3_X\"/>"
}

/** Работают правильно, но медленно */
export const RegExpPatterns = {
	CDATA: /<!\[CDATA\[([\S\s]*?)\]\]>/,
	CDATALast: /<!\[CDATA\[[\S\s]*$/,
	XMLComment: /(<!--([\S\s]*?)-->\s*)+/,
	XMLLastComment: /<!--[\S\s]*$/,
	AllowCodeTags: "(Filter)|(Redirect)|(Validate)|(Methods)",
	/** RegExp для HTML тегов, которые не нужно закрывать */
	SelfClosedTags: "(area)|(base)|(br)|(col)|(embed)|(hr)|(img)|(input)|(keygen)|(link)|(menuitem)|(meta)|(param)|(source)|(track)|(wbr)",
	InlineSpecial: "(repeat)|(place)",
	/** Набор символов разделителя замены */
	DelimiterContent: "[0-9][a-z][A-Z]",
	SingleAttribute: "\\s*(\\w+)=((\"[^\"]*\")|('[^']*'))\\s*",
	Attributes: /\s*(\w+)=(("[^"]*")|('[^']*'))\s*/g,
	OpenTagFull: /^<\w+(\s*(\w+)=(("[^"]*")|('[^']*')))*\s*\/?>/,
	FormattingHash: /(\s)|(<!\[CDATA\[)|(\]\]>)/g,
	CSComments: /(\/\*([\s\S]+?)\*\/)|(\/\/.+)/g,
	RestAttributes: /^(\s*(\w+)=(("[^"]*")|('[^']*'))\s*)+/,
	XMLIterators:
	{
		Singele: /(@)((ID)|(Text)|(Pure)|(Itera))((\()(-\d+)(\)))?/,
		Var: /(@)(Var)((\()(-\d+)(\)))?((\()(([@0-9a-zA-Z]+(\(-\d+\))?)|((@)(Var)((\()(-\d+)(\)))?(\()([@0-9a-zA-Z]+(\(-\d+\))?)(\))))(\)))/
	},
	ResetAnswerText:
	[
		/затрудняюсь\s+ответить/,
		/ничего\s+из/,
		/нет\s+ответа/,
		/никогда/,
		/не\s+знаю/,
		/всё\s+нравится/,
		/отказ\s+от\s+ответа/,
		/ни\s+((\w+)\s+)?од(ин|на|но|ну|ного|ой)/,
		/никак(ой|ая|ое|ие|ого|им|ому|ом|ую|ими)?/
	],
	OpenAnswerText:
	[
		/уточните/,
		/укажите/,
		/(в|за)пишите/,
		/(что|где|когда|(как(ой|ая|ое|ие|ого|им|ому|ом|ую|ими)?))\s+именно/
	],
	wrongSpaseChars: / |​/ // аккуратно, между | и / есть ещё символ
}


export const _LockInfoFilePrefix = "vscode_tib_lockedInfo_";

/** Префикс для Warning в logToOutput */
export const _WarningLogPrefix = " WARNING: ";


export const QuestionTypes = ["RadioButton", "CheckBox", "Text", "Memo", "Integer", "Number", "File", "Date"];

export const translationArray = {
	rus: ["А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э", "Ю", "Я", "а", "б", "в", "г", "д", "е", "ё", "ж", "з", "и", "й", "к", "л", "м", "н", "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ы", "ь", "э", "ю", "я"],
	eng: ["A", "B", "V", "G", "D", "E", "Yo", "Zh", "Z", "I", "Y", "K", "L", "M", "N", "O", "P", "R", "S", "T", "U", "F", "H", "Ts", "Ch", "Sh", "Shch", "", "I", "", "E", "Yu", "Ya", "a", "b", "v", "g", "d", "e", "yo", "zh", "z", "i", "y", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "f", "h", "ts", "ch", "sh", "shch", "", "i", "", "e", "yu", "ya"],
	engT: ["A", "B", "B", "G", "D", "E", "E", "Zh", "3", "I", "Y", "K", "L", "M", "N", "O", "P", "P", "C", "T", "U", "F", "X", "Ts", "Ch", "Sh", "Shch", "", "bl", "", "E", "Yu", "Ya", "a", "b", "b", "g", "d", "e", "yo", "zh", "z", "i", "y", "k", "l", "m", "n", "o", "p", "p", "c", "t", "u", "f", "x", "ts", "ch", "sh", "shch", "", "i", "", "e", "yu", "ya"]
};


/** Константы, подставляющиеся через $ */
export const XMLEmbeddings = [
	// { Name: 'all', Title: "Все вопросы на странице" },
	{ Name: 'today', Title: "Сегодняшнее число", Type: "string" },
	{ Name: 'sex', Title: "Пол респондента", Type: "string" },
	{ Name: 'age', Title: "Возраст респондента", Type: "int" },
	{ Name: 'respuid', Title: "RespUID", Type: "string" },
	{ Name: 'interviewuid', Title: "InterviewUID", Type: "string" }
];


export const PreDefinedConstants = {
	Scripts: "\\\\tib-srv-debug.corp.tiburon-research.ru\\scripts",
	StoreUrl: "https://content.survstat.ru/content (диск S)",
	ContentUrl: "Путь к папке проекта на CDN-сервере",
	RespID: "Подстановка: InterviewPars.GetInstance().RespId",
	InterviewUID: "Подстановка: InterviewPars.GetInstance().RespId",
	BinderID: "Подстановка: survey.BinderId",
	CompanyProhibited: "Добавляет сноску о запрещённой организации Meta",
	ProductProhibited: "Добавляет сноску о продукте запрещённой организации Meta"
};

const G = "tib-nas-1.corp.tiburon-research.ru";

export const TibPaths = {
	G,
	Logs: `\\\\${G}\\Garbage\\Разное\\TiburonXMLHelper\\Logs`,
	CustomCodeSignatures: `\\\\${G}\\Garbage\\Разное\\TiburonXMLHelper\\DomSignature.d.ts`
}


export const GenerableRepeats = {
	RespInfo: `
<Constants>
	<Item Id="$2Count"><Value>$3</Value></Item>
</Constants>

<Repeat List="$1">
	<Quota Id="zzz_\${2:concept}_@ID" Tech="true" Apply="$4" Limit="1000">
		<Item Page="RespInfo" Question="$2" Answer="@ID" Generable="true"/>
	</Quota>
</Repeat>

<Page Id="RespInfo">
	<Filter>false;</Filter>
	<Header>Опросные данные</Header>
	<Question Id="$2" Type="CheckBox" Store="$2Store" Imperative="false" StructIgnore="true">
		<Repeat List="$1">
			<Answer Id="@ID"><Text>@Text</Text></Answer>
		</Repeat>
	</Question>
	<Question Id="$2Store" Type="Integer" Imperative="false">
		<Header>$5</Header>
		<Repeat Length="@$2Count">
			<Answer Id="@Itera" ExportLabel="Позиция @Itera"/>
		</Repeat>
	</Question>
</Page>
	`,
	
	Unrotated: `
<Block Items="\\$repeat($1){rotBlock@ID[,]}" MixId=":$2"/>

<Repeat List="$1">

	<Block Id="rotBlock@ID" Items="preview_@ID" SyncId="@ID"/>

	<Page Id="preview_@ID">
		<Header>@Text</Header>
	</Page>	

</Repeat>
	`,

	Rotated: `
<Repeat Length="@$2Count">

	<Page Id="preview_@Itera">
		<Header>\\$get$2("@Itera")</Header>
	</Page>

</Repeat>

<Methods><![CDATA[

	public string get$2(string itera)
	{
		return GetListItemText("$1", AnswerValue("$2Store", itera));
	}

]]></Methods>
	`
}


export const RequestNames = {
	GetCurrentTag: 'currentTag',
	CurrentTagFromServer: 'currentTagForce',

	OnAnotherDocumentActivated: 'anotherDocument',
	OnDidChangeTextDocument: 'onDidChangeTextDocument',
	GetDocumentByUri: 'getDocument',
	
	UpdateExtensionSettings: 'updateSettings',
	RunDiagnostic: "runDiagnostic",
	
	LogToConsole: 'console.log',
	LogToOutput: 'client.out',
	LogError: 'logError'
}
