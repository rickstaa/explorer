import ExplorerChart from "@components/ExplorerChart";
import { ExplorerTooltip } from "@components/ExplorerTooltip";
import { Box, Flex } from "@livepeer/design-system";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import type { AccountQueryResult } from "apollo";
import {
  FREQUENT_CUT_CHANGE_WINDOW_DAYS,
  useOrchestratorCutHistory,
} from "hooks/useOrchestratorCutHistory";

const Panel = ({ children }) => (
  <Flex
    css={{
      minHeight: 240,
      height: 240,
      padding: "24px",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      border: "0.5px solid $colors$neutral4",
      flex: 1,
      width: "100%",
    }}
  >
    {children}
  </Flex>
);

const FrequentChangeIndicator = ({
  cutLabel,
  count,
}: {
  cutLabel: string;
  count: number;
}) => (
  <ExplorerTooltip
    multiline
    content={
      <Box>
        This orchestrator has changed their {cutLabel} {count} times in the last{" "}
        {FREQUENT_CUT_CHANGE_WINDOW_DAYS} days. Frequent updates are worth
        reviewing before delegating.
      </Box>
    }
  >
    <Box css={{ display: "flex", alignItems: "center" }}>
      <Box as={ExclamationTriangleIcon} css={{ color: "$amber11" }} />
    </Box>
  </ExplorerTooltip>
);

interface Props {
  transcoder?: NonNullable<AccountQueryResult["data"]>["transcoder"];
}

const OrchestratorCutHistory = ({ transcoder }: Props) => {
  const {
    rewardCutData,
    feeCutData,
    baseRewardCut,
    baseFeeCut,
    rewardCutChangeCount,
    feeCutChangeCount,
    hasFrequentRewardCutChanges,
    hasFrequentFeeCutChanges,
    loading,
  } = useOrchestratorCutHistory(transcoder);

  // Hide when there's no orchestrator or no data to plot.
  if (!transcoder?.id) return null;
  if (!loading && rewardCutData.length === 0) return null;

  return (
    <Box css={{ marginBottom: "$3" }}>
      <Flex
        css={{
          backgroundColor: "$panel",
          borderRadius: "$4",
          border: "1px solid $colors$neutral4",
          overflow: "hidden",
        }}
      >
        <Box
          css={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr",
            "@bp2": {
              gridTemplateColumns: "1fr 1fr",
            },
          }}
        >
          <Panel>
            <ExplorerChart
              title="Reward Cut"
              tooltip="The percent of inflationary rewards kept by the orchestrator over time."
              titleTrailing={
                hasFrequentRewardCutChanges ? (
                  <FrequentChangeIndicator
                    cutLabel="reward cut"
                    count={rewardCutChangeCount}
                  />
                ) : undefined
              }
              data={rewardCutData}
              base={baseRewardCut}
              basePercentChange={0}
              unit="percent"
              type="line"
              lineCurve="stepAfter"
              yDomain={[0, 1]}
            />
          </Panel>
          <Panel>
            <ExplorerChart
              title="Fee Cut"
              tooltip="The percent of transcoding fees kept by the orchestrator over time."
              titleTrailing={
                hasFrequentFeeCutChanges ? (
                  <FrequentChangeIndicator
                    cutLabel="fee cut"
                    count={feeCutChangeCount}
                  />
                ) : undefined
              }
              data={feeCutData}
              base={baseFeeCut}
              basePercentChange={0}
              unit="percent"
              type="line"
              lineCurve="stepAfter"
              yDomain={[0, 1]}
            />
          </Panel>
        </Box>
      </Flex>
    </Box>
  );
};

export default OrchestratorCutHistory;
