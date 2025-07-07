import React, { useState } from "react";
import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Button,
    NumberInput,
    NumberInputField,
    VStack,
    HStack,
    Text,
    Box,
    useDisclosure,
    List,
    ListItem,
    IconButton,
    Select,
    useToast,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { femalePushUpScoreLookup, malePushUpScoreLookup } from "@/lib/pushUpScoreLookup";
import { femaleRun24ScoreLookup, maleRun24ScoreLookup } from "@/lib/run24ScoreLookup";
import { maleSitUpScoreLookup, femaleSitUpScoreLookup } from "@/lib/sitUpScoreLookup";
import { getReward } from "@/lib/utils";
import { MdDirectionsRun } from "react-icons/md";

interface WorkoutDrawerProps {
    gender: "male" | "female";
    ageGroup: number;
}

// Type for a saved workout
export type SavedWorkout = {
    date: string;
    runTime: string;
    pushUps: number;
    sitUps: number;
    total: number;
    reward: string;
    gender: "male" | "female";
    ageGroup: number;
};

const WorkoutDrawer: React.FC<WorkoutDrawerProps> = ({ gender, ageGroup }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    // State for showing/hiding the add form
    const [showForm, setShowForm] = useState(false);

    // State for form fields
    const [runMinutes, setRunMinutes] = useState(0);
    const [runSeconds, setRunSeconds] = useState(0);
    const [pushUps, setPushUps] = useState(0);
    const [sitUps, setSitUps] = useState(0);

    // State for saved workouts
    const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);

    // State for button hover
    const [isButtonHovered, setIsButtonHovered] = useState(false);

    // Load workouts from localStorage on mount
    React.useEffect(() => {
        const data = localStorage.getItem("ippt_workouts");
        if (data) setSavedWorkouts(JSON.parse(data) as SavedWorkout[]);
    }, []);

    // Save workouts to localStorage whenever they change
    React.useEffect(() => {
        localStorage.setItem("ippt_workouts", JSON.stringify(savedWorkouts));
    }, [savedWorkouts]);

    // Convert minutes and seconds to total seconds, rounded down to nearest 10s for scoring
    const runSecsRaw = runMinutes * 60 + runSeconds;
    const runSecs = runSecsRaw - (runSecsRaw % 10);

    // Lookup helpers
    const pushUpScore = (gender === "male"
        ? malePushUpScoreLookup
        : femalePushUpScoreLookup)[ageGroup]?.[pushUps] ?? 0;
    const sitUpScore = (gender === "male"
        ? maleSitUpScoreLookup
        : femaleSitUpScoreLookup)[ageGroup]?.[sitUps] ?? 0;
    const runScore = (gender === "male"
        ? maleRun24ScoreLookup
        : femaleRun24ScoreLookup)[ageGroup]?.[runSecs] ?? 0;
    const total = pushUpScore + sitUpScore + runScore;
    const reward = getReward(total);

    // Save a new workout
    const handleSave = () => {
        if (
            runMinutes < 0 ||
            runSeconds < 0 ||
            runSeconds > 59 ||
            (runMinutes === 0 && runSeconds === 0) ||
            pushUps <= 0 ||
            sitUps <= 0
        ) {
            toast({
                title: "Invalid input",
                description: "Please enter a valid time (mm:ss), and push ups/sit ups > 0.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }
        const now = new Date();
        setSavedWorkouts([
            {
                date: now.toISOString(),
                runTime: `${runMinutes}:${runSeconds.toString().padStart(2, "0")}`,
                pushUps,
                sitUps,
                total,
                reward,
                gender,
                ageGroup,
            },
            ...savedWorkouts,
        ]);
        setShowForm(false);
        setRunMinutes(0);
        setRunSeconds(0);
        setPushUps(0);
        setSitUps(0);
    };

    // Delete a workout
    const handleDelete = (idx: number) => {
        setSavedWorkouts(savedWorkouts.filter((_, i) => i !== idx));
    };

    // Format date
    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString();
    };

    return (
        <>
            <Box
                position="fixed"
                right={4}
                bottom={4}
                zIndex={1000}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                display={isOpen ? "none" : "block"}
            >
                <Button
                    leftIcon={<MdDirectionsRun size={24} />}
                    colorScheme="teal"
                    borderRadius="full"
                    px={isButtonHovered ? 6 : 3}
                    width={isButtonHovered ? "auto" : 12}
                    height={12}
                    minW={12}
                    boxShadow="lg"
                    transition="all 0.2s cubic-bezier(.4,1,.4,1)"
                    overflow="hidden"
                    onClick={onOpen}
                >
                    {(isButtonHovered && !isOpen) && (
                        <Box
                            as="span"
                            ml={2}
                            opacity={1}
                            transition="opacity 0.2s"
                            whiteSpace="nowrap"
                            fontWeight="bold"
                        >
                            Track Progress
                        </Box>
                    )}
                </Button>
            </Box>
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Track Your IPPT Progress</DrawerHeader>

                    <DrawerBody>
                        <VStack spacing={4} align="stretch">
                            {!showForm ? (
                                <Button colorScheme="teal" w="full" onClick={() => setShowForm(true)}>
                                    Add Workout
                                </Button>
                            ) : (
                                <Box borderWidth={1} borderRadius="md" p={4} mb={2}>
                                    <VStack spacing={4} align="stretch">
                                        <Box>
                                            <Text fontWeight="bold">2.4KM Run Timing</Text>
                                            <HStack>
                                                <NumberInput min={0} max={21} value={runMinutes} onChange={(_, n) => setRunMinutes(Number.isNaN(n) ? 0 : Number(n))} w="80px">
                                                    <NumberInputField placeholder="mm" />
                                                </NumberInput>
                                                <Text>:</Text>
                                                <NumberInput min={0} max={59} value={runSeconds} onChange={(_, n) => setRunSeconds(Number.isNaN(n) ? 0 : Number(n))} w="80px">
                                                    <NumberInputField placeholder="ss" />
                                                </NumberInput>
                                            </HStack>
                                        </Box>
                                        <HStack spacing={4} align="stretch">
                                            <Box flex={1}>
                                                <Text fontWeight="bold">Push Ups</Text>
                                                <Select value={pushUps} onChange={e => setPushUps(Number(e.target.value))}>
                                                    {Array.from({ length: 61 }, (_, i) => (
                                                        <option key={i} value={i}>{i}</option>
                                                    ))}
                                                </Select>
                                            </Box>
                                            <Box flex={1}>
                                                <Text fontWeight="bold">Sit Ups</Text>
                                                <Select value={sitUps} onChange={e => setSitUps(Number(e.target.value))}>
                                                    {Array.from({ length: 61 }, (_, i) => (
                                                        <option key={i} value={i}>{i}</option>
                                                    ))}
                                                </Select>
                                            </Box>
                                        </HStack>
                                        {/* Live score/result */}
                                        <Box>
                                            <Text>Total Points: <b>{total}</b></Text>
                                            <Text>Result: <b>{reward}</b></Text>
                                        </Box>
                                        <HStack>
                                            <Button colorScheme="teal" w="full" onClick={handleSave}>
                                                Save Workout
                                            </Button>
                                            <Button w="full" onClick={() => setShowForm(false)}>
                                                Cancel
                                            </Button>
                                        </HStack>
                                    </VStack>
                                </Box>
                            )}
                        </VStack>
                        <Box mt={8}>
                            <Text fontWeight="bold" mb={2}>Saved Workouts</Text>
                            <List spacing={2}>
                                {savedWorkouts.length === 0 ? (
                                    <Text color="gray.500">No workouts saved yet.</Text>
                                ) : (
                                    savedWorkouts.map((workout, idx) => (
                                        <ListItem key={idx}>
                                            <Box borderWidth={1} borderRadius="md" p={3}>
                                                <HStack justify="space-between" align="flex-start">
                                                    <Box>
                                                        <Text fontSize="sm" color="gray.500">{workout.gender}, {workout.ageGroup}, {formatDate(workout.date)}</Text>
                                                        <Text>Run: <b>{workout.runTime}</b></Text>
                                                        <Text>Push Ups: <b>{workout.pushUps}</b></Text>
                                                        <Text>Sit Ups: <b>{workout.sitUps}</b></Text>
                                                        <Text>Total: <b>{workout.total}</b></Text>
                                                        <Text>Result: <b>{workout.reward}</b></Text>
                                                    </Box>
                                                    <IconButton
                                                        aria-label="Delete workout"
                                                        icon={<DeleteIcon />}
                                                        size="sm"
                                                        colorScheme="red"
                                                        onClick={() => handleDelete(idx)}
                                                    />
                                                </HStack>
                                            </Box>
                                        </ListItem>
                                    ))
                                )}
                            </List>
                        </Box>
                    </DrawerBody>

                    <DrawerFooter>
                        <Button variant="outline" mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default WorkoutDrawer; 