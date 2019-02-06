
'use strict';

const assert = require('assert');

function parserOverride( code, options, parse ) {
	code = code.replace(/:\|/g, `*_OPIPE_**` );
	return parse( code, options );
}

// turning `_OPIPE_` within strings back into `:|`
// NOTE: if a string had `_OPIPE_` originally, that'd be screwed up, escape those, maybe?
function cleanString( str ) {
	return str.replace(/\*_OPIPE_\**/g, `:|` );
}

module.exports = function( args ) {
	const t = args.types;

	return {
		parserOverride,
		visitor: {
			// a :| b
			Identifier( path ) {
				if( path.node.name !== '_OPIPE_' ) {
					return;
				}

				// `a:|b` is represented in the AST as `a*_OPIPE_**b`

				// opipe1Path = the `_OPIPE_**b` binary expression
				const opipe1Path = path.parentPath;
				assert( opipe1Path.node.type === 'BinaryExpression' );
				assert( opipe1Path.node.operator === '**' );
				assert( opipe1Path.get('left') === path );

				// opipe2Path = the `a*(_OPIPE_**b)` binary expression
				const opipe2Path = opipe1Path.parentPath;
				assert( opipe2Path.node.type === 'BinaryExpression' );
				assert( opipe2Path.node.operator === '*' );
				assert( opipe2Path.get('right') === opipe1Path );

				// objectPath = `a`, the object `:|` is used on
				const objectPath = opipe2Path.get('left');

				// functionPath = `b`, the function to the right of `:|`
				const functionPath = opipe1Path.get('right');
				assert( functionPath.node.type === 'CallExpression', `:| requires a function call as its right operand` );

				opipe2Path.replaceWith(
					t.CallExpression(
						functionPath.node.callee,
						[ objectPath.node ].concat( functionPath.node.arguments )
					)
				);
			},

			StringLiteral( literalPath ) {
				const str = literalPath.node.value;
				const newStr = cleanString( str );
				if( newStr === str ) {
					return;
				}

				literalPath.replaceWith(
					t.stringLiteral(
						newStr
					)
				);
			},
			TemplateElement( elementPath ) {
				const {value, tail} = elementPath.node;
				const newValue = {
					raw: cleanString( value.raw ),
					cooked: cleanString( value.cooked ),
				};
				if( newValue.raw === value.raw || newValue.cooked === value.cooked ) {
					return;
				}

				elementPath.replaceWith(
					t.templateElement(
						newValue,
						tail
					)
				);
			},
		},
	};
};
