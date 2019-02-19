'use strict'

import * as server from 'vscode-languageserver';
import { KeyedCollection, getCurrentTag, CurrentTagGetFields, CurrentTag, SurveyNodes, TibMethods, getDocumentNodeIdsSync, getDocumentMethodsSync, getMixIdsSync, ProtocolTagFields, IProtocolTagFields, IServerDocument, OnDidChangeDocumentData } from 'tib-api';
import { sendDiagnostic, TibAutoCompleteItem, getCompletions, ISurveyDataData, DocumentBuffer, ServerDocumentStore, getSignatureHelpers } from './classes';
import * as AutoCompleteArray from './autoComplete';
import { CacheSet } from 'tib-api/lib/cache';
import { _NodeStoreNames } from 'tib-api/lib/constants';



//#region --------------------------- Инициализация

var connection = server.createConnection();
var Settings = new KeyedCollection<any>();
var documents = new ServerDocumentStore();

var TibAutoCompleteList = new KeyedCollection<TibAutoCompleteItem[]>();
/** Список классов, типов, структу и т.д. */
var ClassTypes: string[] = [];
/** Список всех для C# (все перегрузки отдельно) */
var CodeAutoCompleteArray: TibAutoCompleteItem[] = [];

var Cache = new CacheSet(() => true, getServerTag);

var SurveyData: ISurveyDataData = {
	CurrentNodes: new SurveyNodes(),
	Methods: new TibMethods(),
	MixIds: []
}




connection.onInitialize((params: server.InitializeParams) =>
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
			}
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
	let doc = documents.add(data);
	anyChangeHandler(doc);
})


connection.onCompletion(context =>
{
	let document = documents.get(context.textDocument.uri);
	let tag = Cache.Tag.Get();
	let items = getCompletions(tag, document, context.position, SurveyData, TibAutoCompleteList, Settings, ClassTypes, context.context.triggerCharacter);
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
	let signatures = getSignatureHelpers(tag, document, data.position, SurveyData, TibAutoCompleteList);
	return { signatures } as server.SignatureHelp;
})


connection.onRequest('onDidChangeTextDocument', (data: OnDidChangeDocumentData) =>
{
	return new Promise<CurrentTag>((resolve, reject) =>
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
	return new Promise<CurrentTag>((resolve, reject) => {
		resolve(getServerTag(new ProtocolTagFields(fields).toCurrentTagGetFields(documents.get(fields.uri))))
	});
})


//#region --------------------------- Функции


function getServerTag(data: CurrentTagGetFields): CurrentTag
{
	let tag = getCurrentTag(data, Cache);
	Cache.Tag.Set(tag);
	return tag;
}


export function consoleLog(...data)
{
	connection.sendNotification('console.log', data);
}

/** Дёргаем при изменении или открытии */
function anyChangeHandler(document: server.TextDocument)
{
	SurveyData =
		{
			CurrentNodes: getDocumentNodeIdsSync(document, Settings, _NodeStoreNames),
			Methods: getDocumentMethodsSync(document, Settings),
			MixIds: getMixIdsSync(document, Settings)
		};
	sendDiagnostic(connection, document, Settings);
}


/** Создаёт список AutoComplete из autoComplete.ts */
async function getAutoComleteList()
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
}


//#endregion