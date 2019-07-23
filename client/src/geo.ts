import * as xlsx from 'read-excel-file';
import * as fs from 'fs';
import { pathExists } from 'tib-api';
import { Path } from './classes';


const GeoPath = "T:\\=Tiburon_NEW\\Geo";

function createInterface(prefix: string)
{
    let res = {};
    let IdKey = prefix + "Id";
    let NameKey = prefix + "Name";

    res[prefix] = { prop: prefix, type: {} };
    res[prefix]['type'][IdKey] = {
        prop: 'Id',
        type: Number
    }
    res[prefix]['type'][NameKey] = {
        prop: 'Name',
        type: String
    }
    return res;
}


let XlsxGeoSchecme = {
    Country: createInterface('Country'),
    City: createInterface('City'),
    "CityPopulation": {
        prop: 'CityPopulation',
        type: Number
    },
    District: createInterface('District'),
    Starta: createInterface('Starta'),
    Subject: createInterface('Subject'),
    FilMegafon: createInterface('FilMegafon')
}

/* let XlsxGeoSchecme = {

    createInterface("Country"),
    createInterface("City"),

"CityId": {
    prop: 'CityId',
        type: Number
},
"CityName": {
    prop: 'CityName',
        type: String
},
"CityPopulation": {
    prop: 'CityPopulation',
        type: Number
},
"DistrictId": {
    prop: 'DistrictId',
        type: Number
},
"DistrictName": {
    prop: 'DistrictName',
        type: String
},
"StrataId": {
    prop: 'StrataId',
        type: Number
},
"StrataName": {
    prop: 'StrataName',
        type: String
},
"SubjectId": {
    prop: 'SubjectId',
        type: Number
},
"SubjectName": {
    prop: 'SubjectName',
        type: String
},
"FilMegafonId": {
    prop: 'FilMegafonId',
        type: Number
},
"FilMegafonName": {
    prop: 'FilMegafonName',
        type: String
},
}; */


interface IdName
{
    Id: Number;
    Name: String;
}

interface GeoFileLineData
{
    Country: IdName;
    City: IdName;
    CityPopulation: Number;
    District: IdName;
    Starta: IdName;
    Subject: IdName;
    FilMegafon: IdName;
}

export function getGeoPath(): string
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

async function readGeoFileLines(path: string): Promise<GeoFileLineData[]>
{
    let res: GeoFileLineData[] = [];
    let fileData: { rows: [], errors: [] } = await xlsx.readXlsxFile(path, { schema: XlsxGeoSchecme, sheet: 'Geo' });
    if (!!fileData.errors && fileData.errors.length > 0) throw fileData.errors.join('\n');
    return fileData.rows;
}


class GeoFileData
{
    Geo: GeoFileLineData[];

    Countries: IdName[];
    Subjects: IdName[];
    Districts: IdName[];
}


const Lists = [
    "Countries",
    "Subjects",
    "Districts"
];


async function readGeoFile(): Promise<GeoFileData>
{
    let res = new GeoFileData();
    let path = getGeoPath();
    if (!path) throw "Путь к файлу с георафией не найден";

    let lines = await readGeoFileLines(path);
    return res;
}