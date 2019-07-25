import * as fs from 'fs';
import { pathExists, KeyValuePair, KeyedCollection } from 'tib-api';
import { Path } from './classes';
import xlsx from 'node-xlsx';
import { SurveyList } from 'tib-api/lib/surveyObjects';


const GeoPath = "T:\\=Tiburon_NEW\\Geo";


export const GeoConstants = {
	/** Названия компоновки географии */
	GroupBy: {
		Subject: "Федеральный округ",
		District: "Область"
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
		let districtList = new SurveyList("districtList");
		districtList.VarsAsTags = false;
		let filteredDistricts = KeyedCollection.FromPairs(cities.map(x => { return { Key: x.DistrictId, Value: x.DistrictName } }));
		filteredDistricts.ForEach((key, value) =>
		{
			districtList.AddItem({ Id: key, Text: value });
		});
		res += districtList.ToXML() + '\n\n';
	}

	// Области
	if (groupBy.contains(GeoConstants.GroupBy.Subject))
	{
		let subjectList = new SurveyList("subjectList");
		subjectList.VarsAsTags = false;
		let filteredSubjects = KeyedCollection.FromPairs(cities.map(x => { return { Key: x.SubjectId, Value: x.SubjectName } }));
		filteredSubjects.ForEach((key, value) =>
		{
			let subjectDistrict = cities.find(x => x.SubjectId == key).DistrictId;
			subjectList.AddItem({ Id: key, Text: value, Vars: [subjectDistrict] });
		});
		res += subjectList.ToXML() + '\n\n';
	}

	// города
	let cityList = new SurveyList("cityList");
	cityList.VarsAsTags = false;
	cities.forEach(city =>
	{
		cityList.AddItem({ Id: city.CityId, Text: city.CityName, Vars: [city.SubjectId, city.StrataId, city.DistrictId] });
	});

	res += cityList.ToXML() + '\n\n';

	return res;
}


