'use strict'

import * as server from 'vscode-languageserver/node';
import { getCurrentTag, CurrentTagGetFields, CurrentTag, ProtocolTagFields, IProtocolTagFields, IServerDocument, OnDidChangeDocumentData, IErrorLogData, isValidDocumentPosition, IErrorTagData, Watcher } from 'tib-api';
import { TibAutoCompleteItem, getCompletions, ServerDocumentStore, getSignatureHelpers, getHovers, TibDocumentHighLights, getDefinition, LanguageString } from './classes';
import * as AutoCompleteArray from './autoComplete';
import { _pack, RequestNames, TibPaths } from 'tib-api/lib/constants';
import { getDiagnosticElements } from './diagnostic';
import { CacheSet } from 'tib-api/lib/cache';
import { SurveyData, TibMethods, SurveyNodes, getDocumentMethods, getDocumentNodeIds, getMixIds, getIncludePaths, getConstants, SurveyNode, ExportLabel, getExportLabels } from 'tib-api/lib/surveyData';
import { getXmlObject } from 'tib-api/lib/parsing';
import { KeyedCollection } from '@vsc-xml-plugin/common-classes/keyedCollection';
import { TemplateParseResult, getTemplates } from '@vsc-xml-plugin/xml-local-templates';




//#region --------------------------- Инициализация


var connection = server.createConnection();
export var _Settings = new KeyedCollection<any>();
var documents = new ServerDocumentStore();

var TibAutoCompleteList = new KeyedCollection<TibAutoCompleteItem[]>();
/** Список классов, типов, структу и т.д. */
var ClassTypes: string[] = [];
/** Список всех для C# (все перегрузки отдельно) */
var CodeAutoCompleteArray: TibAutoCompleteItem[] = [];

var _Cache = new CacheSet(() => true, getServerTag);

var _SurveyData = new SurveyData();




connection.onInitialize(() =>
{
	getAutoComleteList();
	return {
		capabilities: { // тут надо перечислить всё, что клиент будет ждать от сервера
			textDocumentSync: server.TextDocumentSyncKind.Incremental,
			completionProvider: {
				resolveProvider: false,
				triggerCharacters: [' ', '.', '$', ':', '@']
			},
			signatureHelpProvider: {
				triggerCharacters: ['(', ',']
			},
			hoverProvider: true,
			documentHighlightProvider: true,
			definitionProvider: true
		}
	};
});

connection.onInitialized(() =>
{
	connection.sendNotification(RequestNames.LogToOutput, "Сервер запущен");
});

connection.listen();


//#endregion



//#region --------------------------- Обработчики


connection.onDidOpenTextDocument(event =>
{
	if (event.textDocument.languageId != 'tib') return;
	let data: IServerDocument = {
		uri: event.textDocument.uri,
		version: event.textDocument.version,
		content: event.textDocument.text
	}
	anotherDocument(data);
})


connection.onDidCloseTextDocument(event =>
{
	let doc = documents.get(event.textDocument.uri);
	if (!!doc)
	{
		// убиваем diagnostic
		disposeDiagnostic(doc);
		// выкидываем document
		documents.remove(event.textDocument.uri);
	}
})


connection.onCompletion(context =>
{
	let log = new Watcher('Completions').CreateLogger(x => { consoleLog(x) });
	log('start');
	let document = documents.get(context.textDocument.uri);
	if (!document)
	{
		logError("Данные о документе отсутствуют на сервере", false);
		return [];
	}
	let tag = getServerTag({
		document,
		position: context.position,
		force: false
	});
	let items = getCompletions(tag, document, context.position, _SurveyData, TibAutoCompleteList, _Settings, ClassTypes, context.context.triggerCharacter);
	// костыль для понимания в каком документе произошло onCompletionResolve
	items = items.map(x => Object.assign(x, { data: document.uri }));
	log('end');
	return items;
})


connection.onSignatureHelp(data =>
{
	let document = documents.get(data.textDocument.uri);
	if (!document)
	{
		logError("Данные о документе отсутствуют на сервере", false);
		return { signatures: [] } as server.SignatureHelp;
	}
	let tag = getServerTag({
		document,
		position: data.position,
		force: false
	});
	let signatures = getSignatureHelpers(tag, document, data.position, _SurveyData, TibAutoCompleteList);
	return { signatures } as server.SignatureHelp;
})

