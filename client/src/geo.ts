import * as fs from 'fs';
import { pathExists, KeyedCollection } from 'tib-api';
import { Path } from './classes';
import xlsx from 'node-xlsx';


const GeoPath = "T:\\=Tiburon_NEW\\Geo";

interface IdName
{
	Id: Number;
	Name: String;
}

class GeoFileLineData extends Object
{
	CountryId: number;
	CountryName: string;
	CityId: number;
	CityName: string;
	CityPopulation: number;
	DistrictId: number;
	DistrictName: string;
	StrataId: number;
	StrataName: string;
	SubjectId: number;
	SubjectName: string;
	FilMegafonId: number;
	FilMegafonName: string;
}

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

async function parseGeoList(data: [][]): Promise<GeoFileData>
{
	let lines = data.concat([]);
	let cellNames = lines.shift();
	let res = new GeoFileData();
	lines.forEach(line =>
	{
	    if (line.length != cellNames.length) return;
	    let lineData = new GeoFileLineData();
	    for (let i = 0; i < cellNames.length; i++)
	    {
	        let name = cellNames[i];
	        if (lineData.hasOwnProperty(name)) lineData[name] = line[i];
	    }
	    res.AddLine(lineData);
	});
	return res;
}

interface CityData extends IdName
{
	Population: number;
}

class GeoFileData
{
	Geo: GeoFileLineData[] = [];
	City: CityData[];
	Country: IdName[];
	Subject: IdName[];
	District: IdName[];
    Starta: IdName[];
    
    private _propertyList = ["Country", "Subject", "District", "Strata"];

	public AddLine(data: GeoFileLineData)
	{
        this.Geo.push(data);
        
        if (!!data.CityId && !this.City.find(value => { value.Id == data.CityId })) this.City.push({ Id: data.CityId, Name: data.CityName, Population: data.CityPopulation });
        
        this._propertyList.forEach(prefix =>
        {
            let thisProp = this[prefix] as IdName[];
            let dataPropId = data[prefix + "Id"] as number;
            
            if (!!dataPropId && !thisProp.find(x => { x.Id == dataPropId })) thisProp.push({ Id: dataPropId, Name:  data[prefix + "Name"] });
        });
	}
}


export async function readGeoFile(): Promise<GeoFileData>
{
	let path = getGeoPath();
    if (!path) throw "Путь к файлу с георафией не найден";
    let geoList = await readGeoFileList("T:\\=Tiburon_NEW\\Geo\\test.xlsx");
    console.log('start');
    let res = await parseGeoList(geoList);
    console.log('stop');
    console.log(res);
	return res;
}