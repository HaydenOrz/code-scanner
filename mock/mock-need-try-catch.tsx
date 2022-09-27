import * as React from 'react'

const obj = {
    name: 'hayden',
    age: '10'
}

const jsonStr = '{"name":"hayden","age":"10"}'

// 普通函数中的json.parse
function parseFn () {
    try {
        const json = JSON.parse(jsonStr)
    } catch(e) {

    }
}

function _parseFn () {
    const json = JSON.parse(jsonStr)
}

// 箭头函数中的json.parse
const parseArrowFn = () => {
    try {
        const json = JSON.parse(jsonStr)
    } catch(e) {

    }
}

const _parseArrowFn = () => {
    const json = JSON.parse(jsonStr)
}

if (1) {
    try {
        const json = JSON.parse(jsonStr)
    } catch(e) {

    }
}

if (0) {
    const json = JSON.parse(jsonStr)
}

switch (1) {
    case 1:
        try {
            const json = JSON.parse(jsonStr)
        } catch(e) {
    
        }
        break;

    default:
        break;
}

switch (2) {
    case 1:
        const json = JSON.parse(jsonStr)
        break;

    default:
        break;
}

class App extends React.Component {
    state={
        json: ''
    }

    constructor (props) {
        super(props)
        try {
            const json = JSON.parse(jsonStr)
        } catch(e) {
    
        }
    }

    static {
        try {
            const json = JSON.parse(jsonStr)
        } catch(e) {
    
        }
    }

    static {
        const json = JSON.parse(jsonStr)
    }

    parseA = () => {
        try {
            const json = JSON.parse(jsonStr)
        } catch(e) {
    
        }
    }

    _parseA = () => {
        const json = JSON.parse(jsonStr)
    }

    parseB ()  {
        try {
            const json = JSON.parse(jsonStr)
        } catch(e) {
    
        }
    }
    _parseB ()  {
            const json = JSON.parse(jsonStr)
    }

    render () {
        try {
            const json = JSON.parse(jsonStr)
        } catch(e) {
    
        }
        return (
            <div>
            </div>
        )
    }
}

const ccc =  JSON.parse(jsonStr)
