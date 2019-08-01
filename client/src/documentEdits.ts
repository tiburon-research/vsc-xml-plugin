'use strict'

import { Parse, safeString, JQuery, translate, KeyedCollection } from 'tib-api'
import { SurveyListItem, SurveyQuestion, SurveyAnswer, SurveyList, SurveyPage, SurveyElementType } from 'tib-api/lib/surveyObjects'
import * as vscode from 'vscode'
import { QuestionTypes } from 'tib-api/lib/constants';


export function AnswersToItems(text: string): string
{
	return TransformElement(text, "Answer", "Item");
}

export function ItemsToAnswers(text: string): string
{
	return TransformElement(text, "Item", "Answer");
}

function TransformElement(text: string, from: string, to: string): string
{
	let $ = JQuery.init();
	let $dom = $.XMLDOM(text);
	let $fromItems = $dom.find(from);
	if ($fromItems.length == 0) return text;
	$fromItems.map(function ()
	{
		let $el = $(this);
		let $newEl = $.XML("<" + to + "></" + to + ">");
		let id = $el.attr('Id');
		if (!!id) $newEl.attr('Id', id);
		let txt = "";
		let $text = $el.find('Text');
		if ($text.length > 0)
			txt = $text.text();
		else
		{
			let at = $el.attr('Text');
			if (!!at) txt = at;
		}
		let $nxml = $.XML('<Text></Text>');
		if (!!txt) $nxml.text(txt);
		$nxml.appendTo($newEl);
		$el.replaceWith($newEl);
	});

	return $dom.xml();
}

export function ToAgeList(text: string): string
{
	let $ = JQuery.init();
	let ageLimits = text.match(/\d+/g);
	let $dom = $.XMLDOM("<List></List>");
	let $list = $dom.find("List");
	$list.attr('Id', "ageList");

	for (let i = 0, length = ageLimits.length, addedElementCount = 1; i < length; i += addedElementCount)
	{
		let $item = $.XML("<Item></Item>");
		$item.attr("Id", ~~(i / 2) + i % 2 + 1);

		if (i + 1 == length)
		{
			$item.attr("Var", ageLimits[i] + ",99");
			$.XML('<Text></Text>').text(ageLimits[i] + "_99").appendTo($item);
		} else
		{
			if (parseInt(ageLimits[i + 1]) - parseInt(ageLimits[i]) == 1)
			{
				$item.attr("Var", "0," + ageLimits[i]);
				$.XML('<Text></Text>').text("0_" + ageLimits[i]).appendTo($item);
			} else
			{
				$item.attr("Var", ageLimits[i] + "," + ageLimits[i + 1]);
				$.XML('<Text></Text>').text(ageLimits[i] + "_" + ageLimits[i + 1]).appendTo($item);
				addedElementCount = 2;
			}
		}

		$item.appendTo($list);
	}

	return $dom.xml();
}

export function RemoveQuestionIds(text: string): string
{
	let $ = JQuery.init();
	let $dom = $.XMLDOM(text);
	let $question = $dom.find("Question");

	$question.map(function ()
	{
		let questionHeader = $(this).find("Header");
		let headerText = questionHeader.text();
		let qIDValue = $(this).attr('Id');
		let regex = new RegExp("^\\s*" + safeString(qIDValue) + "\\.?\\s*");
		qIDValue = headerText.match(regex);
		headerText = questionHeader.text().replace(qIDValue, "");
		questionHeader.text(headerText);
	});

	return $dom.xml();
}

export function getVarCountFromList(list: string): number
{

	let $ = JQuery.init();
	let res = 99999;
	let varCount = 0;									   //количество Var'ов в List'е
	let $dom = $.XMLDOM(list);
	let itemIndex = 0;									  //инедкс первого item'а в List'e
	let $list = $dom.find("List");						  //ищем List'ы

	if ($list.length == 0)
	{								  //если нет List'ов, то вставляем первый Item, так как количество Var'ов должно быть одинаково у всех Item
		$list.push($dom.find("Item").eq(itemIndex));
	}

	$list.map(function ()
	{								   //проходим все List'ы

		let $item = $dom.find("Item").eq(itemIndex);		//берём только первый элемент List'a, так как количество Var'ов должно быть одинаково у всех Item
		let $var = $item.find("Var");					   //Ищем дочерний Var
		varCount = 0;

		if ($var.length > 0)								//<Var></Var>
		{
			varCount += $var.length;
		}
		if (typeof $item.attr('Var') !== typeof undefined)  //Var=""
		{
			varCount += $item.attr('Var').split(',').length;
		}

		itemIndex += $(this).find("Item").length;		   //записываем индекс первого элемента Item'а следующего List'a 

		if (res > varCount)
		{								 //если количество Var'ов у этого List'а меньше, чем у предыдущих
			res = varCount;								 //то записываем это количество			   
		}
	});

	return res;
}

