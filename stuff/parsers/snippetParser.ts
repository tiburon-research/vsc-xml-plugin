import * as fs from 'fs'


function getSnippet(fileName: string): Object
{
	let fileData = fs.readFileSync(fileName).toString();
	return JSON.parse(fileData);
}


function snippetString(name: string, snippet: Object): string
{
	return `\t* \`${name}\` - ${snippet["description"]};`;
}


export function getAllSnippets(directory: string): string
{
	let res = "";
	let files = fs.readdirSync(directory).map(x => directory + "\\" + x);
	files.forEach(file => 
	{
	    let obj = getSnippet(file);
	    for (let name in obj)
	    {
	        res += snippetString(name, obj[name]) + "\n";
	    }
	});
	return res;
}