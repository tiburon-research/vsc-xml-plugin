import * as fs from 'fs';
import { pathExists, OrderedCollection } from 'tib-api';
import { Path } from './classes';
import xlsx from 'node-xlsx';
import { SurveyList } from 'tib-api/lib/surveyObjects';


const GeoPath = "T:\\=Tiburon_NEW\\Geo";


export const GeoConstants = {
	/** Названия компоновки географии */
	GroupBy: {
		District: "Федеральный округ",
		Subject: "Область"
	},
	ListNames: {
		City: "cityList",
		District: "districtList",
		Subject: "subjectList"
	},
	QuestionNames: {
		District: "District",
		Subject: "Subject",
		City: "City"
	}
}


/** Структура одной строки в файле географии */
export class GeoFileLineData
{
	CountryId: string;
	CityId: string;
	DistrictId: string;
	StrataId: string;
	SubjectId: string;
	FilMegafonId: string;

	CountryName: string;
	CityName: string;
	CityPopulation: number;
	DistrictName: string;
	StrataName: string;
	SubjectName: string;
	FilMegafonName: string;
}

/** Возвращает путь к самому свежему файлу `*-geo.xlsx` */
function getGeoPath(): string
{
	let res: string = null;
	if (pathExists(GeoPath))
	{
	    let files = fs.readdirSync(GeoPath).map(f =>
	    {
	        let res: number;
	        let match = f.match(/^(\d+)-geo\.xlsx$/);
	        if (!!match) res = Number(match[1]);
	        return res;
	    }).filter(f => !!f).sort((a, b) => { return b - a; });
	    if (files.length > 0) res = Path.Concat(GeoPath, files[0] + "-geo.xlsx");
	}
	return res;
}

/** Все строки первого листа (Geo) */
async function readGeoFileList(path: string): Promise<[][]>
{
	return xlsx.parse(path)[0].data;
}

/** Преобразование записей файла в структуру */
async function parseGeoList(data: [][]): Promise<GeoFileLineData[]>
{
	let lines = data.concat([]);
	let cellNames = lines.shift();
	let res: GeoFileLineData[] = [];
	lines.forEach(line =>
	{
	    // либо все, либо без мегафона
	    if (line.length != cellNames.length && line.length != cellNames.length - 2) return;
	    let lineData = new GeoFileLineData();
	    for (let i = 0; i < cellNames.length; i++)
	    {
	        lineData[cellNames[i]] = line[i];
	    }
	    res.push(lineData);
	});
	return res;
}


/** Возвращает все города */
export async function readGeoFile(): Promise<GeoFileLineData[]>
{
	let path = getGeoPath();
	if (!path) throw "Путь к файлу с георафией не найден";
	let geoList = await readGeoFileList(path);
	let res = await parseGeoList(geoList);
	return res;
}


/** Создаёт все нужные списки для географии */
export async function createGeolists(cities: GeoFileLineData[], groupBy: string[]): Promise<string>
{
	let res = '\n\n';

	// ФО
	if (groupBy.contains(GeoConstants.GroupBy.District))
	{
		let districtList = new SurveyList(GeoConstants.ListNames.District);
		districtList.VarsAsTags = false;
		let filteredDistricts = OrderedCollection.FromPairs(cities.map(x => { return { Key: x.DistrictId, Value: x.DistrictName } }));
		filteredDistricts.OrderBy(x => x.Value).ForEach(pair =>
		{
			districtList.AddItem({ Id: pair.Key, Text: pair.Value });
		});
		res += districtList.ToXML() + '\n\n';
	}

	// Области
	if (groupBy.contains(GeoConstants.GroupBy.Subject))
	{
		let subjectList = new SurveyList(GeoConstants.ListNames.Subject);
		subjectList.VarsAsTags = false;
		let filteredSubjects = OrderedCollection.FromPairs(cities.map(x => { return { Key: x.SubjectId, Value: x.SubjectName } }));
		filteredSubjects.OrderBy(x => x.Value).ForEach(pair =>
		{
			let subjectDistrict = cities.find(x => x.SubjectId == pair.Key).DistrictId;
			subjectList.AddItem({ Id: pair.Key, Text: pair.Value, Vars: [subjectDistrict] });
		});
		res += subjectList.ToXML() + '\n\n';
	}

	// города
	let cityList = new SurveyList(GeoConstants.ListNames.City);
	cityList.VarsAsTags = false;
	cities.orderByValue(x => x.CityName).forEach(city => {
		cityList.AddItem({ Id: city.CityId, Text: city.CityName, Vars: [city.DistrictId, city.StrataId, city.SubjectId] });
	});

	res += `
	<!--*
		Var[0] - ФО (District/Регион)
		Var[1] - Страта
		Var[2] - Область (Subject)
	-->
	`;

	res += cityList.ToXML() + '\n\n';

	return res;
}


