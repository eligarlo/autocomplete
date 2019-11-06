import React from 'react';

import AutoComplete from "./components/AutoComplete/AutoComplete";

import './App.css';

export default class App extends React.Component{
    render() {
        return (
        <div className="App">
            <div className="logo-deloitte">
                <img src="https://www2.deloitte.com/content/dam/assets/logos/deloitte.svg" alt="logo"/>
            </div>
            <AutoComplete />
        </div>
      );
    }
}
