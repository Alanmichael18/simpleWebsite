import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, ListGroup, Form, Container } from 'react-bootstrap';
import { HOST } from './Consts';

interface HourColors {
    [date: string]: { [hour: number]: string };  // Store changed hours only
}

const defaultColors = ['#FFDDC1', '#FFABAB', '#FFC3A0', '#D5AAFF', '#FF61A6'];

export default function Calendar() {
    const [dailyColors, setDailyColors] = useState<HourColors>({});
    const [editedColors, setEditedColors] = useState<HourColors>({});
    const [expandedCards, setExpandedCards] = useState<string[]>([]);
    const [selectedColor, setSelectedColor] = useState<string>(defaultColors[0]);
    const [colorButtons, setColorButtons] = useState<string[]>(defaultColors);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const hours = Array.from({ length: 24 }, (_, index) => `${index}:00`);
    const numDays = 28;
    const daysPerRow = 7;

    // Fetch the daily colors (changed hours only) from the Flask backend
    useEffect(() => {
        const fetchDailyColors = async () => {
            try {
                const response = await fetch(`${HOST}/daily_colors`);
                const data = await response.json();
                setDailyColors(data);
            } catch (error) {
                console.error('Error fetching daily colors:', error);
            }
        };

        fetchDailyColors();
    }, []);

    const handleMouseDown = (date: string, hour: number) => {
        setIsDragging(true);
        handleCellClick(date, hour);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseOver = (date: string, hour: number) => {
        if (isDragging) {
            handleCellClick(date, hour);
        }
    };

    const handleCellClick = (date: string, hour: number) => {
        setEditedColors(prev => ({
            ...prev,
            [date]: {
                ...prev[date],
                [hour]: selectedColor
            }
        }));
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
                setDailyColors(prev => ({
                    ...prev,
                    ...editedColors  // Merge edited colors into dailyColors
                }));
                setEditedColors({});  // Clear edited colors after submitting
            } else {
                alert('Failed to update colors.');
            }
        } catch (error) {
            console.error('Error updating colors:', error);
        }
    };

    const handleColorButtonClick = (color: string) => {
        setSelectedColor(color);
    };

    const handleColorChange = (index: number, color: string) => {
        const newColors = [...colorButtons];
        newColors[index] = color;
        setColorButtons(newColors);
        if (selectedColor === defaultColors[index]) {
            setSelectedColor(color);
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
        height: '50px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8em',
    };

    const handleCardClick = (date: string) => {
        setExpandedCards(prev => prev.includes(date)
            ? prev.filter(d => d !== date)
            : [...prev, date]
        );
    };

    const getColor = (date: string, hour: number) => {
        return editedColors[date]?.[hour] || dailyColors[date]?.[hour] || '#FFFFFF';
    };

    const getDateStr = (dayIndex: number) => {
        const date = new Date();
        date.setDate(date.getDate() + dayIndex);
        return date.toISOString().slice(0, 10);  // Format as YYYY-MM-DD
    };

    return (
        <Container style={{ display: 'flex', height: '100vh' }}>
            {/* Color Picker Sidebar */}
            <div style={{ width: '200px', padding: '10px', borderRight: '1px solid #ddd' }}>
                <Form.Group>
                    <Form.Label>Select Color:</Form.Label>
                    {colorButtons.map((color, index) => (
                        <div key={index} style={{ marginBottom: '10px' }}>
                            <Button
                                style={{ backgroundColor: color, border: 'none', width: '100%', height: '50px' }}
                                onClick={() => handleColorButtonClick(color)}
                            />
                            <Form.Control
                                type="color"
                                value={color}
                                onChange={(e) => handleColorChange(index, e.target.value)}
                                style={{ marginTop: '5px' }}
                            />
                        </div>
                    ))}
                </Form.Group>
                <Button onClick={handleSubmit} variant="primary">Submit Changes</Button>
            </div>

            {/* Calendar Layout */}
            <div style={{ flex: '1' }}>
                {Array.from({ length: Math.ceil(numDays / daysPerRow) }).map((_, rowIndex) => (
                    <Row key={rowIndex} style={containerStyle}>
                        {Array.from({ length: daysPerRow }).map((_, dayIndex) => {
                            const actualDayIndex = rowIndex * daysPerRow + dayIndex;
                            if (actualDayIndex >= numDays) return null;
                            const dateStr = getDateStr(actualDayIndex);

                            return (
                                <Col key={dateStr} style={cardStyle}>
                                    <Card style={{ height: '100%' }}>
                                        <Card.Header
                                            onClick={() => handleCardClick(dateStr)}
                                            style={cardHeaderStyle}
                                        >
                                            {dateStr}
                                        </Card.Header>
                                        {expandedCards.includes(dateStr) && (
                                            <ListGroup variant="flush" style={listGroupStyle}>
                                                {hours.map((_, hourIndex) => (
                                                    <ListGroup.Item
                                                        key={hourIndex}
                                                        style={{
                                                            backgroundColor: getColor(dateStr, hourIndex),
                                                            height: '1.2em',
                                                            padding: '2px',
                                                            position: 'relative',
                                                            cursor: 'pointer',
                                                        }}
                                                        onMouseDown={() => handleMouseDown(dateStr, hourIndex)}
                                                        onMouseUp={handleMouseUp}
                                                        onMouseOver={() => handleMouseOver(dateStr, hourIndex)}
                                                    >
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '0',
                                                            left: '0',
                                                            padding: '2px',
                                                            fontSize: '0.7em',
                                                            color: '#000',
                                                        }}>
                                                            {hours[hourIndex]}
                                                        </div>
                                                        <br />
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        )}
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                ))}
            </div>
        </Container>
    );
}