export function sortListBy(text: string, attrName: string, attrIndex?: number): string
{
	let $ = JQuery.init();
	let $dom = $.XMLDOM(text);																		  //берём xml текст
	let $lists = $dom.find("List");																	 //ищем List'ы
	let $listItems = [];																				//массив Item массивов

	if ($lists.length > 0)
	{																			  //если есть List'ы
		$lists.map(function (i)
		{																		 //вытаскивам Item'ы, где индекс номер List'а
			$listItems.push($lists.eq(i).find("Item"));
		});
	} else
	{
		$listItems.push($dom.find("Item"));															 //иначе ищем Item'ы
	}

	$listItems.map(function ($items, index)
	{															 //перебираем Item'ы

		$items.sort(function (item1, item2)
		{																							   //сортируем массив DOM

			let sortItems = [item1, item2];
			let el = [];																				//должно хранится 2 элемента для сравнения

			if (attrIndex > 0)
			{																						   //если есть индекс
				let attributeValues = $(sortItems[0]).attr(attrName).split(',');
				let attrLength = attributeValues.length;												//берём у первого Item'а количество Var'ов (Var="")

				for (let i = 0, length = sortItems.length; i < length; i++)
				{
					if (attrIndex < attrLength)
					{
						el[i] = $(sortItems[i]).attr(attrName).split(',')[attrIndex];				   //берём значение по индексу
					} else
					{
						el[i] = $(sortItems[i]).find(attrName).eq(attrIndex - attrLength).text();
					}
				}
			} else
			{
				for (let i = 0, length = sortItems.length; i < length; i++)
				{
					if (typeof $(sortItems[i]).attr(attrName) !== typeof undefined)					 //если атрибут
					{
						el[i] = $(sortItems[i]).attr(attrName);
					} else if ($(sortItems[i]).find(attrName).length > 0)							   //если дочерний тег
					{
						el[i] = $(sortItems[i]).find(attrName).eq(0).text();
					}

					if (typeof el[i] == typeof undefined)
					{																				   //если атрибут пуст
						el[i] = "";																	 //взять как пустое значение
					}
				}
			}

			if (el[0].match(/^\d+$/) && el[1].match(/^\d+$/))										   //проверка на числа
			{
				el[0] = parseInt(el[0]);
				el[1] = parseInt(el[1]);
			}

			if (el[0] > el[1])
			{
				return 1;
			}
			if (el[0] < el[1])
			{
				return -1;
			}

			return 0;
		});

		if ($lists.length > 0)																		  //если взят текст с List
		{
			$items.appendTo($lists.eq(index).html(''));
		} else																						  //если взят тескт только с Item'ами
		{
			$items.appendTo($dom);
		}

	});

	return $dom.xml();
}

export class XMLElementCreationResult
{
	public Ok: boolean = false;
	public Message: string = null;
	public Result: vscode.SnippetString = null;

	public Error(message)
	{
		this.Message = message;
		return this;
	}

	public Fill(snippetString: string)
	{
		this.Result = new vscode.SnippetString(snippetString);
		this.Ok = true;
	}
}

export function createElements(text: string, type: SurveyElementType): XMLElementCreationResult
{
	let strings = text.split("\n");
	let questionResult: Parse.ParsedElementObject;
	let res = new XMLElementCreationResult();

	if (type == SurveyElementType.Page && strings.length > 1)
	{ // пробуем найти Question
		questionResult = Parse.parseQuestion(strings[0], true);
		strings.shift();
	}
	let elements = Parse.parseElements(strings);
	let duplicatedIs = elements.map(x => x.Id).findDuplicates();
	if (duplicatedIs.length > 0)
	{
		return res.Error("Следующие Id повторяются: " + duplicatedIs.join(','));
	}

	if (!elements || elements.length == 0) return res.Error("Не удалось найти элементы");

	let answerItems = new KeyedCollection<SurveyAnswer>();
	let itemItems = new KeyedCollection<SurveyListItem>();
	if (type == SurveyElementType.ListItem)
	{
		elements.forEach(element =>
		{
			itemItems.AddPair(element.Id, new SurveyListItem(element.Id, element.Text));
		});
	}
	else
	{
		elements.forEach(element =>
		{
			answerItems.AddPair(element.Id, new SurveyAnswer(element.Id, element.Text));
		});
	}

	switch (type)
	{
		case SurveyElementType.Page:
			{
				let parsedId = !!questionResult && !!questionResult.Id ? translate(questionResult.Id) : 'Q1';
				let id = "${1:" + parsedId + "}";
				let q = new SurveyQuestion(parsedId, "${2|" + QuestionTypes.join(',') + "|}");
				q.Answers = answerItems;
				q.SetAttr("Id", id);
				q.Header = !!questionResult ? questionResult.Text.trim() : '';
				let p = new SurveyPage(id);
				p.AddChild(q);
				res.Fill(p.ToXML());
				break;
			}

		case SurveyElementType.Answer:
			{
				res.Fill(answerItems.ToArray((key, value) => value.ToXML()).join("\n"));
				break;
			}

		case SurveyElementType.ListItem:
			{

				let q = new SurveyList("$1");
				q.Items = itemItems;
				res.Fill(q.ToXML());
				break;
			}
	}

	return res;
}