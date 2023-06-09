// import { ProposalState } from '@aave/contract-helpers';
import { ShieldExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Typography, useTheme } from '@mui/material';
import { GovernancePageProps } from 'pages/governance/index.governance';
import { CheckBadge } from 'src/components/primitives/CheckBadge';
import { Link, ROUTES } from 'src/components/primitives/Link';
import {
  formatProposal,
  hasExecutedL2,
  proposalHasCrossChainBridge,
  shouldDisplayL2Badge,
} from 'src/modules/governance/utils/formatProposal';
import { governanceConfig } from 'src/ui-config/governanceConfig';

import { FormattedProposalTime } from './FormattedProposalTime';
import { StateBadge } from './StateBadge';
import { isProposalStateImmutable } from './utils/immutableStates';
import { VoteBar } from './VoteBar';

export function ProposalListItem({
  proposal,
  prerendered,
  ipfs,
}: GovernancePageProps['proposals'][0]) {
  const { nayPercent, yaePercent, nayVotes, yaeVotes, quorumReached, diffReached } =
    formatProposal(proposal);
  const { palette } = useTheme();

  if (proposal.id === 239) {
    console.log(proposal.executor);
  }
  const mightBeStale = prerendered && !isProposalStateImmutable(proposal);

  const executedL2 = proposal ? hasExecutedL2(proposal) : false;
  const proposalCrosschainBridge = proposal ? proposalHasCrossChainBridge(proposal) : false;
  const executorChain = proposalCrosschainBridge ? 'L2' : 'L1';
  const pendingL2Execution = proposalCrosschainBridge && !executedL2;
  const displayL2StateBadge = proposal
    ? shouldDisplayL2Badge(proposal, executorChain, executedL2, pendingL2Execution)
    : false;

  return (
    <Box
      sx={{
        px: 6,
        py: 8,
        display: 'flex',
        flexWrap: 'wrap',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
      component={Link}
      href={
        prerendered
          ? ROUTES.prerenderedProposal(proposal.id)
          : ROUTES.dynamicRenderedProposal(proposal.id)
      }
    >
      <Box
        sx={{
          width: {
            xs: '100%',
            lg: '70%',
          },

          display: 'flex',
          flexDirection: 'column',
          // justifyContent: 'space-between',
        }}
      >
        <Typography variant="h3" gutterBottom sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {ipfs.title}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            // alignItems: 'center',
            gap: 3,
          }}
        >
          <Box>
            <StateBadge
              sx={{ marginRight: 2 }}
              state={proposal.state}
              crossChainBridge={'L1'}
              loading={mightBeStale}
            />

            <FormattedProposalTime
              state={proposal.state}
              startTimestamp={proposal.startTimestamp}
              executionTime={proposal.executionTime}
              expirationTimestamp={proposal.expirationTimestamp}
              executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
              l2Execution={false}
            />
          </Box>
          {proposal.executor === governanceConfig.addresses.AAVE_GOVERNANCE_V2_EXECUTOR_LONG ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subheader2" component="span" sx={{ mr: 1 }}>
                Long Executor
              </Typography>
              <ShieldExclamationIcon
                color={quorumReached ? palette.success.main : palette.warning.main}
                height="16"
              />
            </Box>
          ) : null}

          {displayL2StateBadge && (
            <Box display={'flex'} ml={'-3px'}>
              <StateBadge
                sx={{ marginRight: 2 }}
                crossChainBridge={executorChain}
                state={proposal.state}
                loading={mightBeStale}
                pendingL2Execution={pendingL2Execution}
              />

              <FormattedProposalTime
                state={proposal.state}
                startTimestamp={proposal.startTimestamp}
                executionTime={proposal.executionTime}
                expirationTimestamp={proposal.expirationTimestamp}
                executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
                l2Execution={displayL2StateBadge}
              />
            </Box>
          )}
        </Box>
      </Box>
      <Box />
      <Box
        sx={{
          flexGrow: 1,
          pl: { xs: 0, lg: 4 },
          mt: { xs: 7, lg: 0 },
        }}
      >
        <VoteBar yae percent={yaePercent} votes={yaeVotes} sx={{ mb: 4 }} loading={mightBeStale} />
        <VoteBar percent={nayPercent} votes={nayVotes} loading={mightBeStale} />
        <Box
          display="flex"
          sx={{
            mt: 3,
          }}
        >
          <CheckBadge
            sx={{ mr: 3 }}
            text={<Trans>Quorum</Trans>}
            checked={quorumReached}
            loading={mightBeStale}
          />
          <CheckBadge
            text={<Trans>Differential</Trans>}
            checked={diffReached}
            loading={mightBeStale}
          />
        </Box>
      </Box>
    </Box>
  );
}
