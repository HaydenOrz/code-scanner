// @ts-nocheck 
import React from 'react'
import { Component, PureComponent } from 'react'

Promise.resolve().catch(() => { console.log()})
Promise.resolve().catch(function() { console.log() })

Promise.resolve().catch()

try {} catch (e) {

}

try {} catch (e) {
  console.log()
}


try {
    JSON.parse('')
} catch {

}



Promise.resolve().catch(function() {
    
})

Promise.resolve().catch()


  class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
    state: any
  
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
    }
  
    componentDidCatch(error, errorInfo) {
    }
  
    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return <h1>Something went wrong.</h1>;
      }
  
      return this.props.children; 
    }
  }


// class App{
//     componentDidCatch () {
//     }
// }