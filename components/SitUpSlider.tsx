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

interface SitUpSliderProps {
    sitUps: number;
    setSitUps: (val: number) => void;
    sitMin: number;
    sitMax: number;
    sitUpScore: number;
    getNextPointReps?: number | null;
}

const SitUpSlider: React.FC<SitUpSliderProps> = ({ sitUps, setSitUps, sitMin, sitMax, sitUpScore, getNextPointReps }) => (
    <Box>
        <Flex align="center" mb={2}>
            <Text fontWeight="bold" fontSize="lg">
                Sit-Ups
                {getNextPointReps !== undefined && getNextPointReps !== null && getNextPointReps > 0 && (
                    <Text as="span" fontSize="2xs" color="gray.500" ml={2}>
                        +{getNextPointReps} reps to next point
                    </Text>
                )}
            </Text>
            <Spacer />
            <Tag colorScheme="green" fontSize="xs">
                {sitUps} reps
            </Tag>
            <Tag colorScheme="blue" fontSize="xs" ml={2}>
                {sitUpScore} pts
            </Tag>
        </Flex>
        <Slider
            aria-label="situp-slider"
            min={sitMin}
            max={sitMax}
            step={1}
            value={sitUps}
            onChange={setSitUps}
            colorScheme="green"
        >
            <SliderTrack>
                <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
            <SliderMark value={sitMin} mt={2} ml={-2} fontSize="xs">
                {sitMin}
            </SliderMark>
            <SliderMark value={sitMax} mt={2} ml={-2} fontSize="xs">
                {sitMax}
            </SliderMark>
        </Slider>
    </Box>
);

export default SitUpSlider; 