connection.onHover(data =>
{
	let log = new Watcher('Hover').CreateLogger(x => { consoleLog(x) });
	log('start');
	let document = documents.get(data.textDocument.uri);
	let contents: LanguageString[] = [];

	if (!!document)
	{
		if (isValidDocumentPosition(document, data.position))
		{
			let tag = getServerTag({
				document,
				position: data.position,
				force: false
			});

			sendTagToClient(tag);

			contents = getHovers(tag, document, data.position, _SurveyData, CodeAutoCompleteArray);
		}
		else
		{
			let positionFrom = server.Position.create(data.position.line, 0);
			let errorData = {
				message: `Position: ${data.position.line}:${data.position.character}, Line: "${document.getText(server.Range.create(positionFrom, data.position))}"`
			};
			logError("Кривой position", false, errorData);
		}
	}
	else logError("Данные о документе отсутствуют на сервере", false);
	log('end');
	return { contents };
})

connection.onDocumentHighlight(data =>
{
	let log = new Watcher('Highlight').CreateLogger(x => { consoleLog(x) });
	log('start');
	let document = documents.get(data.textDocument.uri);
	if (!document)
	{
		logError("Данные о документе отсутствуют на сервере", false);
		return [];
	}
	if (!data.position)
	{
		logError("Нет данных о положении курсора", false);
		return [];
	}
	let tag = getServerTag({
		document,
		position: data.position,
		force: false
	});
	let higlights = new TibDocumentHighLights(tag, document, data.position);
	sendTagToClient(tag);
	let allH = higlights.getAll();
	log('end');
	return allH;
})


connection.onDefinition(async data =>
{
	let document = documents.get(data.textDocument.uri);
	if (!document)
	{
		logError("Данные о документе отсутствуют на сервере", false);
		return null;
	}
	if (!data.position)
	{
		logError("Нет данных о положении курсора", false);
		return null;
	}
	let tag = getServerTag({
		document,
		position: data.position,
		force: false
	});
	sendTagToClient(tag);
	let res = getDefinition(tag, document, data.position, _SurveyData);
	return [res];
})

// это событие дёргаем руками, чтобы передавать все нужные данные
connection.onRequest(RequestNames.OnDidChangeTextDocument, (data: OnDidChangeDocumentData) =>
{
	// тут 'tib' учитывается при всех вызовах
	return new Promise<CurrentTag>((resolve) =>
	{
		if (!data) return resolve(null);
		let doc = documents.set(data.document);
		let fields: IProtocolTagFields = {
			uri: data.document.uri,
			position: data.currentPosition,
			force: false,
			text: data.previousText
		};
		anyChangeHandler(doc);
		resolve(getServerTag(new ProtocolTagFields(fields).toCurrentTagGetFields(documents.get(fields.uri))))
	});
})


connection.onRequest(RequestNames.GetCurrentTag, (fields: IProtocolTagFields) =>
{
	return new Promise<CurrentTag>((resolve) =>
	{
		resolve(getServerTag(new ProtocolTagFields(fields).toCurrentTagGetFields(documents.get(fields.uri))))
	});
})


connection.onRequest(RequestNames.OnAnotherDocumentActivated, (data: IServerDocument) =>
{
	anotherDocument(data);
})


/* connection.onNotification('forceDocumentUpdate', (data: IServerDocument) =>
{
	documents.add(data);
}); */


connection.onNotification(RequestNames.UpdateExtensionSettings, (data: Object) =>
{
	_Settings = KeyedCollection.FromObject(data);
});


connection.onNotification(RequestNames.RunDiagnostic, (document: IServerDocument) =>
{
	try
	{
		let doc = documents.get(document.uri);
		updateSurveyData(doc).then(() =>
		{
			sendDiagnostic(doc);
		});
	}
	catch (error)
	{
		logError("Ошибка получения диагностики", true, error);
	}
});


//#endregion



//#region --------------------------- Функции



async function sendDiagnostic(document: server.TextDocument)
{
	let log = new Watcher('Diagnostic').CreateLogger(x => { consoleLog(x) });
	log('start');
	let diagnostics = await getDiagnosticElements(document, _SurveyData);
	let clientDiagnostic: server.PublishDiagnosticsParams = {
		diagnostics,
		uri: document.uri
	};
	log('complete');
	connection.sendDiagnostics(clientDiagnostic);
}


/** Очищает элементы diagnostic */
async function disposeDiagnostic(document: server.TextDocument)
{
	let clientDiagnostic: server.PublishDiagnosticsParams = {
		diagnostics: [],
		uri: document.uri
	};
	connection.sendDiagnostics(clientDiagnostic);
}


function getServerTag(data: CurrentTagGetFields): CurrentTag
{
	try
	{
		let tag = getCurrentTag(data, _Cache, (data: string[]) => { consoleLog(data) });
		_Cache.Tag.Set(tag);
		return tag;
	} catch (error)
	{
		logError("Ошибка получения текущего тега", false, error);
		return null;
	}
}


