// components/AnimatedHeatmap.js
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const AnimatedHeatmap = ({ hourlyTimes, hourlyValues, valueLabel = 'Precipitation', title = 'Hourly Precipitation Heatmap' }) => {
    // Ref for the SVG element to draw on
    const svgRef = useRef();
    // State to control animation (playing/paused)
    const [isPlaying, setIsPlaying] = useState(false);
    // State to track the current animation index
    const [currentIndex, setCurrentIndex] = useState(0);
    // Ref for the animation interval
    const animationIntervalRef = useRef(null);

    // D3 drawing and animation logic
    useEffect(() => {
        // Clear any existing SVG content to prevent duplicates on re-renders
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current);
        const width = 800; // SVG width
        const height = 150; // SVG height
        const margin = { top: 30, right: 30, bottom: 50, left: 60 }; // Margins for chart elements

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Append a group element to apply margins
        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales for X-axis (time) and Y-axis (a single band for heatmap)
        const xScale = d3.scaleBand()
            .domain(hourlyTimes.map((_, i) => i)) // Domain based on indices
            .range([0, innerWidth])
            .padding(0.01); // Padding between bands

        const yScale = d3.scaleBand()
            .domain(['data']) // A single band for the Y-axis
            .range([innerHeight, 0])
            .padding(0.01);

        // Color scale for heatmap (e.g., from light blue to dark blue for precipitation)
        // Adjust domain based on min/max of your hourlyValues for better visualization
        const colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, d3.max(hourlyValues) || 1]); // Default to 1 if max is 0 to avoid errors

        // Create the cells (rectangles) for the heatmap
        const cells = g.selectAll(".cell")
            .data(hourlyValues)
            .enter().append("rect")
            .attr("class", "cell")
            .attr("x", (d, i) => xScale(i)) // Position based on index
            .attr("y", yScale('data')) // Position on the single Y-band
            .attr("width", xScale.bandwidth()) // Width of each cell
            .attr("height", yScale.bandwidth()) // Height of each cell
            .attr("fill", d => colorScale(d)); // Fill color based on value

        // Add X-axis (time labels)
        const xAxis = d3.axisBottom(xScale)
            .tickValues(xScale.domain().filter((d, i) => !(i % (Math.floor(hourlyTimes.length / 5) || 1)))) // Show fewer ticks if many hours
            .tickFormat(i => {
                const date = new Date(hourlyTimes[i]);
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            }); // Format time for readability

        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)"); // Rotate for better readability

        // Add X-axis label
        g.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + margin.bottom - 5)
            .text("Time (Hourly)");

        // Add Y-axis (no ticks, just a label indicating the data type)
        g.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", -margin.left + 20)
            .attr("x", -innerHeight / 2)
            .attr("transform", "rotate(-90)")
            .text(valueLabel);

        // Add chart title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", margin.top / 2 + 5)
            .attr("text-anchor", "middle")
            .style("font-size", "1.2em")
            .style("font-weight", "bold")
            .text(title);

        // Function to update highlight for current time
        const updateHighlight = (index) => {
            cells.classed("highlight", (d, i) => i === index);
        };

        // If animation is playing, set up the interval
        if (isPlaying) {
            animationIntervalRef.current = setInterval(() => {
                setCurrentIndex(prevIndex => {
                    const nextIndex = (prevIndex + 1) % hourlyValues.length;
                    // When animation loops, update the highlight for the new index
                    updateHighlight(nextIndex);
                    return nextIndex;
                });
            }, 500); // Animation speed: change every 500ms
        } else {
            // If paused, clear the interval
            clearInterval(animationIntervalRef.current);
            // Ensure the current cell is highlighted when paused
            updateHighlight(currentIndex);
        }

        // Cleanup function for when the component unmounts or dependencies change
        return () => {
            clearInterval(animationIntervalRef.current);
        };
    }, [hourlyTimes, hourlyValues, isPlaying, currentIndex, valueLabel, title]); // Dependencies for useEffect

    // Handler for play/pause button
    const togglePlay = () => {
        setIsPlaying(prev => !prev);
    };

    // Handler for slider change
    const handleSliderChange = (event) => {
        const newIndex = parseInt(event.target.value, 10);
        setCurrentIndex(newIndex);
        setIsPlaying(false); // Pause animation when slider is used
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-lg">
            {/* SVG container for the D3 chart */}
            <svg ref={svgRef} width="800" height="150" className="border rounded-md shadow-inner"></svg>
            {/* Controls for animation */}
            <div className="flex flex-col items-center mt-4 w-full max-w-lg">
                <div className="flex items-center space-x-4 mb-3 w-full">
                    <button
                        onClick={togglePlay}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150 shadow-md"
                    >
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    {/* Display current time being highlighted */}
                    {hourlyTimes.length > 0 && (
                        <span className="text-lg font-semibold text-gray-700">
                            Time: {new Date(hourlyTimes[currentIndex]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                    )}
                </div>
                {/* Slider for manual scrubbing */}
                {hourlyValues.length > 0 && (
                    <input
                        type="range"
                        min="0"
                        max={hourlyValues.length - 1}
                        value={currentIndex}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700"
                    />
                )}
            </div>

            <style jsx>{`
                /* Basic styling for the heatmap cells and highlight */
                .cell {
                    stroke: #ccc;
                    stroke-width: 0.5px;
                    transition: fill 0.3s ease-in-out; /* Smooth transition for color change */
                }
                .cell.highlight {
                    /* Add a border or different style for the highlighted cell */
                    stroke: black;
                    stroke-width: 2px;
                }
                /* General SVG text styling */
                text {
                    font-family: "Inter", sans-serif;
                    font-size: 0.85em;
                    fill: #333;
                }
                .x.label, .y.label {
                    font-size: 0.9em;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
};

export default AnimatedHeatmap;
