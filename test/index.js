
'use strict';

const babel = require('@babel/core');
const chai = require('chai');
const babelStraits = require('../index.js');

const {expect} = chai;


function parse( code ) {
	return babel.transform( code, {
		plugins: [
			{ parserOverride:babelStraits({}).parserOverride },
		]
	}).code;
}

function transform( code ) {
	return babel.transform( code, {
		parserOpts: {
			allowReturnOutsideFunction: true // to transform code passed to `new Function`
		},
		plugins: [
			"./index.js",
		]
	}).code;
}

function evalCode( code, args={} ) {
	return new Function( ...Object.keys(args), transform(`
		'use strict';

		return function() {
			${code}
		};
	`))( ...Object.values(args) );
}

function parseTest( code, thrownByParse=null, thrownByTransform=thrownByParse ) {
	return {
		code,
		thrownByParse,
		thrownByTransform,
	};
}
const parseTests = [
	parseTest(`a.b`			),
	parseTest(`:|`,	/Unexpected token/		),
	parseTest(`a:|()`,	null,	/:| requires a function call as its left operand\./	),
	parseTest(`a:|(b)`,	null,	/:| requires a function call as its left operand\./	),
	parseTest(`.:|b`,	/Unexpected token/		),
	parseTest(`a.|b`,	null,	/:| requires a function call as its left operand\./	),
	parseTest(`a:|b()`			),
	parseTest(`a:|b(1)`			),
	parseTest(`a:|b.c.d[e][f].g(x, "hey")`			),
];

describe(`babel-plugin-transform-pipearg`, function(){
	it(`Parses correctly`, function(){
		parseTests.forEach( ({code, thrownByParse})=>{
			if( thrownByParse ) {
				expect( ()=>parse(code) ).to.throw(thrownByParse, code);
			} else {
				expect( ()=>parse(code) ).not.to.throw(undefined, code);
			}
		});
	});

	it(`Transpiles correctly`, function(){
		parseTests.forEach( ({code, thrownByTransform})=>{
			if( thrownByTransform ) {
				expect( ()=>transform(code) ).to.throw(thrownByTransform, code);
			} else {
				expect( ()=>transform(code) ).not.to.throw(undefined, code);
			}
		});
	});

	it(`Works correctly`, function(){
		const opipeTen = evalCode(`
			return [1,2,3,4]
				:| _.filter( n=>n%2 )	// [1,3]
				:| _.map( n=>n**2 )	// [1,9]
				:| ( _.sum :| _.identity() )();	// 10
		`, {_: require('lodash')} );

		expect( opipeTen() ).to.equal( 10 );
	});

	it(`Strings don't get modified`, function(){
		const cleanStrings = evalCode(`
			function concat( str1, str2 ) {
				return \`\${str1};\${str2}\`;
			}

			return "a :| b()"
				:| concat( \`x:|y(3)\` );
		`);

		expect( cleanStrings() ).to.equal( `a :| b();x:|y(3)` );
	});
});
