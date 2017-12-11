# Настройка

### Общая настройка VSCode

Настройки открываются так: `Файл -> Параметры -> Параметры`

Это список пользовательских параметров в формате JSON. Чтобы настройки работали всегда и везде, а не только в текущей рабочей области, надо убедиться в том, что (в правом верхнем углу) выбраны `Параметры пользователя`, а не `Параметры рабочей области`.

* **Привязка файлов**

    Чтобы расширение применялось ко всем XML-файлам необходимо указать для них язык `tib`. За это отвечает параметр `files.associations`:
    ```JSON
    "files.associations": {"*.xml": "tib"}
    ```
    Язык для любого файла можно поменять в нижнем правом углу, но это одноразовое изменение - в следующий раз файл откроется в соответствии с настройками. Этим удобно пользоваться в случае, если, например, вы попали в ситуацию, когда расширение `tiburonscripter` сломалось и не даёт нормально дописать скрипт. В этом случае нужно (сразу [написать о проблеме](https://t.me/Gulyaev_Ruslan) и) переключить язык с `tib` на `xml`.
    
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
    "strings": true
  },
  ```
  
 * **Кодировка файла**
    
   Чтобы VSC пытался сам определить кодировку файла нужно включить
   ```JSON
   "files.autoGuessEncoding": true
   ```   

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

* **Количество видимых редакторов**
  
  Чтобы окно с открытыми файлами не ограничивалось по размеру полезно сделать так:
  ```JSON
  "explorer.openEditors.visible": 99
  ```

* **Полезные расширения**

  * `Auto Rename Tag` - при редактировании имени тега автоматически редактирует парный тег. [Скачать можно тут](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag).


# Функционал

### Подсветка синтаксиса

Внутри XML распознаётся:
* **C#**
  * Внутри тегов Redirect, Filter, Validate и Methods;
  * в кодовых вставках `[c#][/c#]`;
  * в сторчных методах `$method()`.
* **CSS**
  * внутри тега `<style>`
  * внутри `style=""`
* **JavaScript**
  * внутри тега `<script>`

### XML шаблоны (Snippets)

При вводе расширение предлагает имеющиеся шаблоны (например, Page, Question и т.д.), которые принимаются нажатием клавиши `Tab`. Каждое следующее нажатие `Tab` перемещает курсор к следующей позиции, где предполагается ввод.

![Image](https://github.com/tiburon-research/vsc-xml-plugin/blob/master/stuff/PageSnippet.gif?raw=true)

### Кроме структуры XML предусмотрены следующие шаблоны:
* Сворачивающийся блок
```xml
  <!--#block Тестирование упаковок -->

    <Page Id="Q1">
    ...
    </Page>
  
  <!--#endBlock-->
```

* Путь для материалов: после ввода `src="` расширение предлагает подставить путь `src="@StoreUrl/t/tib_####"/` с номером проекта из имени файла.

### Переход к определению

Из кодовых вставок в скрипте можно переходить к определению функций/переменных, описанных в Methods. Это делается с помощью соответствующих пунктов контекстного меню (`Перейти к определению (F12)` или `Показать определени (Alt+F12)`).
![Image](https://github.com/tiburon-research/vsc-xml-plugin/blob/master/stuff/definitions.gif?raw=true)

### подсказки при наведении

При наведении курсора на C# функцию, метод, глобальную переменную и т.д. во всплывающем окне появляется соответствующее определение или список возможных перегрузок.
![Image](https://github.com/tiburon-research/vsc-xml-plugin/blob/master/stuff/hovers.gif?raw=true)


# Особенности

### Условия в `<Item>` вместо C#-кода

Если вместо C# используются условные `<Item Page="" Question="" Answer=""/>`, то во избежание коллапса подсветки после тега (например `<Redirect>`) необходимо поставить пробел или табуляцию на той же строке. В этом случае текст внутри будет подсвечен, как обычный `XML`.

### <Methods>

Чтобы использовать все возможности расширения, касающиеся пользовательского кода, методы и переменные нужно объявлять с модификатором доступа (`public/private/protected`). В противном случае они не будут попадать в список автозавершения и их сингнатуры не будут видны при наведении.


# Обратная связь

* GitHub: 
  - [репозиторий](https://github.com/tiburon-research/vsc-xml-plugin),
  - [проблемы](https://github.com/tiburon-research/vsc-xml-plugin/issues),
  - [список пожеланий](https://github.com/tiburon-research/vsc-xml-plugin/issues/1).

* Можно писать [напрямую в Telegram](https://t.me/Gulyaev_Ruslan)