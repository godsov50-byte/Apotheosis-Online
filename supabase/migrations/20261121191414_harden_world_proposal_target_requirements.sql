-- Require a valid target for every non-creation building proposal.
-- This prevents orphan component and NPC assignment proposals from being committed.
alter table public.exp_world_proposals
  add constraint exp_world_proposals_target_requirement_check
  check (
    (proposal_type='building.create' and target_entity_key is null and target_entity_id is null)
    or
    (proposal_type<>'building.create' and target_entity_key is not null and target_entity_id is not null)
  );
