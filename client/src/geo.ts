import { KeyedCollection } from 'tib-api';
import { SurveyList, SurveyListItemObject } from 'tib-api/lib/surveyObjects';
import { City, GeoClusters, GeoConstants, GeoData, getAllCities } from '@vsc-xml-plugin/geo';


var geoFileCache: City[] = [];

/** Возвращает все города */
export async function readGeoFile(): Promise<GeoData>
{
	if (geoFileCache.length == 0)
	{
		geoFileCache = (await getAllCities()).get(false);
	}
	return new GeoData(geoFileCache);
}


/** Создаёт все нужные списки для географии */
export async function createGeolists(cities: City[], lists: string[], withPopulation: boolean): Promise<string>
{
	let res = '\n\n';
	let international = cities.map(x => x.CountryId).distinct().length > 1;

	// Страны
	if (international)
	{
		let cityList = new SurveyList(GeoConstants.ListNames.Country);
		cityList.VarsAsTags = false;
		let filteredCountries = KeyedCollection.FromPairs(cities.map(x => { return { Key: x.CountryId, Value: x.CountryName } }));
		filteredCountries.OrderBy((key, value) => value).ForEach((key, value) =>
		{
			cityList.AddItem({ Id: key, Text: value });
		});
		res += cityList.ToXML() + '\n\n';
	}

	// ФО
	if (lists.contains(GeoConstants.GroupBy.District))
	{
		let districtList = new SurveyList(GeoConstants.ListNames.District);
		districtList.VarsAsTags = false;
		let filteredDistricts = KeyedCollection.FromPairs(cities.map(x => { return { Key: x.DistrictId, Value: { Name: x.DistrictName, Country: x.CountryId } } }));
		filteredDistricts.OrderBy((key, value) => value.Name).ForEach((key, value) =>
		{
			let item: SurveyListItemObject = {
				Id: key,
				Text: value.Name
			}
			if (international) item.Vars = [value.Country];
			districtList.AddItem(item);
		});
		if (international) res += '\t<!--* Var[0] - Страна -->';
		res += districtList.ToXML() + '\n\n';
	}

	// Области
	if (lists.contains(GeoConstants.GroupBy.Subject))
	{
		let subjectList = new SurveyList(GeoConstants.ListNames.Subject);
		subjectList.VarsAsTags = false;
		let filteredSubjects = KeyedCollection.FromPairs(cities.map(x => { return { Key: x.SubjectId, Value: x.SubjectName } }));
		filteredSubjects.OrderBy((key, value) => value).ForEach((key, value) =>
		{
			let subjectDistrict = cities.find(x => x.SubjectId == key).DistrictId;
			subjectList.AddItem({ Id: key, Text: value, Vars: [subjectDistrict] });
		});
		res += subjectList.ToXML() + '\n\n';
	}


	// страты
	if (!withPopulation)
	{
		let stratalist = new SurveyList(GeoConstants.ListNames.Strata);
		let stratas = KeyedCollection.FromPairs(cities.map(x => { return { Key: x.StrataId, Value: x.StrataName } }))
		stratalist.AddItemRange(stratas.ToArray((key, value) => { return { Id: key, Text: value }; }));
		res += stratalist.ToXML() + '\n\n';
	}


	// города
	let cityList = new SurveyList(GeoConstants.ListNames.City);
	cityList.VarsAsTags = false;
	cities.orderByValue(x => x.CityName).forEach(city =>
	{
		let vars = [city.DistrictId, city.StrataId, city.SubjectId];
		if (withPopulation) vars.push('' + city.CityPopulation);
		cityList.AddItem({ Id: city.CityId, Text: city.CityName, Vars: vars });
	});

	res += `
	<!--*
		Var[0] - ФО (District/Регион)
		Var[1] - Страта
		Var[2] - Область (Subject)${withPopulation ? "\n\t\tVar[3] - Население" : ""}
	-->
	`;

	res += cityList.ToXML() + '\n\n';

	return res;
}


