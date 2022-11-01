import Runner from "./runner";

const pattern = '../dt-works/dt-insight-studio/apps/dataAssets/src/**/*.tsx'
// const pattern = './mock/**/*.(tsx|js)'
// const pattern = './mock/mock-danger-and-operator.tsx'
// const pattern = './mock/mock-handler-in-catch-block.tsx'
// const pattern = './mock/mock-danger-and-operator.tsx'
// const pattern = './mock/mock-danger-initial-state.tsx'
// const pattern = './mock/mock-danger-default-value.ts'

const runner = new Runner({
    includes: pattern,
    scanPlugins: [
        // {
        //     plugin: 'needTryCatch'
        // },
        // {
        //     plugin: 'needHandlerInCatch'
        // },
        // {
        //     plugin: 'dangerousAndOperator'
        // },
        // {
        //     plugin: 'dangerousInitState'
        // },
        {
            plugin: 'dangerousDefaultValue'
        }
    ]
})

runner.run()