export function consoleLog(data: string[])
{
	if (!!data) connection.sendNotification(RequestNames.LogToConsole, { data });
}

/** Смена документа */
function anotherDocument(data: IServerDocument)
{// tib учитывается при вызове
	let doc = documents.add(data);
	if (!doc) return;
	_SurveyData.Clear();
	_Cache.Clear();
	anyChangeHandler(doc);
}

/** Дёргаем при изменении или открытии */
function anyChangeHandler(document: server.TextDocument)
{
	// при largeMode надо инвертировать все действия в restChangeHandler
	if (documents.isLarge(document.uri)) return restChangeHandler(document.uri);
	updateSurveyData(document).then(() =>
	{
		sendDiagnostic(document);
	});
}

/** Сброс функционала в связи с largeMode */
function restChangeHandler(uri: string)
{
	_SurveyData.Clear();
	connection.sendDiagnostics({
		diagnostics: [],
		uri
	});
}


/** Создаёт список AutoComplete из autoComplete.ts */
async function getAutoComleteList()
{
	try
	{
		let staticAutoCompletes = { ...AutoCompleteArray };

		// получаем шаблоны с диска
		try
		{
			const snips = await getTemplates(TibPaths.Snippets);
			if (snips.ok == false) // тут компилятор сломался от восклицательного знака
			{
				logError(snips.errorMessage, false);
			}
			else
			{
				(staticAutoCompletes.XMLFeatures as TemplateParseResult[]).push(...snips.data);
				connection.sendNotification(RequestNames.LogToOutput, "Добавлено шаблонов: " + snips.data.length);
			}
		}
		catch (error)
		{
			logError(error, false);
		}

		// получаем AutoComplete
		let tibCode = staticAutoCompletes.Code.map(x => { return new TibAutoCompleteItem(x); });
		let statCS: TibAutoCompleteItem[] = [];
		for (let key in staticAutoCompletes.StaticMethods)
		{
			// добавляем сам тип в AutoComplete
			let tp = new TibAutoCompleteItem({
				Name: key,
				Kind: "Class",
				Detail: "Тип данных/класс " + key
			});
			statCS.push(tp);
			// и в classTypes
			ClassTypes.push(key);
			// добавляем все его статические методы
			let items: object[] = staticAutoCompletes.StaticMethods[key];
			items.forEach(item =>
			{
				let aci = new TibAutoCompleteItem(item);
				aci.Parent = key;
				aci.Kind = "Method";
				statCS.push(aci);
			});
		}

		// объединённый массив Tiburon + MSDN
		let all = tibCode.concat(statCS);

		all.forEach(item =>
		{
			if (!item.Kind || !item.Name) return;

			CodeAutoCompleteArray.push(item); // сюда добавляем всё
			// если такого типа ещё нет, то добавляем
			if (!TibAutoCompleteList.ContainsKey(item.Kind)) TibAutoCompleteList.AddPair(item.Kind, [item])
			else // если есть то добавляем в массив с учётом перегрузок
			{
				// ищем индекс элемента с таким же типом, именем и родителем
				let ind = TibAutoCompleteList.Item(item.Kind).findIndex(x =>
				{
					return x.Name == item.Name && (!!x.Parent && x.Parent == item.Parent || !x.Parent && !item.Parent);
				});

				if (ind < 0)
				{
					TibAutoCompleteList.Item(item.Kind).push(item);
				}
				else
				{
					// добавляем в перегрузку к имеющемуся (и сам имеющийся тоже, если надо)
					//if (!TibAutoCompleteList.Item(item.Kind)[ind].Overloads) TibAutoCompleteList.Item(item.Kind)[ind].Overloads = [];
					let len = TibAutoCompleteList.Item(item.Kind)[ind].Overloads.length;
					if (len == 0)
					{
						let parent = new TibAutoCompleteItem(TibAutoCompleteList.Item(item.Kind)[ind]);
						TibAutoCompleteList.Item(item.Kind)[ind].Overloads.push(parent);
						len++;
					}
					TibAutoCompleteList.Item(item.Kind)[ind].Overloads.push(item);
					let doc = "Перегрузок: " + (len + 1);
					TibAutoCompleteList.Item(item.Kind)[ind].Description = doc;
					//TibAutoCompleteList.Item(item.Kind)[ind].Documentation = doc;
				}
			}
		});
	} catch (error)
	{
		logError('Ошибка инициализации Autocomplete', false, error);
	}

}


