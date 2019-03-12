'use strict'

import * as server from 'vscode-languageserver';
import { KeyedCollection, getCurrentTag, CurrentTagGetFields, CurrentTag, SurveyNodes, TibMethods, ProtocolTagFields, IProtocolTagFields, IServerDocument, OnDidChangeDocumentData, getDocumentMethods, getDocumentNodeIds, getMixIds, IErrorLogData } from 'tib-api';
import { TibAutoCompleteItem, getCompletions, ServerDocumentStore, getSignatureHelpers, getHovers, TibDocumentHighLights, getDefinition, getIncludePaths, SurveyData } from './classes';
import * as AutoCompleteArray from './autoComplete';
import { CacheSet } from 'tib-api/lib/cache';
import { _NodeStoreNames, _pack } from 'tib-api/lib/constants';
import { getDiagnosticElements } from './diagnostic';



//#region --------------------------- Инициализация

var connection = server.createConnection();
var _Settings = new KeyedCollection<any>();
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
				triggerCharacters: [' ', '.', '$', ':']
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
	connection.sendNotification("client.out", "Сервер запущен");
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


connection.onCompletion(context =>
{
	let document = documents.get(context.textDocument.uri);
	let tag = _Cache.Tag.Get();
	let items = getCompletions(tag, document, context.position, _SurveyData, TibAutoCompleteList, _Settings, ClassTypes, context.context.triggerCharacter);
	// костыль для понимания в каком документе произошло onCompletionResolve
	items = items.map(x => Object.assign(x, { data: document.uri }));
	return items;
})


connection.onSignatureHelp(data =>
{
	let document = documents.get(data.textDocument.uri);
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
	let document = documents.get(data.textDocument.uri);
	let tag = getServerTag({
		document,
		position: data.position,
		force: false
	});
	return {
		contents: getHovers(tag, document, data.position, _SurveyData, CodeAutoCompleteArray)
	};
})

connection.onDocumentHighlight(data =>
{
	let document = documents.get(data.textDocument.uri);
	let tag = getServerTag({
		document,
		position: data.position,
		force: false
	});
	let higlights = new TibDocumentHighLights(tag, document, data.position);
	return higlights.getAll();
})


connection.onDefinition(data =>
{
	let document = documents.get(data.textDocument.uri);
	let tag = getServerTag({
		document,
		position: data.position,
		force: false
	});
	return getDefinition(tag, document, data.position, _SurveyData);
})

connection.onRequest('onDidChangeTextDocument', (data: OnDidChangeDocumentData) =>
{
	return new Promise<CurrentTag>((resolve) =>
	{
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


connection.onRequest('currentTag', (fields: IProtocolTagFields) =>
{
	return new Promise<CurrentTag>((resolve) =>
	{
		resolve(getServerTag(new ProtocolTagFields(fields).toCurrentTagGetFields(documents.get(fields.uri))))
	});
})


connection.onRequest('anotherDocument', (data: IServerDocument) =>
{
	anotherDocument(data);
})


//#endregion


//#region --------------------------- Функции



function sendDiagnostic(connection: server.Connection, document: server.TextDocument, settings: KeyedCollection<any>)
{
	getDiagnosticElements(document, settings).then(diagnostics =>
	{
		let clientDiagnostic: server.PublishDiagnosticsParams = {
			diagnostics,
			uri: document.uri
		};
		connection.sendDiagnostics(clientDiagnostic);
	})
}


function getServerTag(data: CurrentTagGetFields): CurrentTag
{
	let tag = getCurrentTag(data, _Cache);
	_Cache.Tag.Set(tag);
	return tag;
}


export function consoleLog(...data)
{
	connection.sendNotification('console.log', data);
}

/** Смена документа */
function anotherDocument(data: IServerDocument)
{
	let doc = documents.add(data);
	_SurveyData.Clear();
	_Cache.Clear();
	anyChangeHandler(doc);
}

/** Дёргаем при изменении или открытии */
function anyChangeHandler(document: server.TextDocument)
{
	updateSurveyData(document);
	sendDiagnostic(connection, document, _Settings);
}


/** Создаёт список AutoComplete из autoComplete.ts */
async function getAutoComleteList()
{
	try
	{
		// получаем AutoComplete
		let tibCode = AutoCompleteArray.Code.map(x => { return new TibAutoCompleteItem(x); });
		let statCS: TibAutoCompleteItem[] = [];
		for (let key in AutoCompleteArray.StaticMethods)
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
			let items: object[] = AutoCompleteArray.StaticMethods[key];
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

		all.forEach(element =>
		{
			let item = new TibAutoCompleteItem(element);
			if (!item.Kind || !item.Name) return;

			CodeAutoCompleteArray.push(new TibAutoCompleteItem(element)); // сюда добавляем всё
			// если такого типа ещё нет, то добавляем
			if (!TibAutoCompleteList.Contains(item.Kind)) TibAutoCompleteList.AddPair(item.Kind, [item])
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
					TibAutoCompleteList.Item(item.Kind)[ind].Documentation = doc;
				}
			}
		});
	} catch (error)
	{
		logError('Ошибка инициализации Autocomplete', false);
	}

}


/** Собирает данные из текущего документа и Includ'ов */
async function updateSurveyData(document: server.TextDocument)
{
	let docs = [document.uri];
	let includes = getIncludePaths(document.getText());
	let methods = new TibMethods();
	let nodes = new SurveyNodes();
	let mixIds: string[] = [];

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

	try
	{
		for (let i = 0; i < docs.length; i++) 
		{
			// либо этот, либо надо открыть
			let doc = docs[i] == document.uri ? document : await getDocument(docs[i]);
			let mets = await getDocumentMethods(doc, _Settings);
			let nods = await getDocumentNodeIds(doc, _Settings, _NodeStoreNames);
			let mixs = await getMixIds(doc, _Settings);
			methods.AddRange(mets);
			nodes.AddRange(nods);
			mixIds = mixIds.concat(mixs);
		}
		_SurveyData.Methods = methods;
		_SurveyData.CurrentNodes = nodes;
		_SurveyData.MixIds = mixIds;
	} catch (error)
	{
		logError("Ошибка при сборе сведений о документе", false);
	}
}


/** Если файла нет в `documents`, то запрашивает у клиента данные для файла и добавляет в `documents` */
function getDocument(uri: string): Promise<server.TextDocument>
{
	return new Promise<server.TextDocument>((resolve, reject) =>
	{
		let document = documents.get(uri);
		if (!!document) return resolve(document);
		connection.sendRequest<IServerDocument>('getDocument', uri).then(doc =>
		{
			resolve(documents.add(doc));
		}, err => { reject(err); });
	});
}


export function logError(text: string, showError: boolean)
{
	let data = new Error().stack;
	let log: IErrorLogData = {
		Message: text,
		Silent: !showError && _pack != "debug",
		Error: !!data ? ('SERVER: ' + data) : undefined
	};
	connection.sendNotification('logError', log);
}


//#endregion