export async function createGeoPage(groupBy: string[]): Promise<string>
{
	let pageName = "Geo";
	let res = `<Page Id="${pageName}">\n`;
	let resetId = "999999";
	let cityAnswerFilter = '';
	let gropByDistrict = groupBy.contains(GeoConstants.GroupBy.District);
	let gropBySubject = groupBy.contains(GeoConstants.GroupBy.Subject);
	let cityQuestionFilter = '';

	// ФО (District)
	if (gropByDistrict)
	{
		res += `
		<Question Id="${GeoConstants.QuestionNames.District}" Type="RadioButton">
			<Header>В каком регионе Вы проживаете?</Header>
			<Repeat List="${GeoConstants.ListNames.District}">
				<Answer Id="@ID">
					<Filter Side="Client"><![CDATA[ return AnswerExists("${GeoConstants.QuestionNames.District}","@ID") || AnswerExists("${GeoConstants.QuestionNames.District}","${resetId}") || AnswerCount("${pageName}","${GeoConstants.QuestionNames.District}") == 0; ]]></Filter>
					<Text>@Text</Text>
				</Answer>
			</Repeat>
			<Answer Id="${resetId}">
				<Filter Side="Client"><![CDATA[ return AnswerExistsAny("${GeoConstants.QuestionNames.District}","$repeat(${GeoConstants.ListNames.District}){@ID[,]}"); ]]></Filter>
				<Ui Isolate="1"/>
				<Text>Изменить регион</Text>
			</Answer>
		</Question>
		`;
	}

	// Область (Subject)
	if (gropBySubject)
	{
		let answerDistrictFilter = '';
		let questionDistrictFilter = '';
		if (gropByDistrict)
		{
			answerDistrictFilter = `AnswerExists("${GeoConstants.QuestionNames.District}","@Var(0)") && `;
			questionDistrictFilter = `\n<Filter Side="Client"><![CDATA[ return AnswerExistsAny("${GeoConstants.QuestionNames.District}","$repeat(${GeoConstants.ListNames.District}){@ID[,]}"); ]]></Filter>`;
		}
		res += `
		<Question Id="${GeoConstants.QuestionNames.Subject}" Type="RadioButton">${questionDistrictFilter}
			<Header>В какой области Вы проживаете?</Header>
			<Repeat List="${GeoConstants.ListNames.Subject}">
				<Answer Id="@ID">
					<Filter Side="Client"><![CDATA[ return ${answerDistrictFilter}(AnswerExists("${GeoConstants.QuestionNames.Subject}","@ID") || AnswerExists("${GeoConstants.QuestionNames.Subject}","${resetId}") || AnswerCount("${pageName}","${GeoConstants.QuestionNames.Subject}") == 0); ]]></Filter>
					<Text>@Text</Text>
				</Answer>
			</Repeat>
			<Answer Id="${resetId}">
				<Filter Side="Client"><![CDATA[ return AnswerExistsAny("${GeoConstants.QuestionNames.Subject}","$repeat(${GeoConstants.ListNames.Subject}){@ID[,]}"); ]]></Filter>
				<Ui Isolate="1"/>
				<Text>Изменить область</Text>
			</Answer>
		</Question>
		`;
	}

	if (gropBySubject)
	{
		cityAnswerFilter = `<Filter Side="Client">@AnswerExists("${GeoConstants.QuestionNames.Subject}","@Var(2)");</Filter>`;
		cityQuestionFilter = `<Filter Side="Client">return AnswerExistsAny("${GeoConstants.QuestionNames.Subject}","$repeat(${GeoConstants.ListNames.Subject}){@ID[,]}");</Filter>`;
	}
	else if (gropByDistrict)
	{
		cityAnswerFilter = `<Filter Side="Client">@AnswerExists("${GeoConstants.QuestionNames.District}","@Var(0)");</Filter>`;
		cityQuestionFilter = `<Filter Side="Client">return AnswerExistsAny("${GeoConstants.QuestionNames.District}","$repeat(${GeoConstants.ListNames.District}){@ID[,]}");</Filter>`;
	}		

	// Город
	res += `
	<Question Id="${GeoConstants.QuestionNames.City}" Type="RadioButton">${cityQuestionFilter}
		<Header>В каком городе Вы проживаете?</Header>
		<Repeat List="${GeoConstants.ListNames.City}">
			<Answer Id="@ID"><Text>@Text</Text>${cityAnswerFilter}</Answer>
		</Repeat>
		<Answer Id="${resetId}"><Text>Другой</Text></Answer>
	</Question>
	`;

	// Redirect
	res += `
	<Redirect Status="19">
		string city = AnswerID("${GeoConstants.QuestionNames.City}");
		if (city == "${resetId}") return true;
		/*
		string district = GetListItemVar("${GeoConstants.ListNames.City}",city,0); // ФО
		string strata = GetListItemVar("${GeoConstants.ListNames.City}",city,1); // страта
		string subject = GetListItemVar("${GeoConstants.ListNames.City}",city,2); // Область
		*/
		return false;
	</Redirect>
	`;
		
	res += "</Page>";
	return res;
}
