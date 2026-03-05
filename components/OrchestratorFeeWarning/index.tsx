import { LAYOUT_MAX_WIDTH } from "@layouts/constants";
import dayjs from "@lib/dayjs";
import { Box, Button, Container, Flex, Text } from "@livepeer/design-system";
import { useDelegateFeeChangeQuery } from "apollo";
import { useAccountAddress } from "hooks";
import Link from "next/link";
import { useMemo } from "react";

/** Number of days within which a fee/reward cut change triggers the warning. */
const CHANGE_THRESHOLD_DAYS = 30;

const OrchestratorFeeWarning = () => {
  const accountAddress = useAccountAddress();

  const { data, loading } = useDelegateFeeChangeQuery({
    variables: {
      id: accountAddress?.toLowerCase() ?? "",
    },
    pollInterval: 120000,
    skip: !accountAddress,
  });

  const delegate = data?.delegator?.delegate;

  const warning = useMemo(() => {
    if (!delegate) return null;

    const now = dayjs();

    const feeShareDays = now.diff(
      dayjs.unix(delegate.feeShareUpdateTimestamp),
      "days"
    );
    const rewardCutDays = now.diff(
      dayjs.unix(delegate.rewardCutUpdateTimestamp),
      "days"
    );

    const mostRecentDays = Math.min(feeShareDays, rewardCutDays);

    if (mostRecentDays >= CHANGE_THRESHOLD_DAYS) return null;

    // Determine which parameter changed most recently
    const changedParam =
      feeShareDays <= rewardCutDays ? "fee cut" : "reward cut";

    const changeTime =
      feeShareDays <= rewardCutDays
        ? dayjs.unix(delegate.feeShareUpdateTimestamp).fromNow()
        : dayjs.unix(delegate.rewardCutUpdateTimestamp).fromNow();

    // Compute the current values for display
    const feeCutPercent = (
      (1 - Number(delegate.feeShare) / 1000000) *
      100
    ).toFixed(0);
    const rewardCutPercent = (
      (Number(delegate.rewardCut) / 1000000) *
      100
    ).toFixed(0);

    return { changedParam, changeTime, feeCutPercent, rewardCutPercent };
  }, [delegate]);

  if (!warning || loading) {
    return null;
  }

  return (
    <Container css={{ maxWidth: LAYOUT_MAX_WIDTH, marginBottom: "$5" }}>
      <Box
        css={{
          marginTop: "$5",
          borderRadius: 10,
          width: "100%",
          padding: "$4",
          color: "$loContrast",
          backgroundColor: "$amber11",
        }}
      >
        <Box
          css={{
            marginBottom: "$2",
            fontSize: "$6",
            fontWeight: 600,
          }}
        >
          Orchestrator Fee/Reward Change
        </Box>
        <Box>
          <Text css={{ color: "$loContrast" }}>
            Your orchestrator updated their {warning.changedParam}{" "}
            {warning.changeTime}. Current rates — Fee Cut:{" "}
            {warning.feeCutPercent}%, Reward Cut: {warning.rewardCutPercent}%.
            Review their profile to make sure you are comfortable with the new
            rates.
          </Text>
          <Flex css={{ gap: "$2", marginTop: "$2" }}>
            <Link
              href={`/accounts/${delegate?.id}/orchestrating`}
              passHref
            >
              <Button
                as="a"
                size="3"
                variant="transparentBlack"
                ghost
              >
                View Orchestrator
              </Button>
            </Link>
            <Link href="/orchestrators" passHref>
              <Button
                as="a"
                size="3"
                variant="transparentBlack"
                ghost
              >
                Browse Orchestrators
              </Button>
            </Link>
          </Flex>
        </Box>
      </Box>
    </Container>
  );
};

export default OrchestratorFeeWarning;
