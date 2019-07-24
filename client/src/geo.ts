import * as fs from 'fs';
import { pathExists } from 'tib-api';
import { Path } from './classes';
import xlsx from 'node-xlsx';


const GeoPath = "T:\\=Tiburon_NEW\\Geo";

interface IdName
{
	Id: number;
	Name: string;
}


export class GeoFileLineData
{
    CountryId: number;
	CityId: number;
	DistrictId: number;
	StrataId: number;
	SubjectId: number;
	FilMegafonId: number;

    CountryName: string;
	CityName: string;
	CityPopulation: number;
	DistrictName: string;
	StrataName: string;
	SubjectName: string;
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


export async function readGeoFile(): Promise<GeoFileLineData[]>
{
    let path = getGeoPath();
    if (!path) throw "Путь к файлу с георафией не найден";
    let geoList = await readGeoFileList(path);
    let res = await parseGeoList(geoList);
	return res;
}