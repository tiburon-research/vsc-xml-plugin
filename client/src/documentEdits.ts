'use strict'

import { JQuery } from 'tib-api'
import { SurveyList } from '@vsc-xml-plugin/survey-objects'
import '@vsc-xml-plugin/extensions'


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


/** Получает возрастные диапазоны из строки */
function getAgeRanges(text: string): { from: string, to: string }[]
{
	let res = [];
	let ageLimits = text.split('\n').map(x => x.trim().findAll(/\d+/)).filter(x => x.length > 0);
	for (let i = 0; i < ageLimits.length; i++)
	{
		let from: string;
		let to: string;
		if (ageLimits[i].length == 1)
		{
			if (i == 0)
			{
				from = '0';
				to = ageLimits[i][0].Result[0];
			}
			else if (i == ageLimits.length - 1)
			{
				from = ageLimits[i][0].Result[0];
				to = '99';
			}
			else throw "Не удалось получить возрастной диапазон в строке " + (i + 1);
		}
		else
		{
			from = ageLimits[i][0].Result[0];
			to = ageLimits[i][1].Result[0];
		}
		res.push({ from, to });
	}
	return res;
}


export function ToAgeList(text: string): string
{
	let ageLimits = getAgeRanges(text);
	let list = new SurveyList("ageList");
	list.VarsAsTags = false;

	for (let i = 0; i < ageLimits.length; i++)
	{
		list.AddItem({
			Id: '' + (i + 1),
			Text: ageLimits[i].from + '_' + ageLimits[i].to,
			Vars: [ageLimits[i].from, ageLimits[i].to]
		});
	}

	return list.ToXML();
}


export function ToSexAgeList(text: string): string
{
	let ageLimits = getAgeRanges(text);
	let list = new SurveyList("sexAgeList");
	list.VarsAsTags = false;
	let sexList = ["man", "woman"];
	let i = 1;

	for (let sIndex = 0; sIndex < sexList.length; sIndex++)
	{
		ageLimits.forEach(age =>
		{
			list.AddItem({
				Id: '' + (i++),
				Text: sexList[sIndex] + '_' + age.from + '_' + age.to,
				Vars: ['' + (sIndex + 1), age.from, age.to]
			});
		});
	};

	return list.ToXML();
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
		let qIDValue = $(this).attr('Id') as string;
		let regex = new RegExp("^\\s*" + qIDValue.escape() + "\\.?\\s*");
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