/** Собирает данные из текущего документа и Includ'ов */
async function updateSurveyData(document: server.TextDocument)
{
	let log = new Watcher('SurveyData').CreateLogger(x => { consoleLog(x) });
	log('start');

	try
	{
		let docs = [document.uri];
		let text = document.getText();
		let parseResult = getXmlObject(text);
		if (parseResult.ok)
		{
			let currentXml = parseResult.object;
			let includes = getIncludePaths(currentXml);
			let methods = new TibMethods();
			let nodes = new SurveyNodes();
			let constants = new KeyedCollection<SurveyNode>();
			let mixIds: string[] = [];
			let exportLabels: ExportLabel[] = [];

			// если Include поменялись, то обновляем все
			if (!_SurveyData.Includes || !_SurveyData.Includes.equalsTo(includes))
			{
				docs = docs.concat(includes);
				_SurveyData.Includes = includes;
			}
			else // иначе обновляем только текущий документ
			{
				methods = _SurveyData.Methods.Filter((name, element) => element.FileName != document.uri);
				nodes = _SurveyData.CurrentNodes.FilterNodes((node) => node.FileName != document.uri);
			}


			for (let i = 0; i < docs.length; i++) 
			{
				const isCurrent = docs[i] == document.uri;
				// либо этот, либо надо открыть
				let doc = isCurrent ? document : await getDocument(docs[i]);
				if (!!doc)
				{
					let xml = isCurrent ? currentXml : undefined;
					if (!isCurrent)
					{
						let parseResultSub = getXmlObject(doc.getText());
						if (parseResultSub.ok) xml = parseResultSub.object;
					}
					if (!!xml)
					{
						methods.AddRange(await getDocumentMethods(doc, xml));
						nodes.AddRange(await getDocumentNodeIds(doc, xml));
						mixIds = mixIds.concat(await getMixIds(doc, xml));
						constants.AddRange(await getConstants(doc, xml));
						exportLabels = exportLabels.concat(await getExportLabels(doc));
					}
				}
			}
			let preparedXml = CurrentTag.PrepareXML(text);
			nodes.Add(new SurveyNode("Page", "pre_data", null, document, preparedXml));
			nodes.Add(new SurveyNode("Question", "pre_data", null, document, preparedXml));
			nodes.Add(new SurveyNode("Question", "pre_sex", null, document, preparedXml));
			nodes.Add(new SurveyNode("Question", "pre_age", null, document, preparedXml));
			nodes.Add(new SurveyNode("Page", "debug", null, document, preparedXml));
			nodes.Add(new SurveyNode("Question", "debug", null, document, preparedXml));

			_SurveyData.Methods = methods;
			_SurveyData.CurrentNodes = nodes;
			_SurveyData.MixIds = mixIds;
			_SurveyData.ConstantItems = constants;
			_SurveyData.ExportLabels = exportLabels;
		}
	} catch (error)
	{
		logError("Ошибка при сборе сведений о документе", false, error);
	}
	log('end');
}


/** Если файла нет в `documents`, то запрашивает у клиента данные для файла и добавляет в `documents` */
function getDocument(uri: string): Promise<server.TextDocument>
{
	return new Promise<server.TextDocument>((resolve, reject) =>
	{
		let document = documents.get(uri);
		if (!!document) return resolve(document);
		connection.sendRequest<IServerDocument>(RequestNames.GetDocumentByUri, uri).then(doc =>
		{
			resolve(!!doc ? documents.add(doc) : null);
		}, err => { reject(err); });
	});
}


export function logError(text: string, showError: boolean, errorMessage?)
{
	let data = new Error().stack;
	let msg: string = undefined;
	if (!!errorMessage)
	{
		if (typeof errorMessage == 'string') msg = errorMessage;
		else if (!!errorMessage.message) msg = errorMessage.message;
	}
	let tag = _Cache.Tag.IsSet() ? _Cache.Tag.Get() : null;
	let tagData: IErrorTagData = !!tag ? { Language: tag.GetLaguage(), XmlPath: tag.XmlPath() } : undefined;
	let log: IErrorLogData = {
		MessageFriendly: text,
		Message: msg,
		Silent: !showError && _pack != "debug",
		StackTrace: !!data ? ('SERVER: ' + data) : undefined,
		TagData: tagData
	};
	connection.sendNotification(RequestNames.LogError, log);
}


/** Отправляет `tag` клиенту */
function sendTagToClient(tag: CurrentTag): void
{
	connection.sendNotification(RequestNames.CurrentTagFromServer, tag);
}

//#endregion
