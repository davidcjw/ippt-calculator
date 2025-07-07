import { HStack, Select, Badge, Text } from "@chakra-ui/react";
import React from "react";

interface AgeGroupSelectorProps {
    ageBuckets: number[];
    ageGroup: number;
    setAgeGroup: (age: number) => void;
    getAgeLabel: (bucket: number, idx: number, arr: number[]) => string;
}

const AgeGroupSelector: React.FC<AgeGroupSelectorProps> = ({ ageBuckets, ageGroup, setAgeGroup, getAgeLabel }) => (
    <div>
        <Text fontWeight="bold" mb={2} fontSize="lg">
            Age Group
        </Text>
        <HStack spacing={4}>
            <Select
                value={ageGroup}
                onChange={e => setAgeGroup(Number(e.target.value))}
                size="sm"
                maxW="200px"
            >
                {ageBuckets.map((bucket, idx, arr) => (
                    <option key={bucket} value={bucket}>
                        {getAgeLabel(bucket, idx, arr)}
                    </option>
                ))}
            </Select>
            <Badge colorScheme="purple" fontSize="md">
                {getAgeLabel(ageGroup, ageBuckets.indexOf(ageGroup), ageBuckets)} yrs
            </Badge>
        </HStack>
    </div>
);

export default AgeGroupSelector; 