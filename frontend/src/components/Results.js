import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

class Results extends Component {
    render() {
        return (
            this.props.names.map(row => 
                <div key={row.id}>
                    {row.name} <Button onClick={() => this.props.onDelete(row.name)}> Delete </Button>
                </div>
            )
        )
    }
}

export default Results;
