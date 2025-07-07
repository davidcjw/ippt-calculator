import { Button, HStack, Text } from "@chakra-ui/react";
import React from "react";

type Gender = "male" | "female";

interface GenderSelectorProps {
    gender: Gender;
    setGender: (gender: Gender) => void;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({ gender, setGender }) => (
    <div>
        <Text fontWeight="bold" mb={2} fontSize="lg">
            Gender
        </Text>
        <HStack spacing={4}>
            <Button
                colorScheme={gender === "male" ? "blue" : "gray"}
                variant={gender === "male" ? "solid" : "outline"}
                onClick={() => setGender("male")}
                size="sm"
                leftIcon={<span role="img" aria-label="male">👨‍🦱</span>}
                _focus={{ boxShadow: "outline" }}
            >
                Male
            </Button>
            <Button
                colorScheme={gender === "female" ? "pink" : "gray"}
                variant={gender === "female" ? "solid" : "outline"}
                onClick={() => setGender("female")}
                size="sm"
                leftIcon={<span role="img" aria-label="female">👩‍🦰</span>}
                _focus={{ boxShadow: "outline" }}
            >
                Female
            </Button>
        </HStack>
    </div>
);

export default GenderSelector; 