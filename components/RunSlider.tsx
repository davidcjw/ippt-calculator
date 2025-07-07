import {
    Box,
    Flex,
    Text,
    Spacer,
    Tag,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark
} from "@chakra-ui/react";
import React from "react";

interface RunSliderProps {
    run: number;
    setRun: (val: number) => void;
    runMin: number;
    runMax: number;
    runScore: number;
    formatTime: (s: number) => string;
    getNextPointSecs?: number | null;
}

const RunSlider: React.FC<RunSliderProps> = ({ run, setRun, runMin, runMax, runScore, formatTime, getNextPointSecs }) => (
    <Box>
        <Flex align="center" mb={2}>
            <Text fontWeight="bold" fontSize="lg">
                2.4km Run
                {getNextPointSecs !== undefined && getNextPointSecs !== null && getNextPointSecs > 0 && (
                    <Text as="span" fontSize="2xs" color="gray.500" ml={2}>
                        -{getNextPointSecs}s to next point
                    </Text>
                )}
            </Text>
            <Spacer />
            <Tag colorScheme="teal" fontSize="xs">
                {formatTime(run)}
            </Tag>
            <Tag colorScheme="blue" fontSize="xs" ml={2}>
                {runScore} pts
            </Tag>
        </Flex>
        <Slider
            aria-label="run-slider"
            min={runMin}
            max={runMax}
            step={10}
            value={run}
            onChange={setRun}
            colorScheme="teal"
        >
            <SliderTrack>
                <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
            <SliderMark value={runMin} mt={2} ml={-2} fontSize="xs">
                {formatTime(runMin)}
            </SliderMark>
            <SliderMark value={runMax} mt={2} ml={-6} fontSize="xs">
                {formatTime(runMax)}
            </SliderMark>
        </Slider>
    </Box>
);

export default RunSlider; 