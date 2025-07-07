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
                    <Text as="span" fontSize="2xs" color="gray.500" ml={2}>
                        +{getNextPointReps} reps to next point
                    </Text>
                )}
            </Text>
            <Spacer />
            <Tag colorScheme="orange" fontSize="xs">
                {pushUps} reps
            </Tag>
            <Tag colorScheme="blue" fontSize="xs" ml={2}>
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
            <SliderMark value={pushMin} mt={2} ml={-2} fontSize="xs">
                {pushMin}
            </SliderMark>
            <SliderMark value={pushMax} mt={2} ml={-2} fontSize="xs">
                {pushMax}
            </SliderMark>
        </Slider>
    </Box>
);

export default PushUpSlider; 