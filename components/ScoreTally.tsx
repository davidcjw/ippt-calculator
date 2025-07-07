import { Center, VStack, Text, Badge, HStack } from "@chakra-ui/react";
import React from "react";

interface ScoreTallyProps {
    total: number;
    runScore: number;
    pushUpScore: number;
    sitUpScore: number;
    reward: string;
}

const ScoreTally: React.FC<ScoreTallyProps> = ({ total, runScore, pushUpScore, sitUpScore, reward }) => (
    <Center>
        <VStack spacing={2}>
            <Text fontSize="2xl" fontWeight="bold">
                Total Score: <Badge colorScheme="blue" fontSize="xl">{total}</Badge>
            </Text>
            <Text fontSize="xl" fontWeight="semibold">
                Reward: <Badge colorScheme="yellow" fontSize="lg">{reward}</Badge>
            </Text>
            <HStack>
                <Badge colorScheme="teal">Run: {runScore}</Badge>
                <Badge colorScheme="orange">Push Ups: {pushUpScore}</Badge>
                <Badge colorScheme="green">Sit Ups: {sitUpScore}</Badge>
            </HStack>
        </VStack>
    </Center>
);

export default ScoreTally; 