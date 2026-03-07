import { LAYOUT_MAX_WIDTH } from "@layouts/constants";
import dayjs from "@lib/dayjs";
import { formatAddress } from "@lib/utils";
import { Box, Button, Container, Text } from "@livepeer/design-system";
import { useDelegateRewardCutQuery } from "apollo";
import { useAccountAddress, useEnsData } from "hooks";
import Link from "next/link";
import numbro from "numbro";
import { useEffect, useMemo, useState } from "react";

const NOTIFICATION_WINDOW_SECONDS = 7 * 24 * 60 * 60; // 7 days

const RewardCutNotification = () => {
  const accountAddress = useAccountAddress();

  const [timestampThreshold, setTimestampThreshold] = useState(0);

  useEffect(() => {
    setTimestampThreshold(
      Math.floor(Date.now() / 1000) - NOTIFICATION_WINDOW_SECONDS
    );
  }, []);

  const { data, loading } = useDelegateRewardCutQuery({
    variables: {
      id: accountAddress?.toLowerCase() ?? "",
      delegate: accountAddress?.toLowerCase() ?? "",
      timestamp_gte: timestampThreshold,
    },
    pollInterval: 120000,
    skip: !accountAddress || timestampThreshold === 0,
  });

  const delegateId = data?.delegator?.delegate?.id;
  const delegateIdentity = useEnsData(delegateId);

  // Refetch with actual delegate ID once we know it
  const { data: delegateData } = useDelegateRewardCutQuery({
    variables: {
      id: accountAddress?.toLowerCase() ?? "",
      delegate: delegateId?.toLowerCase() ?? "",
      timestamp_gte: timestampThreshold,
    },
    pollInterval: 120000,
    skip: !accountAddress || !delegateId || timestampThreshold === 0,
  });

  const rewardCutInfo = useMemo(() => {
    if (!delegateData?.delegator?.delegate) return null;

    const delegate = delegateData.delegator.delegate;
    const updateTimestamp = delegate.rewardCutUpdateTimestamp;

    // Check if the reward cut was updated within the notification window
    if (updateTimestamp < timestampThreshold) return null;

    const events = delegateData.transcoderUpdateEvents;
    const currentRewardCut = Number(delegate.rewardCut) / 1000000;

    // Find the previous reward cut from events (the second most recent, or the oldest in our window)
    let previousRewardCut: number | null = null;
    if (events.length >= 2) {
      previousRewardCut = Number(events[events.length - 1].rewardCut) / 1000000;
    }

    return {
      currentRewardCut,
      previousRewardCut,
      updateTimestamp,
      delegateId: delegate.id,
      increased:
        previousRewardCut !== null
          ? currentRewardCut > previousRewardCut
          : null,
    };
  }, [delegateData, timestampThreshold]);

  // Don't show if the user is their own delegate (orchestrator)
  const isOrchestrator = data?.delegator?.delegate?.id === data?.delegator?.id;

  if (loading || !rewardCutInfo || isOrchestrator) {
    return null;
  }

  const delegateName =
    delegateIdentity?.name || formatAddress(rewardCutInfo.delegateId);

  return (
    <Container css={{ maxWidth: LAYOUT_MAX_WIDTH, marginBottom: "$5" }}>
      <Box
        css={{
          marginTop: "$5",
          borderRadius: 10,
          width: "100%",
          padding: "$4",
          color: "$loContrast",
          backgroundColor:
            rewardCutInfo.increased === false ? "$blue11" : "$amber11",
        }}
      >
        <Box
          css={{
            marginBottom: "$2",
            fontSize: "$6",
            fontWeight: 600,
          }}
        >
          Reward Cut{" "}
          {rewardCutInfo.increased === true
            ? "Increased"
            : rewardCutInfo.increased === false
            ? "Decreased"
            : "Updated"}
        </Box>
        <Box>
          <Text css={{ color: "$loContrast" }}>
            Your orchestrator{" "}
            <Text as="span" css={{ fontWeight: 600, color: "$loContrast" }}>
              {delegateName}
            </Text>{" "}
            {rewardCutInfo.previousRewardCut !== null ? (
              <>
                changed their reward cut from{" "}
                <Text as="span" css={{ fontWeight: 600, color: "$loContrast" }}>
                  {numbro(rewardCutInfo.previousRewardCut).format({
                    output: "percent",
                    mantissa: 2,
                  })}
                </Text>{" "}
                to{" "}
                <Text as="span" css={{ fontWeight: 600, color: "$loContrast" }}>
                  {numbro(rewardCutInfo.currentRewardCut).format({
                    output: "percent",
                    mantissa: 2,
                  })}
                </Text>
              </>
            ) : (
              <>
                updated their reward cut to{" "}
                <Text as="span" css={{ fontWeight: 600, color: "$loContrast" }}>
                  {numbro(rewardCutInfo.currentRewardCut).format({
                    output: "percent",
                    mantissa: 2,
                  })}
                </Text>
              </>
            )}{" "}
            {dayjs.unix(rewardCutInfo.updateTimestamp).fromNow()}.
            {rewardCutInfo.increased && (
              <>
                {" "}
                This means you will receive a smaller share of inflationary
                rewards.
              </>
            )}
          </Text>
          <Link href="/orchestrators" passHref>
            <Button
              as="a"
              size="3"
              css={{ marginTop: "$2" }}
              variant="transparentBlack"
              ghost
            >
              View Orchestrators
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default RewardCutNotification;
