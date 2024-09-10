import React, { Component } from 'react';
import './App.css';
import Results from './components/Results';
import NewName from './components/NewName';
import SmallCalendar from './components/SmallCalendar.tsx';
import Calendar from './components/Calendar.tsx';

// import 'bootstrap/dist/css/bootstrap.css';
import { Card, Row, Col } from 'react-bootstrap';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      names: [],
      loading: true
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this); // Bind the delete method
  }

  handleChange(event) {
    this.setState({ name: event.target.value });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({
      loading: true,
    });
    await fetch('/addname/' + this.state.name, {
      method: 'GET'
    });
    this.getNames();
  }

  getNames() {
    fetch('/getnames/')
      .then(response => response.json())
      .then(json => {
        this.setState({
          name: '',
          names: json,
          loading: false
        });
      });
  }

  async handleDelete(name) {
    this.setState({
      loading: true,
    });
    await fetch(`/deletename/${name}`, {
      method: 'DELETE',
    });
    this.getNames();
  }

  componentDidMount() {
    this.getNames();
  }

  render() {
    return (
      <div>
        <Row>
          <Card>
            <Calendar />
          </Card>
        </Row>
        <Row>
          <NewName handleChange={this.handleChange} handleSubmit={this.handleSubmit} value={this.state.name} />
          {this.state.loading ? <h1>Loading</h1> : <Results names={this.state.names} onDelete={this.handleDelete} />}
        </Row>
        <Row>
          <SmallCalendar />
        </Row>
      </div>
    );
  }
}

export default App;
