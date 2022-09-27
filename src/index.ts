import Runner from "./runner/index.js";

// const pattern = '../dt-works/dt-batch-works/src/**/*.(tsx|js)'
// const pattern = './mock/**/*.(tsx|js)'
// const pattern = './mock/mock-danger-and-operator.tsx'
const pattern = './mock/mock-handler-in-catch-block.tsx'

const runner = new Runner({
    includes: pattern,
    plugins: [
        {
            plugin: 'needHandlerInCatch',
            options: {
                reactImportPath: 'react'
            }
        }
    ]
})

runner.run()