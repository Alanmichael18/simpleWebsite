import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import { HOST } from './Consts';

interface HourColors {
    [date: string]: string[];
}

export default function Calendar() {
    const [dailyColors, setDailyColors] = useState<HourColors>({});
    const [editedColors, setEditedColors] = useState<HourColors>({});
    const [expandedCards, setExpandedCards] = useState<string[]>([]);
    const hours = Array.from({ length: 24 }, (_, index) => `${index}:00`);

    // Fetch the daily colors from the Flask backend
    useEffect(() => {
        const fetchDailyColors = async () => {
            try {
                const response = await fetch(`${HOST}/daily_colors`);
                const data = await response.json();
                setDailyColors(data);
                setEditedColors(data); // Initialize editedColors with fetched data
            } catch (error) {
                console.error('Error fetching daily colors:', error);
            }
        };

        fetchDailyColors();
    }, []);

    const handleCellClick = (date: string, index: number) => {
        const newColor = prompt('Enter a color code (e.g., #FFDDC1):', '#FFDDC1');
        if (newColor) {
            setEditedColors(prev => ({
                ...prev,
                [date]: prev[date].map((color, i) => (i === index ? newColor : color))
            }));
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${HOST}/update_colors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedColors),
            });

            if (response.ok) {
                alert('Colors updated successfully!');
                setDailyColors(editedColors); // Update the dailyColors state with new colors
            } else {
                alert('Failed to update colors.');
            }
        } catch (error) {
            console.error('Error updating colors:', error);
        }
    };

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        maxHeight: '80vh',
        overflowY: 'auto',
    };

    const cardStyle: React.CSSProperties = {
        flex: '1',
        margin: '2px',
        padding: '0',
        overflow: 'hidden',
    };

    const listGroupStyle: React.CSSProperties = {
        maxHeight: 'calc(80vh - 2px)', // Adjust to fit in view height
        overflowY: 'auto',
    };

    const cardHeaderStyle: React.CSSProperties = {
        cursor: 'pointer',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        textAlign: 'center',
        height: '50px', // Set a fixed height for the square look
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8em',
    };

    const handleCardClick = (date: string) => {
        setExpandedCards(prev => {
            if (prev.includes(date)) {
                // Remove date from expandedCards if already expanded
                return prev.filter(d => d !== date);
            } else {
                // Add date to expandedCards
                return [...prev, date];
            }
        });
    };

    return (
        <div>
            <Row style={containerStyle}>
                {/* Date Columns */}
                {Object.keys(dailyColors).map(date => (
                    <Col key={date} style={cardStyle}>
                        <Card style={{ height: '100%' }}>
                            <Card.Header
                                onClick={() => handleCardClick(date)}
                                style={cardHeaderStyle}
                            >
                                {date}
                            </Card.Header>
                            {expandedCards.includes(date) && (
                                <ListGroup variant="flush" style={listGroupStyle}>
                                    {hours.map((_, index) => (
                                        <ListGroup.Item
                                            key={index}
                                            style={{
                                                backgroundColor: editedColors[date]?.[index] || '#ffffff',
                                                height: '1.2em',
                                                padding: '2px',
                                                position: 'relative',
                                            }}
                                            onClick={() => handleCellClick(date, index)}
                                        >
                                            <div style={{
                                                position: 'absolute',
                                                top: '0',
                                                left: '0',
                                                padding: '2px',
                                                fontSize: '0.7em',
                                                color: '#000',
                                            }}>
                                                {hours[index]}
                                            </div>
                                            <br />
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card>
                    </Col>
                ))}
            </Row>
            <Button onClick={handleSubmit} variant="primary">Submit Changes</Button>
        </div>
    );
}
