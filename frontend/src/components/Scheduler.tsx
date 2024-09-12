import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, ListGroup, Form, Container, Toast, ToastContainer } from 'react-bootstrap';
import { HOST } from './Consts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
// import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported

// Define interface for hour colors
interface HourColors {
    [date: string]: { [hour: number]: string };  // Store only changed hours
}

// Default color palette
const DEFAULT_COLOR = '#E1EBF3'
const defaultColors = ['#FFDDC1', '#FFABAB', '#FFC3A0', '#D5AAFF', DEFAULT_COLOR];

export default function Scheduler() {
    const [dailyColors, setDailyColors] = useState<HourColors>({});
    const [editedColors, setEditedColors] = useState<HourColors>({});
    const [selectedColor, setSelectedColor] = useState<string>(defaultColors[0]);
    const [colorButtons, setColorButtons] = useState<string[]>(defaultColors);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [expandedDates, setExpandedDates] = useState<string[]>([]);  // Dates currently expanded
    const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Calendar selected date

    const hours = Array.from({ length: 24 }, (_, index) => `${index}:00`);

    // Fetch daily colors from backend
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

    // Handle cell interaction for painting (drag and click)
    const handleMouseDown = (date: string, hour: number) => {
        setIsDragging(true);
        handleCellClick(date, hour);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseOver = (date: string, hour: number) => {
        if (isDragging) handleCellClick(date, hour);
    };

    const handleCellClick = (date: string, hour: number) => {
        setEditedColors(prev => ({
            ...prev,
            [date]: { ...prev[date], [hour]: selectedColor }
        }));
    };

    // Submit updated colors to the backend
    const handleSubmit = async () => {
        try {
            const response = await fetch(`${HOST}/update_colors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedColors),
            });

            if (response.ok) {
                alert('Colors updated successfully!');
                setDailyColors(prev => ({
                    ...prev,
                    ...editedColors  // Merge edited colors with current colors
                }));
                setEditedColors({});  // Clear edited changes after submission
            } else {
                alert('Failed to update colors.');
            }
        } catch (error) {
            console.error('Error updating colors:', error);
        }
    };

    // Handle color selection from the palette
    const handleColorButtonClick = (color: string) => {
        setSelectedColor(color);
    };

    // Handle date expansion toggle
    const handleDateClick = (date: string) => {
        setExpandedDates(prev => {
            if (prev.includes(date)) {
                return prev.filter(d => d !== date); // Remove if already expanded
            } else {
                return [...prev, date]; // Add date to expanded list
            }
        });
    };

    // Get color for a specific date and hour
    const getColor = (date: string, hour: number) => {
        return editedColors[date]?.[hour] || dailyColors[date]?.[hour] || DEFAULT_COLOR;
    };

    // Handle calendar date selection and expand the respective date
    const handleDateChange = (date: Date) => {
        const dateStr = date.toISOString().slice(0, 10); // Convert to 'YYYY-MM-DD'
        setSelectedDate(date);
        handleDateClick(dateStr);
    };

    // Ensure expanded dates are sorted in chronological order
    const sortedExpandedDates = [...expandedDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return (
        <Container>
            <Row style={{margin: '10px', padding: '10px', height: '5vh'}}>
                <h1 style={{color: 'white'}}>Dashboard</h1>
            </Row>
            <Row style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>
                {/* Expanded Dates Section */}
                <Col xs={8} style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'row', overflowX: 'auto', margin: '10px' }}>
                {expandedDates.length === 0 && (
                    <Col style={{ marginBottom: '10px' }}>
                        <ToastContainer
                            className="p-3"
                            position='middle-center'
                            style={{ zIndex: 1, position: 'relative', marginLeft: '10vw' }}
                        >
                            <Toast style={{borderRadius: '20px', padding: '10px', backgroundColor: 'darkgray', textAlign: 'center'}}>
                                <Toast.Body>Click on a Date to begin!</Toast.Body>
                            </Toast>
                        </ToastContainer>
                        
                    </Col>
                )}
                    <div style={{ flex: '1 1 auto', display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>
                        {sortedExpandedDates.map((dateStr) => (
                            <Col key={dateStr} style={{ flex: '1 1 auto', padding: '5px', maxWidth: '20vw'}}>
                                <Card style={{backgroundColor: '#E1EBF3', borderRadius: '20px', padding: '10px'}}>
                                    <h3>{dateStr}</h3>
                                    <ListGroup style={{maxHeight: '80vh', overflowY: 'auto', borderRadius: '20px', padding: '5px'}}>
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
                                </Card>
                            </Col>
                        ))}
                    </div>
                </Col>
                
                {/* Calendar and Color Controls */}
                <Col xs={4} style={{ margin: '10px' }}>
                    <Row style={{padding: '10px'}}>
                        <Card style={{ backgroundColor: 'white', borderRadius: '20px', padding: '10px' }}>
                            <Calendar
                                onChange={handleDateChange}
                                value={selectedDate}
                                tileClassName={({ date }) => {
                                    const dateStr = date.toISOString().slice(0, 10);
                                    return expandedDates.includes(dateStr) ? 'expanded-date' : '';
                                }}
                                
                                // Alternatively, use tileContent to apply custom styles
                                tileContent={({ date }) => {
                                    const dateStr = date.toISOString().slice(0, 10);
                                    if (expandedDates.includes(dateStr)) {
                                        return <div style={{backgroundColor: 'blue', border: '2px solid #888',}}></div>; // Apply blue background when expanded
                                    }
                                    return null;
                                }}
                            />
                        </Card>
                    </Row>

                    <Card style={{backgroundColor: 'white', borderRadius: '20px', padding: '10px', margin: '10px'}}>
                        <Row>
                            {colorButtons.map((color, index) => (
                                <Form.Control
                                    type="color"
                                    value={color}
                                    onChange={(e) => handleColorChange(index, e.target.value)}
                                    style={{ width: '20%' }}
                                />
                            ))}
                        </Row>
                        <Row>
                            {colorButtons.map((color, index) => (
                                <Button
                                    style={{ backgroundColor: color, border: 'none', height: '50px', width: '20%', borderRadius: '20px' }}
                                    onClick={() => handleColorButtonClick(color)}
                                />
                            ))}
                        </Row>
                        <Row>
                            <Col>
                                <Button onClick={handleSubmit} variant="primary">Submit Changes</Button>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
