import React from 'react';
import { useState, useEffect } from 'react';

import { CircularProgress, Grid, Box, Stack, Button } from '@mui/material';
import { BarChart, axisClasses } from '@mui/x-charts';

import { fetchGameSessionStatistics } from './api.js';

function formatPercent(n) {
    return Number.parseFloat(n * 100).toFixed(0) + "%";
}

function peopleRangeFormatter(range) {
    return `${range}`;
}

function playerFormatter(players) {
    return `${players} players`;
}

export
function QuizResultPage({gameSessionId, onComplete}) {
    const [statistics, setStatistics] = useState();

    useEffect(() => {
        const get = async () => {
            const stats = await fetchGameSessionStatistics(gameSessionId);
            setStatistics(stats);
        }

        get();
    }, []);


    if (statistics) {
        // Write histogram data into two separate series to be able to
        // render them differently. The 'other' series represents the
        // bins that my score is not part of.
        const histDataOther = [], histDataOur = [], labels = [];
        const len = statistics.histogram.length;
        let i;
        for (var h of statistics.histogram) {
            // we're in this bin
            if (h.from <= statistics.score && h.to >= statistics.score) {
                histDataOur.push(h.count)
                histDataOther.push(null);
            } else {
                histDataOur.push(null)
                histDataOther.push(h.count);
            }
            labels.push(`${formatPercent(h.from)}-${formatPercent(h.to)}`);
            ++i;
        }

        const scoreColorMap = [
            '#ff4b05',
            '#ffc105',
            '#fffb05',
            '#c8ff05',
            '#05ff05',
        ];
        const scoreColor = scoreColorMap[Math.round(statistics.score * (scoreColorMap.length-1))];

        return (
            <Stack>
                <Grid container spacing={10}>
                    <Grid item>
                        <Box>
                            <h1>Thank you for playing!</h1>
                            <p style={{textAlign: 'center'}}>You finished the game with a score of</p>
                            <p style={{textAlign: 'center', fontSize: '3em', color: scoreColor, margin: 10}}>{formatPercent(statistics.score)}</p>
                        </Box>
                    </Grid>

                    <Grid item>
                        <Box>
                            <h1>Compare yourself to others!</h1>
                            <BarChart
                                xAxis={[
                                    { scaleType: 'band',
                                      data: labels,
                                      valueFormatter: peopleRangeFormatter,
                                    }
                                ]}
                                series={[
                                    { id: 'other',
                                      data: histDataOther,
                                      stack: 'a',
                                      valueFormatter: playerFormatter,
                                    },
                                    { id: 'my',
                                      data: histDataOur,
                                      stack:'a',
                                      valueFormatter: playerFormatter,
                                    },
                                ]}
                                height={350}
                                width={550}
                                sx={{
                                    [`& .${axisClasses.root}`]: {
                                        stroke: 'white', // Axis lines
                                    },
                                    [`& .${axisClasses.tickLabel}`]: {
                                        fill: '!white',   // Tick label text color
                                        fontSize: 14,
                                    },
                                    [`& .${axisClasses.line}`]: {
                                        stroke: 'white', // Axis line color
                                    },
                                    [`& .${axisClasses.tick}`]: {
                                        stroke: 'white', // Tick mark color
                                    },
                                }}
                                slots={{
                                    tooltip: null,
                                }}
                            />
                        </Box>
                    </Grid>
                </Grid>
                <Button variant="contained"
                        color="secondary"
                        size="large"
                        onClick={onComplete}>
                    Play again!
                </Button>
            </Stack>
        );
    } else {
        return <CircularProgress/>;
    }
}
