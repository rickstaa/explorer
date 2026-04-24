import type { ChartDatum } from "@components/ExplorerChart";
import type { AccountQueryResult } from "apollo";
import {
  OrderDirection,
  TranscoderUpdateEvent_OrderBy,
  useTranscoderUpdateEventsQuery,
} from "apollo";
import { useMemo } from "react";

export type CutDataPoint = {
  timestamp: number;
  rewardCut: number;
  feeCut: number;
};

type Transcoder = NonNullable<AccountQueryResult["data"]>["transcoder"];

// A warning is surfaced on the cut history charts when an orchestrator records
// at least this many value transitions within the recent window. Kept
// deliberately lenient — see the chart tooltip copy for why this is
// informational rather than a judgement.
export const FREQUENT_CUT_CHANGE_WINDOW_DAYS = 30;
export const FREQUENT_CUT_CHANGE_MIN_COUNT = 3;

export function useOrchestratorCutHistory(transcoder?: Transcoder) {
  const { data, loading } = useTranscoderUpdateEventsQuery({
    variables: {
      where: {
        delegate: transcoder?.id,
      },
      first: 1000,
      orderBy: TranscoderUpdateEvent_OrderBy.Timestamp,
      orderDirection: OrderDirection.Asc,
    },
    skip: !transcoder?.id,
  });

  const chartData = useMemo<CutDataPoint[]>(() => {
    const events: CutDataPoint[] = (data?.transcoderUpdateEvents ?? []).map(
      (event) => ({
        timestamp: event.timestamp,
        rewardCut: (Number(event.rewardCut) / 1000000) * 100,
        feeCut: (1 - Number(event.feeShare) / 1000000) * 100,
      })
    );

    // No update events — synthesize a starting anchor from current
    // on-chain values at activation time so the chart shows a flat line.
    if (
      events.length === 0 &&
      transcoder?.activationTimestamp &&
      transcoder?.rewardCut != null &&
      transcoder?.feeShare != null
    ) {
      events.push({
        timestamp: Number(transcoder.activationTimestamp),
        rewardCut: (Number(transcoder.rewardCut) / 1000000) * 100,
        feeCut: (1 - Number(transcoder.feeShare) / 1000000) * 100,
      });
    }

    if (events.length === 0) return [];

    // "Now" anchor so the chart line extends to the present day.
    const last = events[events.length - 1];
    // eslint-disable-next-line react-hooks/purity
    const now = Math.floor(Date.now() / 1000);
    if (now - last.timestamp > 86400) {
      events.push({
        timestamp: now,
        rewardCut: last.rewardCut,
        feeCut: last.feeCut,
      });
    }

    return events;
  }, [
    data,
    transcoder?.activationTimestamp,
    transcoder?.rewardCut,
    transcoder?.feeShare,
  ]);

  // ExplorerChart's percent unit expects decimals (0.05 = 5%).
  const rewardCutData = useMemo<ChartDatum[]>(
    () => chartData.map((d) => ({ x: d.timestamp, y: d.rewardCut / 100 })),
    [chartData]
  );
  const feeCutData = useMemo<ChartDatum[]>(
    () => chartData.map((d) => ({ x: d.timestamp, y: d.feeCut / 100 })),
    [chartData]
  );

  const baseRewardCut = chartData.length
    ? chartData[chartData.length - 1].rewardCut / 100
    : 0;
  const baseFeeCut = chartData.length
    ? chartData[chartData.length - 1].feeCut / 100
    : 0;

  // Count how many times the reward / fee cut values actually changed
  // within the recent window. We walk events in order so a transition that
  // straddles the window boundary is still attributed to the in-window event.
  const { rewardCutChangeCount, feeCutChangeCount } = useMemo(() => {
    const events = data?.transcoderUpdateEvents ?? [];
    const cutoff =
      // eslint-disable-next-line react-hooks/purity
      Math.floor(Date.now() / 1000) - FREQUENT_CUT_CHANGE_WINDOW_DAYS * 86400;

    let rewardChanges = 0;
    let feeChanges = 0;
    let prevReward: string | undefined;
    let prevFee: string | undefined;

    for (const e of events) {
      if (
        e.timestamp >= cutoff &&
        prevReward !== undefined &&
        String(e.rewardCut) !== prevReward
      ) {
        rewardChanges += 1;
      }
      if (
        e.timestamp >= cutoff &&
        prevFee !== undefined &&
        String(e.feeShare) !== prevFee
      ) {
        feeChanges += 1;
      }
      prevReward = String(e.rewardCut);
      prevFee = String(e.feeShare);
    }

    return {
      rewardCutChangeCount: rewardChanges,
      feeCutChangeCount: feeChanges,
    };
  }, [data]);

  const hasFrequentRewardCutChanges =
    rewardCutChangeCount >= FREQUENT_CUT_CHANGE_MIN_COUNT;
  const hasFrequentFeeCutChanges =
    feeCutChangeCount >= FREQUENT_CUT_CHANGE_MIN_COUNT;

  return {
    chartData,
    rewardCutData,
    feeCutData,
    baseRewardCut,
    baseFeeCut,
    rewardCutChangeCount,
    feeCutChangeCount,
    hasFrequentRewardCutChanges,
    hasFrequentFeeCutChanges,
    loading,
  };
}
