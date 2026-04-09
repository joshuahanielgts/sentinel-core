-- Prevent duplicate concurrent analysis runs for the same contract.
-- Only one analysis can be in 'pending' or 'running' state at a time.
create unique index if not exists one_active_analysis_per_contract
  on analysis_runs (contract_id)
  where status in ('pending', 'running');
