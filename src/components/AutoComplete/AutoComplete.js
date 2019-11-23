import React from 'react';
import './AutoComplete.css';

export default class AutoComplete extends React.Component{
    constructor (props) {
        super(props);
        this.people = []; // Will fetch from API
        this.state = {
            suggestions: [],
            maxSuggestions: [],
            selectedSuggestions: [],
            renderResults: false,
            activeSuggestion: -1, // Not selecting the first suggestion by default
            userInput: '',
        };
    }

    componentDidMount() {
        // Fetch the user before the component is mounted
        fetch('https://jsonplaceholder.typicode.com/users').then(response => response.json()).then(people => {
            this.people = people;
        })
    }

    /**
     * Resets the suggestions and maxSuggestions array
     */
    clearSuggestions = () => {
        this.setState({
            suggestions: [],
            maxSuggestions: [],
        });
    };

    /**
     * Updates the suggestion array when user types
     * States that the maxSuggestion array will be just 5
     * @param e
     */
    onTextChanged = (e) => {
        const userInput = e.target.value;

        const nameSuggestions = this.people.filter(person => {
           if (userInput.length > 1) {
               return person.name.toLowerCase().includes(userInput.toLowerCase());
           }
        });

        const usernameSuggestions = this.people.filter(person => {
            if (userInput.length > 1) {
               return person.username.toLowerCase().includes(userInput.toLowerCase());
            }
        });

        const suggestions = [...new Set([...nameSuggestions, ...usernameSuggestions])];

        const maxSuggestions = suggestions.slice(0, 5);

        this.setState({
            suggestions,
            maxSuggestions,
            userInput,
        });
    };

    /**
     * Matches the person name with the input and highlights the match
     * @param person
     * @returns component
     */
    searchHighlighted = (person) => {
        const { userInput } = this.state;
        const inputMatchesNamePos = person.toLowerCase().indexOf(userInput.toLowerCase());
        if (inputMatchesNamePos === -1) {
            return (
                <span>
                    {person}
                </span>
            );
        }
        const nameArr = person.split('');
        const beforeBold = nameArr.slice(0, inputMatchesNamePos);
        const afterBold = nameArr.slice(inputMatchesNamePos + userInput.length, nameArr.length);

        // Name highlighted from the beginning
        if (inputMatchesNamePos === 0) {
            const bold = nameArr.slice(0,userInput.length);
            return (
                <span>
                    <span className="highlight">{bold}</span>
                    {afterBold}
                </span>
            )
        }
        // Name highlighted in the middle
        else if (afterBold.length > 0) {
            const bold = nameArr.splice(inputMatchesNamePos, userInput.length );
            return (
                <span>
                    {beforeBold}
                    <span className="highlight">{bold}</span>
                    {afterBold}
                </span>
            )
        }
        // Name highlighted at the end
        else {
            const bold = nameArr.splice(inputMatchesNamePos, userInput.length);
            return (
                <span>
                    {beforeBold}
                    <span className="highlight">{bold}</span>
                </span>
            )
        }
    };

    /**
     * esc key clears the input
     * enter key runs the search
     * up and down keys to select through the maxSuggestions
     * @param e
     */
    onKeyPressed = (e) => {
        const { activeSuggestion, suggestions, maxSuggestions, userInput } = this.state;
        if (userInput === '') return;
        // User pressed esc key
        if (e.keyCode === 27) {
            this.clearSuggestions();
            this.setState({
                userInput: '',
                activeSuggestion: -1,
            });
        }
        // User pressed enter key
        if (e.keyCode === 13) {
            if (activeSuggestion === -1) {
                this.clearSuggestions();
                this.setState({
                    selectedSuggestions: suggestions,
                    userInput,
                    renderResults: true,
                });
            } else {
                for (const person of maxSuggestions) {
                    if (maxSuggestions[activeSuggestion].id === person.id) {
                        this.clearSuggestions();
                        this.setState({
                            selectedSuggestions: [person],
                            userInput: maxSuggestions[activeSuggestion].name,
                            activeSuggestion: -1,
                            renderResults: true,
                        });
                    }
                }
            }
        }
        // User pressed up arrow key
        else if (e.keyCode === 38) {
            if (activeSuggestion === -1) {
                this.setState({
                    activeSuggestion: maxSuggestions.length - 1
                });
            } else {
                this.setState({
                    activeSuggestion: activeSuggestion - 1
                });
            }
        }
        // User pressed down arrow key
        else if (e.keyCode === 40) {
            if (activeSuggestion === maxSuggestions.length -1) {
                this.setState({
                    activeSuggestion: - 1
                });
            } else {
                this.setState({
                    activeSuggestion: activeSuggestion + 1
                });
            }
        }

    };

