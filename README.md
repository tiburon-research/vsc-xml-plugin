# Функционал

### Редактирование файлов

Т.к. на данный момент VSCode никак не предупреждает о стороннем изменении открытых в редакторе файлов в расширение добавлена следующая схема блокировки:
- при открытии файла для него устанавливается режим только для чтения (т.е. при попытке изменить и сохранить этот файл все остальные пользователи будут видеть предупреждение о том, что файл защищён от записи);
- при открытии файла, заблокированного другим пользователем показывается предупреждение с указанием имени этого пользователя;
- при закрытии файла блокировка снимается.

**P.S.** Всегда можно отредактировать файл, занятый другим пользователем, если каждый раз утвердительно отвечать на вопрос VSCode о перезаписи защищённого файла.
___

### Подсветка синтаксиса

Внутри XML распознаётся:
* **C#**
  * Внутри тегов Redirect, Filter, Validate и Methods;
  * в кодовых вставках `[c#][/c#]`;
  * в сторчных методах `$method()`.
* **CSS**
  * внутри тега `<style>`;
  * внутри `style=""`.
* **JavaScript**
  * внутри тега `<script>`.
* **Специальные вставки**
  * встроенные функции, такие, как $repeat
  * константы.
___

### Выделение парных элементов

При нахождении курсора на одном из парных элементов второй тоже подсвечивается.
- `<теги>`
- `[теги]`
- `<!--#block сворачивающийся блок-->`
___

### XML шаблоны (Snippets)

Подробнее о создании своих шаблонов можно [почитать тут](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_creating-your-own-snippets).

При вводе расширение предлагает имеющиеся шаблоны (например, Page, Question и т.д.), которые принимаются нажатием клавиши `Tab`. Каждое следующее нажатие `Tab` перемещает курсор к следующей позиции, где предполагается ввод.

