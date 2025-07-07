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

interface PushUpSliderProps {
    pushUps: number;
    setPushUps: (val: number) => void;
    pushMin: number;
    pushMax: number;
    pushUpScore: number;
    getNextPointReps?: number | null;
}

const PushUpSlider: React.FC<PushUpSliderProps> = ({ pushUps, setPushUps, pushMin, pushMax, pushUpScore, getNextPointReps }) => (
    <Box>
        <Flex align="center" mb={2}>
            <Text fontWeight="bold" fontSize="lg">
                Push-Ups
                {getNextPointReps !== undefined && getNextPointReps !== null && getNextPointReps > 0 && (
                    <Text as="span" fontSize="sm" color="gray.500" ml={2}>
                        +{getNextPointReps} reps to next point
                    </Text>
                )}
            </Text>
            <Spacer />
            <Tag colorScheme="orange" fontSize="md">
                {pushUps} reps
            </Tag>
            <Tag colorScheme="blue" fontSize="md" ml={2}>
                {pushUpScore} pts
            </Tag>
        </Flex>
        <Slider
            aria-label="pushup-slider"
            min={pushMin}
            max={pushMax}
            step={1}
            value={pushUps}
            onChange={setPushUps}
            colorScheme="orange"
        >
            <SliderTrack>
                <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
            <SliderMark value={pushMin} mt={2} ml={-2} fontSize="sm">
                {pushMin}
            </SliderMark>
            <SliderMark value={pushMax} mt={2} ml={-2} fontSize="sm">
                {pushMax}
            </SliderMark>
        </Slider>
    </Box>
);

export default PushUpSlider; 