export async function createGeoPage(groupBy: string[], questionIds: GeoClusters, withPopulation: boolean, asComboBox: boolean): Promise<string>
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
		<Question Id="${questionIds.District}" Type="RadioButton">
			<Header>В каком регионе Вы проживаете?</Header>
			<Repeat List="${GeoConstants.ListNames.District}">
				<Answer Id="@ID">
					<Filter Side="Client"><![CDATA[ return AnswerExists("${questionIds.District}","@ID") || AnswerExists("${questionIds.District}","${resetId}") || AnswerCount("${pageName}","${questionIds.District}") == 0; ]]></Filter>
					<Text>@Text</Text>
				</Answer>
			</Repeat>
			<Answer Id="${resetId}">
				<Filter Side="Client"><![CDATA[ return AnswerExistsAny("${questionIds.District}","$repeat(${GeoConstants.ListNames.District}){@ID[,]}"); ]]></Filter>
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
			answerDistrictFilter = `AnswerExists("${questionIds.District}","@Var(0)") && `;
			questionDistrictFilter = `\n<Filter Side="Client"><![CDATA[ return AnswerExistsAny("${questionIds.District}","$repeat(${GeoConstants.ListNames.District}){@ID[,]}"); ]]></Filter>`;
		}
		res += `
		<Question Id="${questionIds.Subject}" Type="RadioButton">${questionDistrictFilter}
			<Header>В какой области Вы проживаете?</Header>
			<Repeat List="${GeoConstants.ListNames.Subject}">
				<Answer Id="@ID">
					<Filter Side="Client"><![CDATA[ return ${answerDistrictFilter}(AnswerExists("${questionIds.Subject}","@ID") || AnswerExists("${questionIds.Subject}","${resetId}") || AnswerCount("${pageName}","${questionIds.Subject}") == 0); ]]></Filter>
					<Text>@Text</Text>
				</Answer>
			</Repeat>
			<Answer Id="${resetId}">
				<Filter Side="Client"><![CDATA[ return AnswerExistsAny("${questionIds.Subject}","$repeat(${GeoConstants.ListNames.Subject}){@ID[,]}"); ]]></Filter>
				<Ui Isolate="1"/>
				<Text>Изменить область</Text>
			</Answer>
		</Question>
		`;
	}

	if (gropBySubject)
	{
		cityAnswerFilter = `<Filter Side="Client">@AnswerExists("${questionIds.Subject}","@Var(2)");</Filter>`;
		cityQuestionFilter = `<Filter Side="Client">return AnswerExistsAny("${questionIds.Subject}","$repeat(${GeoConstants.ListNames.Subject}){@ID[,]}");</Filter>`;
	}
	else if (gropByDistrict)
	{
		cityAnswerFilter = `<Filter Side="Client">@AnswerExists("${questionIds.District}","@Var(0)");</Filter>`;
		cityQuestionFilter = `<Filter Side="Client">return AnswerExistsAny("${questionIds.District}","$repeat(${GeoConstants.ListNames.District}){@ID[,]}");</Filter>`;
	}

	// Город
	res += `
	<Question Id="${questionIds.City}" Type="RadioButton">${cityQuestionFilter}
		<Header>В каком городе Вы проживаете?</Header>${asComboBox ? '\n<Ui Extend="ComboBox" Search="1" Label="Выберите из списка"/>' : ''}
		<Repeat List="${GeoConstants.ListNames.City}">
			<Answer Id="@ID"><Text>@Text</Text>${cityAnswerFilter}</Answer>
		</Repeat>
		<Answer Id="${resetId}" Reset="true"><Text>${asComboBox ? "Моего города нет в списке" : "Другой"}</Text></Answer>
	</Question>
	`;

	// Redirect
	res += `
	<Redirect Status="19"><![CDATA[
		string city = AnswerID("${questionIds.City}");
		if (city == "${resetId}") return true; /*** выше этой строчки не должно быть ничего кроме получения city */
		/*
		string district = GetListItemVar("${GeoConstants.ListNames.City}",city,0); // ФО
		string strata = GetListItemVar("${GeoConstants.ListNames.City}",city,1); // Страта
		AnswerUpdateP("RespInfo", "Strata", strata);
		string subject = GetListItemVar("${GeoConstants.ListNames.City}",city,2); // Область
		AnswerUpdateP("RespInfo", "Subject", subject);${withPopulation ? `\n\t\tint population = int.Parse(GetListItemVar("${GeoConstants.ListNames.City}",city,3)); // население` : ''}
		*/
		return false;
	]]></Redirect>
	`;

	res += "</Page>";
	return res;
}