![Image](https://github.com/tiburon-research/vsc-xml-plugin/blob/master/stuff/PageSnippet.gif?raw=true)
___

### Кроме структуры XML предусмотрены следующие шаблоны:

* Сворачивающийся блок

![Image](https://github.com/tiburon-research/vsc-xml-plugin/blob/master/stuff/folding.jpg?raw=true)

* Путь для материалов: после ввода `src="` расширение предлагает подставить путь `src="@StoreUrl/t/tib_####"/` с номером проекта из имени файла.

* Готовые части кода, вставляющиеся по префиксу `_` (для XML) и `#` (для C#).

![Image](https://github.com/tiburon-research/vsc-xml-plugin/blob/master/stuff/sexList.gif?raw=true)
___

### Автозавершение атрибутов и значений

Для всех основных тегов (кроме Ui) предлагается список возможных атрибутов. Если атрибут имеет предопределённый список значений, то этот список также подставляется. Для нестроковых атрибутов подставляется значение по умолчанию (для bool-атрибутов — отрицание). Список подставляемых атрибутов фильтруется проверкой на наличие в текущем узле XML.

![Image](https://github.com/tiburon-research/vsc-xml-plugin/blob/master/stuff/quota.gif?raw=true)
___

### Автозавершения в C# коде

* При нахождении в области C# кода предлагаются все возможные функции и почти все глобальные объекты и их свойства и методы из нашего движка, а также некоторые типы/структуры/классы и их статические методы из пространства имён `System`. Кроме того, в автозавершение подтягиваются методы, описанные в блоке `<Methods>` с модификаторами доступа.

* В строках внутри C# предлагаются Id для Page, Question и List.
___

### Переход к определению

С помощью соответствующих пунктов контекстного меню (`Перейти к определению (F12)` или `Показать определени (Alt+F12)`) можно перейти:
- из кодовых вставок к определению функций/переменных, описанных в Methods;
- к Page/Question/List по Id;
- к файлу, указанному в Include;

![Image](https://github.com/tiburon-research/vsc-xml-plugin/blob/master/stuff/definitions.gif?raw=true)
___

### Подсказки при наведении

При наведении курсора на C# функцию, метод, глобальную переменную и т.д. во всплывающем окне появляется соответствующее определение или список возможных перегрузок.

![Image](https://github.com/tiburon-research/vsc-xml-plugin/blob/master/stuff/hovers.gif?raw=true)
___

### Форматирование документа

Стандартная команда форматирования блока (`editor.action.formatDocument`, `Shift`+`Alt`+`F`) форматирует по-разному XML, CSS, JS, C#, обычный текст. На данный момент форматирование подразумевает только изменение пробельных символов (в т.ч. переносы и табуляция) с целью повысить читаемость кода.
Чтобы иметь возможность форматировать C# необходимо установить расширение [C# FixFormat](https://marketplace.visualstudio.com/items?itemName=Leopotam.csharpfixformat). C# форматируется полностью этим расширением - все настройки описаны в его README.
___

### Дополнительные команды

Для всех команд может быть (пере)назначено сочетание клавиш в настройках.
Для вызова команды без сочетания клавиш нужно вызвать командную строку (`Ctrl`+`Shift`+`P`) и ввести название нужной команды.
Все команды расширения можно найти по префиксу `tib.`.

* Обернуть в тег

Выделенный текст можно обернуть в тег с помощью сочетаний клавиш `Ctrl`+`Alt`+`T` (команда `tib.insertTag`). После нажатия `tab` курсор переходит в позицию атрибутов для тега. По следующему нажатию - в положение после закрывающегося тега. По умолчанию оборачивается в тег `[u]`.

![Image](https://github.com/tiburon-research/vsc-xml-plugin/blob/master/stuff/tag.gif?raw=true)

* Обернуть в CDATA

Оборачивает выделенный текст в `<![CDATA[` `]]>`. По умолчанию назначено сочетание клавиш `Ctrl`+`Alt`+`C`.

* Обернуть в сворачиваемый блок

Располагает выделенный текст внутри сворачиваемого блока. По умолчанию назначено сочетание клавиш `Ctrl`+`Alt`+`B`.

* Преобразования `Answer` <-> `Item`

Преобразование выделенных элементов с учётом только `Id` и `Text`.

* Мультистрочная вставка

При вставке текста с помощью этой команды (по умолчанию `Ctrl`+`Alt`+`C`) текст вставляется построчно в каждое выделение (конечно, если количество строк совпадает с количеством выделений). Если все строки вставляемого текста содержат табуляцию, то её предлагается заменить на запятую.

![Image](https://github.com/tiburon-research/vsc-xml-plugin/blob/master/stuff/multipaste.gif?raw=true)

* Открыть код демки

Открывает копию актуального скрипта демонстрационной анкеты (`Ctrl`+`Alt`+`D`).

* Выделить тег

Команда `Выделить текущий тег` (`Ctrl` + `Alt` + `P`) выделяет тег, в котором находится курсор.
Команда `Выделить родительский тег` (`Ctrl` + `Alt` + `G`) выделяет родительский тег (первый после `Survey`).

* Переключение подстановки `Linq`

Команда для быстрого включения/выключения автозавершения из библиотеки `Linq` (`Ctrl` + `Alt` + `L`).
Вызов команды не изменяет настроек. При перезапуске VSCode значение будет браться из одноимённого параметра в настройках `tib.useLinq`.

* Открыть шаблон tibXML

Предлагает выбрать шаблон из XML-файлов в папке, указанной в настройках (`tib.templatePath`) и открывает его как новый документ.

* Удалить Id вопросов из заголовков

Удаляет Id вопросов, если они встречаются в начале заголовка.

* -> AgeList

Преобразование текста (квотных лимитов) в List.

* Сортировка списка

Сортирует выделенный `<List>` или набор элементов `<Item>` по указанному элементу (Id, Text, Var) с учётом типа (если все элементы целочисленные, то сортируется как int, иначе — как строка). Пока сортировка работает с не более чем одним списком.

* Преобразовать в Answer/Item

Преобразует выделенные строки в соответствующие элементы, с выделением Id. Команда пока довольно сырая, но уже удобная.
  Для Items автоматически добавляется List, для Answers добавляется Page и Question в том случае, если первая строка распознана, как заголовок вопроса, начинающийся с Id.
  
![Image](https://github.com/tiburon-research/vsc-xml-plugin/blob/master/stuff/convert.gif?raw=true)

___

### Комментирование

Стандартная команда комментирования зависит от языковой области, в которой вызывается. Если внутри комментируемой области найдены комментарии, команда останавливается.
Также в теме `Tiburon Dark` различаются по цвету 3 вида комментиев (и в XML, и в C# аналогично — добавлением 1 или 2 `*`) и сворачиваемый блок:

![Image](https://github.com/tiburon-research/vsc-xml-plugin/blob/master/stuff/colored_comments.jpg?raw=true)
___

### Тема

Для выбора темы нужно перейти: `Файл -> Параметры -> Цветовая тема`. На данный момент доступна пока только тёмная (`Tiburon Dark`).
О том, как точнее настроить тему под себя можно [почитать тут](https://code.visualstudio.com/docs/getstarted/themes#_customizing-a-color-theme).

Список сущностей:

- `"tib.iterator.prefix"`,
- `"tib.iterator.name"`,
- `"tib.iterator.depth"`,
- `"tib.iterator.varindex"`,
- `"tib.iterator.bracket`",
- `"tib.constant.prefix"`,
- `"tib.constant.name"`,
- `"tib.constant"` (целиком @Const),
- `"entity.name.tag.cdata.tib"`,
- `"punctuation.definition.cdata.prefix.tib"`,
- `"punctuation.definition.cdata.bracket.tib"`,
- `"tib.cdata"` (целиком `<![CDATA[`),
- `"entity.name.tag.allowcode"`,
- `"entity.name.tag.html.tib"`,
- `"entity.stuff.tag.html.tib"` (атрибуты html-тегов),
- `"string.value.id"` (значение XML атрибута `Id`),
- `"tib.inline.method.prefix"` (`$` в строчных методах),
- `"tib.inline.special.prefix"` (`$` в специальных строчных вставках)
- `"tib.inline.special.name"`
- `"tib.inline.repeat-iterator"` (итератор в строчном repeat),
- `"tib.inline.repeat-source"` (источник в строчном repeat),
- `"tib.inline.place-source"` (источник в строчном place),
- `"tib.inline.repeat"` (строчный repeat целиком),
- `"punctuation.definition.comment.block.prefix.tib"` (префикс сворачиваемого блока),
- `"punctuation.definition.comment.block.name.tib"` (имя сворачиваемого блока),
- `"punctuation.definition.comment.block"` (сворачиваемый блок целиком),
- `"punctuation.definition.comment.description"` (комментарий, начинающийся на `<!--*`),
- `"punctuation.definition.comment.warning"` (комментарий, начинающийся на `<!--**`)
___

### Подключённые файлы

Подсказки, переходы, автозавершения и т.д. работают с учётом подключённых (через `<Include>`) файлов.
___


### Диагностика и исправления

Возможные ошибки подчёркиваются цветом (красным или разным зелёным), в зависимости от того насклько всё плохо.

Если есть готовый вариант исправления, то в начале строки с подчёркнутым текстом можно увидеть лампочку, нажатие на которую покажет возможные исправления.

Отключить можно настройкой `tib.enableDiagnostic`.

![Image](https://github.com/tiburon-research/vsc-xml-plugin/blob/master/stuff/diagnostic.gif?raw=true)
___



# Настройка

### Общая настройка VSCode

Настройки открываются так: `Файл -> Параметры -> Параметры`

Это список пользовательских параметров в формате JSON. Чтобы настройки работали всегда и везде, а не только в текущей рабочей области, надо убедиться в том, что (в правом верхнем углу) выбраны `Параметры пользователя`, а не `Параметры рабочей области`.

* **Привязка файлов**

    Чтобы расширение применялось ко всем XML-файлам необходимо указать для них язык `tib`. За это отвечает параметр `files.associations`:
    ```JSON
    "files.associations": {"*.xml": "tib"}
    ```
    Язык для любого файла можно поменять в нижнем правом углу, но это одноразовое изменение - в следующий раз файл откроется в соответствии с настройками. Этим удобно пользоваться в случае, если, например, вы попали в ситуацию, когда расширение `tiburonscripter` сломалось и не даёт нормально дописать скрипт. В этом случае нужно (сразу [написать о проблеме](https://t.me/Gulyaev_Ruslan) и) переключить язык с `tib (Tiburon XML script)` на `xml`.
    
* **Автозавершение**

  Большинство используемых слов встроено в расширение, но VSC может сам предлагать варианты автозавершения на основе слов из редактируемого файла. Если это мешает, то отключается вот так:
  ```JSON
  "editor.wordBasedSuggestions": false
  ```

  Так же отдельно настраиваются некоторые области документа, в которых будет предлагаться автозавершение. Чтобы пользоваться всеми возможностями расширения лучше разрешить их везде (по умолчанию в строках и комментариях эта функция отключена):
  ```JSON
  "editor.quickSuggestions": 
  {
    "comments": true,
    "strings": true // включается расширением автоматически
  },
  ```
  
 * **Кодировка файла**
    
   Чтобы VSC пытался сам определить кодировку файла нужно включить
   ```JSON
   "files.autoGuessEncoding": true
   ```
___

### Настройки расширения

Все настройки расширения имеют префикс `tib`.

* `tib.demoPath` - путь к скрипту демонстрационной анкеты (используется в команде `Открыть код демки`);
* `tib.formatSettings` - настройки форматирования
  - `braceStyle` - стиль открывающейся скобки для JS и CSS: одно из значений: `expand` (на следующей строке) или `collapse` (на той же);
* `tib.useLinq` - предлагать ли для автозавершения функции из библиотеки `Linq` (статические методы `IEnumerable`);
* `tib.ShowTagInfo` - показывать информацию о текущем положени;
* `tib.templatePath` - путь к папке с шаблонами;
* `tib.enableCache` - кэширование документа (полезно для больших джокументов);
* `tib.ShowHelpMessages` - предлагать подсказки по оптимизации (всплывающие окна);
* `tib.showFullPath` - всегда показывать полный путь к файлу в информационных сообщениях.
* `tib.upcaseFirstLetter` - автоматически заменять первую букву тегов на заглавную.
* `tib.enableDiagnostic` - включает/отключает диагностику.
* `tib.enableFileLock` - включает/отключает блокировку редактируемых файлов.
___

### Разное полезное

* **Символы согласия с предложением**
  
  По умолчанию предложение автозавершения принимается не только клавишей `Tab`, но и `Enter`. Это не всегда удобно. Отключается вот так:
  ```JSON
  "editor.acceptSuggestionOnEnter": "off"
  ```

* **Мультикурсорный ввод**

  По умолчанию мультикурсорный ввод осуществляется с помощью клавиши `Alt`. Для изменения используется следующий параметр:
  ```JSON
  "editor.multiCursorModifier": "ctrlCmd"
  ```

* **Сочетания клавиш**

  Многие сочетания клавиш отличаются от привычного для многих `UltraEdit`, их можно настроить под себя: `Файл -> Параметры -> Сочетания клавиш`.
    Также на сочетание клавиш можно повесить любой шаблон. Для этого нужно открыть файл `keybindings.json` (ссылка на него есть в окне настройки сочетания клавиш) и добавить туда такой элемент:
  ```JSON
    {
      "key": "ctrl+alt+.", // сочетание клавиш
      "command": "editor.action.insertSnippet",
      "args": {
        "name": "RedirectStatus" // имя шаблона
      }
  }
  ```
  Список шаблонов расширения:
  * `ftpPath` - Стандартный путь к материалам проета;
	* `src` - img с путём к материалам проета;
	* `blockFolding` - Сворачиваемый блок;
	* `blockLight` - Зелёный блок;
	* `blockWarning` - Красный блок;
	* `PageFull` - Полная структура Page;
	* `PageShort` - Краткая структура Page;
	* `Question` - Структура Question;
	* `Block` - Структура Block;
	* `List` - Структура List;
	* `RedirectCode` - Структура Redirect;
	* `RedirectStatus` - Структура Redirect со статусом;
	* `Redirect18` - Финальный Redirect;
	* `Validate` - Структура Validate;
	* `Filter` - Структура Filter;
	* `CDATA` - CDATA;
	* `CustomText1` - CustomText1;
	* `CustomText2` - CustomText2 (+style);
	* `Quota` - Структура Quota;
	* `Methods` - Структура Methods;

* **Количество видимых редакторов**
  
  Чтобы окно с открытыми файлами не ограничивалось по размеру полезно сделать так:
  ```JSON
  "explorer.openEditors.visible": 99
  ```
___


# Особенности

### Условия в `<Item>` вместо C#-кода

Если вместо C# используются условные `<Item Page="" Question="" Answer=""/>`, то во избежание коллапса подсветки после тега (например `<Redirect>`) необходимо поставить пробел или табуляцию на той же строке. В этом случае текст внутри будет подсвечен, как обычный `XML`. При форматировании документа этото момент должен разрешаться автоматически.
___

### `<Methods>`

Чтобы использовать все возможности расширения, касающиеся пользовательского кода, методы и переменные нужно объявлять с модификатором доступа (`public/private/protected`). В противном случае они не будут попадать в список автозавершения и их сингнатуры не будут видны при наведении.
___

### Сочетания клавиш для вызова команд

Все команды (за исключением мультистрочной вставки) расширения завязаны по умолчанию на сочетания клавиш, начинающиеся с `Ctrl`+`Alt`, что является не рекомендуемым вариантом для Windows =) Поэтому в случае возникновения проблем просьба сообщать.

___

### Константы

Расширение умеет работать только с константами, не содержащими символ `_`.


# Обратная связь

* GitHub: 
  - [репозиторий](https://github.com/tiburon-research/vsc-xml-plugin),
  - [проблемы/предложения](https://github.com/tiburon-research/vsc-xml-plugin/issues).