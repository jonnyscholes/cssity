var $ = require('jquery');
var specificity = require('css-specificity'); // Just an example of a non-npm package - see setup in package.json

var CssSelectorParser = require('css-selector-parser').CssSelectorParser;

var parser = new CssSelectorParser();
parser.registerNestingOperators('>', '+', '~');
parser.registerAttrEqualityMods('^', '$', '*', '~');

$(document).ready(function(){
	$('.js-calculator').on('change paste keyup', function () {
		checkAndupdate($(this).val());
	});
	checkAndupdate($('.js-calculator').val());
});


function checkAndupdate(value) {
	var spec = calculateSpecificity(value);

	astToArray(value, function(err, arr){
		if(arr.length > 0) {
			var $html = $('<div/>').addClass('example equasion');

			$(arr).each(function (i, elm) {
				var extra = '';
				if (elm.attached) {
					extra = 'to-right';
				}

				$html.append(
					$('<span/>').addClass('example--elm').addClass('theme-' + elm.type + ' ' + extra).text(elm.value)
						.append($('<span/>').addClass('example--elm-meta').text('+' + elm.penalty))
				);
			});
			$html.append($('<span/>').addClass('equasion--result').text('=' + spec));

			$('.js-result').html($html);
		}
	});
}

function calculateSpecificity(str) {
	var c = specificity.calc(str);
	return c[0].a * 100 + c[0].b * 10 + c[0].c;
}

function astToArray(str, callback) {
	var returnArray = [];

	var ast = parser.parse(str);

	if (ast.type === 'ruleSet') {
		parseTree(ast.rule, function(d) {
			returnArray = returnArray.concat(d);
			callback(null, returnArray);
		});
	}
}

function parseTree(tree, callback) {
	var treeSpecificity = [];

	parseTreeLimb(tree, onLimbParsed);

	function onLimbParsed(data) {
		treeSpecificity = treeSpecificity.concat(data.value);

		if(data.tree) {
			parseTreeLimb(data.tree, onLimbParsed);
		} else {
			callback(treeSpecificity);
		}
	}
}

function parseTreeLimb(limb, callback) {
	var arr = [];

	if (limb.id) {
		arr.push({
			'type': 'id',
			'value': '#'+limb.id,
			'penalty': 100
		});
	}

	if (limb.tagName) {
		arr.push({
			'type': 'tag',
			'value': limb.tagName,
			'penalty': 1,
			'attached': limb.classNames ? true : false
		});
	}

	if (limb.classNames) {
		for (var y = 0; y < limb.classNames.length; y++) {
			arr.push({
				'type': 'class',
				'value': '.'+limb.classNames[y],
				'penalty': 10
			});
		}
	}

	if (limb.pseudos) {
		for (var i = 0; i < limb.pseudos.length; i++) {
			if(isPseudoElement(limb.pseudos[i].name)){
				arr.push({
					'type': 'pseudoelement',
					'value': ':'+limb.pseudos[i].name,
					'penalty': 1
				});
			} else {
				arr.push({
					'type': 'pseudoclass',
					'value': ':'+limb.pseudos[i].name,
					'penalty': 10
				});
			}
		}
	}

	if (limb.attrs) {
		for (var x = 0; x < limb.attrs.length; x++) {
			arr.push({
				'type': 'attribute',
				'value': '['+limb.attrs[x].name+limb.attrs[x].operator+limb.attrs[x].value+']',
				'penalty': 10
			});
		}
	}

	if (limb.rule) {
		callback({
			value: arr,
			tree: limb.rule
		});
	} else {
		callback({
			value: arr,
			tree: false
		});
	}
}

function isPseudoElement(str) {
	if (str === 'before' || str === 'after') {
		return true;
	}
	return false;
}



