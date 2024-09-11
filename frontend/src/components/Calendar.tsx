import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import { HOST } from './Consts';

interface HourColors {
    [date: string]: string[];
}

// Utility function to compare two HourColors objects
const getChangedColors = (original: HourColors, updated: HourColors) => {
    const changedColors: HourColors = {};

    Object.keys(updated).forEach(date => {
        updated[date].forEach((color, index) => {
            if (color !== original[date][index]) {
                if (!changedColors[date]) {
                    changedColors[date] = [...original[date]];
                }
                changedColors[date][index] = color;
            }
        });
    });

    return changedColors;
};

// Initialize default colors for one week
const initializeDefaultWeek = (): HourColors => {
    const defaultColors: HourColors = {};
    const today = new Date();
    
    // Create default colors for 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        defaultColors[dateString] = Array(24).fill('#FFFFFF'); // Default white for each hour
    }
    
    return defaultColors;
};

export default function Calendar() {
    const [dailyColors, setDailyColors] = useState<HourColors>({});
    const [editedColors, setEditedColors] = useState<HourColors>({});
    const [expandedCards, setExpandedCards] = useState<string[]>([]);
    const hours = Array.from({ length: 24 }, (_, index) => `${index}:00`);

    useEffect(() => {
        const fetchDailyColors = async () => {
            try {
                const response = await fetch(`${HOST}/daily_colors`);
                const data = await response.json();

                if (Object.keys(data).length === 0) {
                    // If no data is returned from the backend, initialize default colors
                    const defaultColors = initializeDefaultWeek();
                    setDailyColors(defaultColors);
                    setEditedColors(defaultColors);
                } else {
                    setDailyColors(data);
                    setEditedColors(data); // Initialize editedColors with fetched data
                }
            } catch (error) {
                console.error('Error fetching daily colors:', error);
                const defaultColors = initializeDefaultWeek();
                setDailyColors(defaultColors);
                setEditedColors(defaultColors);
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
        const changedColors = getChangedColors(dailyColors, editedColors);
        console.log('Submitting data:', editedColors); 
        
        if (Object.keys(changedColors).length === 0) {
            alert('No changes to submit!');
            return;
        }

        try {
            const response = await fetch(`${HOST}/update_colors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(changedColors),
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
                return prev.filter(d => d !== date);
            } else {
                return [...prev, date];
            }
        });
    };

    return (
        <div>
            <Row style={containerStyle}>
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
