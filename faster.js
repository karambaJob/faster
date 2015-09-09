

function fasterClass() {
	this.sessionKey = parseInt(Math.random() * 100000);
	this.el = null; //элемент для отображения
	this.elSelector = 'fasterWin'; //ид элемента
	this.timer = 0;
	this.emptyTable = true;
	this.labels = {}; //объект, содержащий замеры времени
	this.tableHtml = "<div id='fasterTitle'>" //шаблон для отображения таблицы
						+ "faster"
					+"</div>"
					+ "Время: <span id='fasterTimeSpend'></span>"
					+ "<table id='fasterTable'>"
						+ "<col width='80px' /><col/><col/>"
						+ "<tr class='header'>"
							+ "<td>Метка</td><td>Время(разница)</td><td>Среднее</td>"
						+ "</tr>"
					+ "</table>"
					+ "<button onClick='fasterObj.clearLabelsStorage()'>ClearStorage</button><button onClick='faster()'>add</button>";

	this.style = "#fasterWin {background: white; z-index: 100000;top:10px;right:10px; position: fixed; border: 1px solid; text-align:center;} #fasterTable {width:300px;table-layout: fixed; border-collapse: collapse;} #fasterTable td {overflow: hidden; border-bottom: 1px solid black;} #fasterTitle {font-weight: bold} #fasterTable .header {font-weight: bold}"

	this.clearLabelsStorage = function() {
		if(window.localStorage && window.localStorage.fasterLabels) {
			delete window.localStorage.fasterLabels;
		}
	}

	/**
	 * Создает, если его нету, и возвращает объект для отображения времени
	 * @return {[type]} [description]
	 */
	this.getEl = function() {
		this.el = document.getElementById(this.elSelector);
		if(this.el == null) {
			var newDiv = document.createElement("div");
			newDiv.setAttribute('id', this.elSelector);
			newDiv.innerHTML = this.tableHtml;
			document.getElementsByTagName('body')[0].appendChild(newDiv);
			this.el = document.getElementById(this.elSelector);
			this.emptyTable = true;

			this.addStyle();
		}
		return this.el;
	}
	/**
	 * Добавить стили (елается через js для повышения мобильности)
	 */
	this.addStyle = function() {
		var css = this.style,
			head = document.head || document.getElementsByTagName('head')[0],
			style = document.createElement('style');

		style.type = 'text/css';
		if (style.styleSheet){
			style.styleSheet.cssText = css;
		} else {
			style.appendChild(document.createTextNode(css));
		}

		head.appendChild(style);
	}
	/**
	 * Получить последний элемент в объекте
	 * @return {[type]}
	 */
	this.getLastLabel = function() {
		for(var x in this.labels) {

		}
		return this.labels[x];
	}
	/**
	 * Отобразить таймер
	 * @return {[type]}
	 */
	this.startTimer = function() {
		var that = this;
		setInterval(function() {
			that.timer = that.checkTime();
			document.getElementById('fasterTimeSpend').innerHTML = that.timer + ' s.';
		}, 50);
	}
	/**
	 * Сколько времени прошло с момента старта
	 * @return {[type]} [description]
	 */
	this.checkTime = function() {
		return this.inSec(new Date() - this.labels.start.timeVal);
	}
	/**
	 * Сгенерировать имя для замера
	 * @return {[type]} [description]
	 */
	this.getName = function() {
		return 'Метка ' + this.checkTime();
	}
	/**
	 * Добавить метку
	 * @param  {object|string} params
	 * @return {[type]}        [description]
	 */
	this.showTime = function(params) {
		var el = this.getEl();

		if(typeof this.labels.start === 'undefined') {
			this.labels.start = {
				timeVal: new Date(),
				timeShow: 0,
				name: 'start',
				timeDiff: 0
			}

			this.startTimer();
		} else {
			this.labels[new Date()] = {
				timeVal: new Date(),
				timeShow: this.checkTime(),
				name: (params && params.name) ? params.name : this.getName(),
				timeDiff: this.inSec(new Date() - this.getLastLabel().timeVal)
			}
		}
		this.saveLabelsInStorage();
		this.showLabel(this.getLastLabel());
	}
	/**
	 * Сохранить значения для высчитывыания среднего значения
	 * @return {[type]} [description]
	 */
	this.saveLabelsInStorage = function() {
		if(window.localStorage) {
			var fasterLabels = {};
			if(window.localStorage.fasterLabels) {
				fasterLabels = JSON.parse(window.localStorage.fasterLabels);
			}

			fasterLabels[this.sessionKey] = this.labels;
			window.localStorage.fasterLabels = JSON.stringify(fasterLabels);
		}
	}
	/**
	 * Милиссекунды в секунды
	 * @param  {int} val 
	 * @return {float}
	 */
	this.inSec = function(val) {
		return val/1000;
	}
	/**
	 * Получить замеры времени
	 * @return {[type]} [description]
	 */
	this.getLabels = function() {
		if(this.emptyTable && typeof this.labels.start !== 'undefined') {
			for(var x in this.labels) {
				this.showLabel(this.labels[x]);
			}
			this.emptyTable = false;
		}
	}
	/**
	 * Показать метку в таблице
	 * @param  {object} label
	 * @return {}
	 */
	this.showLabel = function(label) {
		var table = document.getElementById("fasterTable");

		var row = table.insertRow();
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);
		var cell3 = row.insertCell(2);

		cell1.innerHTML = label.name;
		cell1.setAttribute('width', '100px');
		cell1.setAttribute('title', label.name);
		cell2.innerHTML = label.timeShow + ' (+' + label.timeDiff + ')';
		cell3.innerHTML = this.getAverage(label.name);
	}
	/**
	 * Получить среднее по замерам (идентификатором считается имя)
	 * @param  {[type]} name имя замера
	 * @return {[type]} 
	 */
	this.getAverage = function(name) {
		if(window.localStorage && window.localStorage.fasterLabels) {
			var fasterLabels = JSON.parse(window.localStorage.fasterLabels);
			var averageArr = [];
			var average = '';
			for(var x in fasterLabels) {
				for(var y in fasterLabels[x]) {
					if(fasterLabels[x][y].name == name) {
						averageArr.push(fasterLabels[x][y].timeShow);
					}
				}
			}
			var sum = 0;
			for(var i = 0; i < averageArr.length; i++) {
				sum += parseFloat(averageArr[i]);
			}
			if(sum > 0) {
				average = (sum/averageArr.length).toFixed(3);
			}

			return average;
		} else {
			return '';
		}
	}
}


/**
 * Обертка для создания объекта
 * @param  {[type]} params [description]
 * @return {[type]}		[description]
 */
function faster(params) {
	if(typeof window.fasterObj === 'undefined') {
		window.fasterObj = new fasterClass();
	}
	if(typeof params === 'string') {
		var str = params;
		params = {
			name: str
		}
	}

	window.fasterObj.showTime(params);
}


function getQueryParams(qs) {
	qs = qs.split('+').join(' ');

	var params = {},
		tokens,
		re = /[?&]?([^=]+)=([^&]*)/g;

	while (tokens = re.exec(qs)) {
		params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
	}

	return params;
}

window.onload = function() {
	var query = getQueryParams(document.location.search);
	if(query.faster == 'true') {
		faster();
	}
};

