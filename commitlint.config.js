module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            ['feat', 'fix', 'docs', 'refactor', 'test', 'build', 'chore'],
        ],
        'subject-case': [
            0,
            'never'
        ]
    },
};
