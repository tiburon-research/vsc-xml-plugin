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


class IGeoFileLineData
{
    CountryId: number;
	CityId: number;
	DistrictId: number;
	StrataId: number;
	SubjectId: number;
	FilMegafonId: number;
}


class GeoFileLineData extends IGeoFileLineData
{
	CountryName: string;
	CityName: string;
	CityPopulation: number;
	DistrictName: string;
	StrataName: string;
	SubjectName: string;
    FilMegafonName: string;

    public reduce(): IGeoFileLineData
    {
        let { 
            CountryId,
            CityId,
            DistrictId,
            StrataId,
            SubjectId,
            FilMegafonId
        } = this;
        return {
            CountryId,
            CityId,
            DistrictId,
            StrataId,
            SubjectId,
            FilMegafonId
        }
    }
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
        // либо все, либо без мегафона
        if (line.length != cellNames.length && line.length != cellNames.length - 2) return;
	    let lineData = new GeoFileLineData();
	    for (let i = 0; i < cellNames.length; i++)
	    {
	        lineData[cellNames[i]] = line[i];
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
	Geo: IGeoFileLineData[] = [];
	City: CityData[] = [];
	Country: IdName[] = [];
	Subject: IdName[] = [];
	District: IdName[] = [];
    Strata: IdName[] = [];
    
    private _propertyList = ["Country", "Subject", "District", "Strata"];

	public AddLine(data: GeoFileLineData)
	{
        this.Geo.push(data.reduce());
        
        if (!!data.CityId && !this.City.find(value => value.Id == data.CityId )) this.City.push({ Id: data.CityId, Name: data.CityName, Population: data.CityPopulation });
        
        this._propertyList.forEach(prefix =>
        {
            let thisProp = this[prefix] as IdName[];
            let dataPropId = data[prefix + "Id"] as number;
            
            if (!!dataPropId && !thisProp.find(x => x.Id == dataPropId)) thisProp.push({ Id: dataPropId, Name:  data[prefix + "Name"] });
        });
	}
}


export async function readGeoFile(): Promise<GeoFileData>
{
    let path = getGeoPath();
    if (!path) throw "Путь к файлу с георафией не найден";
    let geoList = await readGeoFileList(path);
    let res = await parseGeoList(geoList);
	return res;
}