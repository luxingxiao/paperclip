import { Link } from "@/lib/router";
import { useTranslation } from "react-i18next";
import { Identity } from "./Identity";
import { timeAgo } from "../lib/timeAgo";
import { cn } from "../lib/utils";
import { deriveProjectUrlKey, type ActivityEvent, type Agent } from "@paperclipai/shared";

const ACTION_VERB_KEYS: Record<string, string> = {
  "issue.created": "activityRow.issueCreated",
  "issue.updated": "activityRow.issueUpdated",
  "issue.checked_out": "activityRow.issueCheckedOut",
  "issue.released": "activityRow.issueReleased",
  "issue.comment_added": "activityRow.issueCommentAdded",
  "issue.attachment_added": "activityRow.issueAttachmentAdded",
  "issue.attachment_removed": "activityRow.issueAttachmentRemoved",
  "issue.document_created": "activityRow.issueDocumentCreated",
  "issue.document_updated": "activityRow.issueDocumentUpdated",
  "issue.document_deleted": "activityRow.issueDocumentDeleted",
  "issue.commented": "activityRow.issueCommented",
  "issue.deleted": "activityRow.issueDeleted",
  "agent.created": "activityRow.agentCreated",
  "agent.updated": "activityRow.agentUpdated",
  "agent.paused": "activityRow.agentPaused",
  "agent.resumed": "activityRow.agentResumed",
  "agent.terminated": "activityRow.agentTerminated",
  "agent.key_created": "activityRow.agentKeyCreated",
  "agent.budget_updated": "activityRow.agentBudgetUpdated",
  "agent.runtime_session_reset": "activityRow.agentRuntimeSessionReset",
  "heartbeat.invoked": "activityRow.heartbeatInvoked",
  "heartbeat.cancelled": "activityRow.heartbeatCancelled",
  "approval.created": "activityRow.approvalCreated",
  "approval.approved": "activityRow.approvalApproved",
  "approval.rejected": "activityRow.approvalRejected",
  "project.created": "activityRow.projectCreated",
  "project.updated": "activityRow.projectUpdated",
  "project.deleted": "activityRow.projectDeleted",
  "goal.created": "activityRow.goalCreated",
  "goal.updated": "activityRow.goalUpdated",
  "goal.deleted": "activityRow.goalDeleted",
  "cost.reported": "activityRow.costReported",
  "cost.recorded": "activityRow.costRecorded",
  "company.created": "activityRow.companyCreated",
  "company.updated": "activityRow.companyUpdated",
  "company.archived": "activityRow.companyArchived",
  "company.budget_updated": "activityRow.companyBudgetUpdated",
};

function humanizeValue(value: unknown, noneLabel: string): string {
  if (typeof value !== "string") return String(value ?? noneLabel);
  return value.replace(/_/g, " ");
}

function formatVerb(
  action: string,
  details: Record<string, unknown> | null | undefined,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  if (action === "issue.updated" && details) {
    const previous = (details._previous ?? {}) as Record<string, unknown>;
    if (details.status !== undefined) {
      const from = previous.status;
      return from
        ? t("activityRow.changedStatusFromToOn", {
            from: humanizeValue(from, t("activityRow.none")),
            to: humanizeValue(details.status, t("activityRow.none")),
          })
        : t("activityRow.changedStatusToOn", {
            to: humanizeValue(details.status, t("activityRow.none")),
          });
    }
    if (details.priority !== undefined) {
      const from = previous.priority;
      return from
        ? t("activityRow.changedPriorityFromToOn", {
            from: humanizeValue(from, t("activityRow.none")),
            to: humanizeValue(details.priority, t("activityRow.none")),
          })
        : t("activityRow.changedPriorityToOn", {
            to: humanizeValue(details.priority, t("activityRow.none")),
          });
    }
  }
  const verbKey = ACTION_VERB_KEYS[action];
  return verbKey ? t(verbKey) : action.replace(/[._]/g, " ");
}

function entityLink(entityType: string, entityId: string, name?: string | null): string | null {
  switch (entityType) {
    case "issue": return `/issues/${name ?? entityId}`;
    case "agent": return `/agents/${entityId}`;
    case "project": return `/projects/${deriveProjectUrlKey(name, entityId)}`;
    case "goal": return `/goals/${entityId}`;
    case "approval": return `/approvals/${entityId}`;
    default: return null;
  }
}

interface ActivityRowProps {
  event: ActivityEvent;
  agentMap: Map<string, Agent>;
  entityNameMap: Map<string, string>;
  entityTitleMap?: Map<string, string>;
  className?: string;
}

export function ActivityRow({ event, agentMap, entityNameMap, entityTitleMap, className }: ActivityRowProps) {
  const { t } = useTranslation();
  const verb = formatVerb(event.action, event.details, t);

  const isHeartbeatEvent = event.entityType === "heartbeat_run";
  const heartbeatAgentId = isHeartbeatEvent
    ? (event.details as Record<string, unknown> | null)?.agentId as string | undefined
    : undefined;

  const name = isHeartbeatEvent
    ? (heartbeatAgentId ? entityNameMap.get(`agent:${heartbeatAgentId}`) : null)
    : entityNameMap.get(`${event.entityType}:${event.entityId}`);

  const entityTitle = entityTitleMap?.get(`${event.entityType}:${event.entityId}`);

  const link = isHeartbeatEvent && heartbeatAgentId
    ? `/agents/${heartbeatAgentId}/runs/${event.entityId}`
    : entityLink(event.entityType, event.entityId, name);

  const actor = event.actorType === "agent" ? agentMap.get(event.actorId) : null;
  const actorName = actor?.name
    ?? (event.actorType === "system"
      ? t("agentDetail.actorSystem")
      : event.actorType === "user"
        ? t("agentDetail.actorBoard")
        : event.actorId || t("activityRow.unknown"));

  const inner = (
    <div className="flex gap-3">
      <p className="flex-1 min-w-0 truncate">
        <Identity
          name={actorName}
          size="xs"
          className="align-baseline"
        />
        <span className="text-muted-foreground ml-1">{verb} </span>
        {name && <span className="font-medium">{name}</span>}
        {entityTitle && <span className="text-muted-foreground ml-1"> - {entityTitle}</span>}
      </p>
      <span className="text-xs text-muted-foreground shrink-0 pt-0.5">{timeAgo(event.createdAt)}</span>
    </div>
  );

  const classes = cn(
    "px-4 py-2 text-sm",
    link && "cursor-pointer hover:bg-accent/50 transition-colors",
    className,
  );

  if (link) {
    return (
      <Link to={link} className={cn(classes, "no-underline text-inherit block")}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={classes}>
      {inner}
    </div>
  );
}
