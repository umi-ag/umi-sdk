
module.exports = {
  'root': true,
  'parser': '@typescript-eslint/parser',
  'plugins': [
    'import',
    'unused-imports',
    '@typescript-eslint',
  ],
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  'settings': {
    'import/resolver': {
      'node': {
        'moduleDirectory': ['node_modules', './'],
        'extensions': ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  'rules': {
    'no-multi-spaces': 'error',
    'no-multiple-empty-lines': ['error', { 'max': 1 }],
    'func-call-spacing': ['error', 'never'],
    'no-unneeded-ternary': 'error',
    'quotes': ['error', 'single'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-infix-ops': 'error',
    '@typescript-eslint/type-annotation-spacing': ['error', {
      'before': false,
      'after': true,
      'overrides': { 'arrow': { 'before': true, 'after': true } },
    }],
    'arrow-spacing': ['error', { 'before': true, 'after': true }],
    'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }],

    'no-var': 'error',
    'no-unused-vars': 'off',
    'no-empty-function': 'warn',
    '@typescript-eslint/no-unused-expressions': 'warn',

    'indent': 'off',
    '@typescript-eslint/indent': ['error', 2, {
      'SwitchCase': 1,
      'ignoredNodes': [
        'PropertyDefinition[decorators]',
        'TSUnionType',
        'TSTypeParameterInstantiation',
        'TSIntersectionType',
      ],
    }],
    '@typescript-eslint/ban-ts-comment': 0,

    // semi
    // 'semi': ['error', 'always'],
    'semi': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/semi': ['error'],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',
    // '@typescript-eslint/comma-dangle': ['error', {
    //   'arrays': 'always-multiline',
    //   'objects': 'always-multiline',
    //   'imports': 'always-multiline',
    //   'exports': 'always-multiline',
    //   'functions': 'always-multiline',
    //   'enums': 'always-multiline',
    //   'generics': 'always-multiline',
    //   'tuples': 'always-multiline',
    // }],

    'semi-spacing': ['error', { 'before': false, 'after': true }],
    'semi-style': ['error', 'last'],
    'no-extra-semi': 'error',
    'no-unexpected-multiline': 'error',
    'no-unreachable': 'error',
    'max-len': ['warn', { 'code': 100, ignoreComments: true, ignoreStrings: true, ignoreTemplateLiterals: true }],

    'linebreak-style': ['error', 'unix'],
    'eol-last': 'error',
    'no-trailing-spaces': 'error',
    'space-in-parens': ['error', 'never'],
    'no-console': 'off',
    // 'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': 'error',
    'computed-property-spacing': 'error',
    'keyword-spacing': 'error',
    'eqeqeq': ['error', 'always'],

    // 'sort-imports': [
    //   'error',
    //   {
    //     'ignoreDeclarationSort': true,
    //   },
    // ],
    // 'import/order': ['error', {
    //   'newlines-between': 'always',
    // }],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        'vars': 'all',
        'varsIgnorePattern': '^_',
        'args': 'after-used',
        'argsIgnorePattern': '^_',
      },
    ],
  },
};
