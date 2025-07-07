"use client";

import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Container,
  Divider,
  Flex,
  Heading,
  IconButton,
  Spacer,
  Tooltip,
  VStack,
  useColorMode,
  Box
} from "@chakra-ui/react";
import { useState } from "react";
import AgeGroupSelector from "@/components/AgeGroupSelector";
import GenderSelector from "@/components/GenderSelector";
import PushUpSlider from "@/components/PushUpSlider";
import RunSlider from "@/components/RunSlider";
import ScoreTally from "@/components/ScoreTally";
import SitUpSlider from "@/components/SitUpSlider";
import { femalePushUpScoreLookup, malePushUpScoreLookup } from "@/lib/pushUpScoreLookup";
import { femaleRun24ScoreLookup, maleRun24ScoreLookup } from "@/lib/run24ScoreLookup";
import { maleSitUpScoreLookup, femaleSitUpScoreLookup } from "@/lib/sitUpScoreLookup";
import { getReward } from "@/lib/utils";

const ageBuckets = Object.keys(malePushUpScoreLookup).map(Number);

const getAgeLabel = (bucket: number, idx: number, arr: number[]) => {
  if (idx === 0) return `≤${bucket}`;
  const prev = arr[idx - 1];
  return `${prev + 1}-${bucket}`;
};

export default function Home() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [ageGroup, setAgeGroup] = useState<number>(ageBuckets[4]);
  const [run, setRun] = useState<number>(720); // seconds
  const [pushUps, setPushUps] = useState<number>(25);
  const [sitUps, setSitUps] = useState<number>(25);
  const { colorMode, toggleColorMode } = useColorMode();

  // Lookup helpers
  const pushUpScore = (gender === "male"
    ? malePushUpScoreLookup
    : femalePushUpScoreLookup)[ageGroup]?.[pushUps] ?? 0;
  const sitUpScore = (gender === "male"
    ? maleSitUpScoreLookup
    : femaleSitUpScoreLookup)[ageGroup]?.[sitUps] ?? 0;
  const runScore = (gender === "male"
    ? maleRun24ScoreLookup
    : femaleRun24ScoreLookup)[ageGroup]?.[run] ?? 0;
  const total = pushUpScore + sitUpScore + runScore;

  // For slider marks
  const runMin = Math.min(...Object.keys((gender === "male" ? maleRun24ScoreLookup : femaleRun24ScoreLookup)[ageGroup]).map(Number));
  const runMax = Math.max(...Object.keys((gender === "male" ? maleRun24ScoreLookup : femaleRun24ScoreLookup)[ageGroup]).map(Number));
  const pushMin = Math.min(...Object.keys((gender === "male" ? malePushUpScoreLookup : femalePushUpScoreLookup)[ageGroup]).map(Number));
  const pushMax = Math.max(...Object.keys((gender === "male" ? malePushUpScoreLookup : femalePushUpScoreLookup)[ageGroup]).map(Number));
  const sitMin = Math.min(...Object.keys((gender === "male" ? maleSitUpScoreLookup : femaleSitUpScoreLookup)[ageGroup]).map(Number));
  const sitMax = Math.max(...Object.keys((gender === "male" ? maleSitUpScoreLookup : femaleSitUpScoreLookup)[ageGroup]).map(Number));

  // Helper to format seconds as mm:ss
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Helper to find reps to next point for push-ups
  const getNextPushUpReps = (() => {
    const table = (gender === "male" ? malePushUpScoreLookup : femalePushUpScoreLookup)[ageGroup];
    if (!table) return null;
    const currentScore = table[pushUps] ?? 0;
    let reps = pushUps + 1;
    while (reps <= pushMax) {
      if (table[reps] > currentScore) return reps - pushUps;
      reps++;
    }
    return null;
  })();

  // Helper to find reps to next point for sit-ups
  const getNextSitUpReps = (() => {
    const table = (gender === "male" ? maleSitUpScoreLookup : femaleSitUpScoreLookup)[ageGroup];
    if (!table) return null;
    const currentScore = table[sitUps] ?? 0;
    let reps = sitUps + 1;
    while (reps <= sitMax) {
      if (table[reps] > currentScore) return reps - sitUps;
      reps++;
    }
    return null;
  })();

  // Helper to find seconds to next point for run (lower is better)
  const getNextRunSecs = (() => {
    const table = (gender === "male" ? maleRun24ScoreLookup : femaleRun24ScoreLookup)[ageGroup];
    if (!table) return null;
    const currentScore = table[run] ?? 0;
    let secs = run - 1;
    while (secs >= runMin) {
      if (table[secs] > currentScore) return run - secs;
      secs--;
    }
    return null;
  })();

  return (
    <Container maxW="lg" py={10}>
      <Flex align="center" mb={8}>
        <Box>
          <Heading size="lg" letterSpacing="tight" fontFamily="var(--font-ubuntu-sans)">
            IPPT Score Calculator
          </Heading>
          <Heading size="xs" color="gray.500" fontWeight="normal" mt={2} fontFamily="var(--font-ubuntu-sans)">
            The most modern IPPT calculator in 2025
          </Heading>
        </Box>
        <Spacer />
        <Tooltip label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="lg"
            ml={2}
          />
        </Tooltip>
      </Flex>
      <VStack spacing={8} align="stretch">
        {/* Gender Selection */}
        <GenderSelector gender={gender} setGender={setGender} />
        {/* Age Group Selection */}
        <AgeGroupSelector
          ageBuckets={ageBuckets}
          ageGroup={ageGroup}
          setAgeGroup={setAgeGroup}
          getAgeLabel={getAgeLabel}
        />
        <Divider />
        {/* Run Slider */}
        <RunSlider
          run={run}
          setRun={setRun}
          runMin={runMin}
          runMax={runMax}
          runScore={runScore}
          formatTime={formatTime}
          getNextPointSecs={getNextRunSecs}
        />
        {/* Push Ups Slider */}
        <PushUpSlider
          pushUps={pushUps}
          setPushUps={setPushUps}
          pushMin={pushMin}
          pushMax={pushMax}
          pushUpScore={pushUpScore}
          getNextPointReps={getNextPushUpReps}
        />
        {/* Sit Ups Slider */}
        <SitUpSlider
          sitUps={sitUps}
          setSitUps={setSitUps}
          sitMin={sitMin}
          sitMax={sitMax}
          sitUpScore={sitUpScore}
          getNextPointReps={getNextSitUpReps}
        />
        {/* Score Tally */}
        <ScoreTally
          total={total}
          runScore={runScore}
          pushUpScore={pushUpScore}
          sitUpScore={sitUpScore}
          reward={getReward(total)}
        />
      </VStack>
    </Container>
  );
}