    /**
     * Runs the search for the selected li element
     * @param name
     * @param id
     */
    onSuggestionSelected = (name, id) => {
        const { maxSuggestions } = this.state;
        for (const person of maxSuggestions) {
            if (person.id === id) {
                this.clearSuggestions();
                this.setState({
                    selectedSuggestions: [person],
                    userInput: name,
                    activeSuggestion: -1,
                    renderResults: true,
                });
            }
        }
    };

    /**
     * Runs the search
     */
    onSearchClicked = () => {
        const { suggestions, userInput } = this.state;
        const selectedSuggestions = suggestions;
        if (userInput.length > 1) {
            this.clearSuggestions();
            this.setState({
                selectedSuggestions,
                renderResults: true,
            });
        }
    };

    /**
     * Close the suggestions when input losses focus
     */
    onBlur = () => {
        const root = document.querySelector('#root');
        const holder = document.querySelector('#holder');
        root.addEventListener('click', e => {
            if (!holder.contains(e.target)) {
                console.log(e.target);
                this.setState({
                    maxSuggestions: [],
                });
            }
        });
    };

    /**
     * Change the background of the li element when hover event
     * @param index
     * @returns {{backgroundColor: (string)}}
     */
    getOnHover = (index) => {
        const { activeSuggestion } = this.state;
        if (activeSuggestion !== -1 && activeSuggestion === index) {
            this.people[activeSuggestion].suggested = true;
            return {
                backgroundColor: this.people[activeSuggestion].suggested ? 'rgb(232, 231, 231)' : 'none'
            }
        }
    };

    /**
     * Renders the ul for the maxSuggestions array
     * @returns component
     */
    renderSuggestions = () => {
        const { maxSuggestions } = this.state;
        if (maxSuggestions.length > 0) {
            return (
                <ul>
                    {maxSuggestions.map((person, index) =>
                        <li id={person.id} onClick={() => this.onSuggestionSelected(person.name, person.id)} key={person.id} style={this.getOnHover(index)}>
                            <div>{this.searchHighlighted(person.name)}</div>
                            <div>{this.searchHighlighted(person.username)}</div>
                        </li>
                    )}
                </ul>
            );
        }
    };

    /**
     * Renders all the suggestions if there are
     * @returns component
     */
    renderResults = () => {
        const { selectedSuggestions, renderResults, userInput } = this.state;
        if (renderResults) {
            if (selectedSuggestions.length > 0) {
                return (
                    <section className="results">
                        {selectedSuggestions.map(person =>
                            <div key={person.id} className="card">
                                <div><span>{person.name}</span></div>
                                <div><span>Email: </span><a href={"mailto:"+person.email} target="_top">{person.email}</a></div>
                                <div><span>Phone Number: </span>{person.phone}</div>
                            </div>
                        )}
                  </section>
                )
            } else {
                return (
                    <div className="no-results">No results found for "{userInput}"</div>
                )
            }
        }
    };

    /**
     * Renders all the app!
     * @returns component
     */
    render() {
        const { userInput, renderResults, maxSuggestions } = this.state;

        return (
            <main>
                <section className="container">
                    <header>
                        <h1>{!renderResults ? 'LOOKING FOR AN EMPLOYEE?' : 'SEARCH RESULTS'}</h1>
                        <p>{!renderResults ? 'Click on the search bar to learn our suggestions' : ''}</p>
                    </header>
                    <div className="search" >
                        <div id="holder" className={(maxSuggestions.length > 0) ? 'holder holder-active' : 'holder'}>
                            <div className="AutoCompleteText" onKeyDown={this.onKeyPressed}>
                                <input placeholder="Search..." type="text" value={userInput} onBlur={this.onBlur} onFocus={this.onTextChanged} onChange={this.onTextChanged}/>
                                {this.renderSuggestions()}
                            </div>
                        </div>
                        <button onClick={this.onSearchClicked} className="search-btn"><i className="fa fa-search" aria-hidden="true"></i></button>
                    </div>

                </section>
                {this.renderResults()}
            </main>
        );
    }
}
