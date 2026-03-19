import type { AdapterConfigFieldsProps } from "../types";
import { useTranslation } from "react-i18next";
import {
  Field,
  ToggleField,
  DraftInput,
  help,
} from "../../components/agent-config-primitives";
import { ChoosePathButton } from "../../components/PathInstructionsModal";
import { LocalWorkspaceRuntimeFields } from "../local-workspace-runtime-fields";

const inputClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40";

export function CodexLocalConfigFields({
  mode,
  isCreate,
  adapterType,
  values,
  set,
  config,
  eff,
  mark,
  models,
}: AdapterConfigFieldsProps) {
  const { t } = useTranslation();
  const bypassEnabled =
    config.dangerouslyBypassApprovalsAndSandbox === true || config.dangerouslyBypassSandbox === true;

  return (
    <>
      <Field label={t("adapterConfigFields.agentInstructionsFile")} hint={t("adapterConfigFields.instructionsFileHintSystem")}>
        <div className="flex items-center gap-2">
          <DraftInput
            value={
              isCreate
                ? values!.instructionsFilePath ?? ""
                : eff(
                    "adapterConfig",
                    "instructionsFilePath",
                    String(config.instructionsFilePath ?? ""),
                  )
            }
            onCommit={(v) =>
              isCreate
                ? set!({ instructionsFilePath: v })
                : mark("adapterConfig", "instructionsFilePath", v || undefined)
            }
            immediate
            className={inputClass}
            placeholder={t("adapterConfigFields.instructionsFilePathPlaceholder")}
          />
          <ChoosePathButton />
        </div>
      </Field>
      <ToggleField
        label={t("adapterConfigFields.bypassSandbox")}
        hint={help.dangerouslyBypassSandbox}
        checked={
          isCreate
            ? values!.dangerouslyBypassSandbox
            : eff(
                "adapterConfig",
                "dangerouslyBypassApprovalsAndSandbox",
                bypassEnabled,
              )
        }
        onChange={(v) =>
          isCreate
            ? set!({ dangerouslyBypassSandbox: v })
            : mark("adapterConfig", "dangerouslyBypassApprovalsAndSandbox", v)
        }
      />
      <ToggleField
        label={t("adapterConfigFields.enableSearch")}
        hint={help.search}
        checked={
          isCreate
            ? values!.search
            : eff("adapterConfig", "search", !!config.search)
        }
        onChange={(v) =>
          isCreate
            ? set!({ search: v })
            : mark("adapterConfig", "search", v)
        }
      />
      <LocalWorkspaceRuntimeFields
        isCreate={isCreate}
        values={values}
        set={set}
        config={config}
        mark={mark}
        eff={eff}
        mode={mode}
        adapterType={adapterType}
        models={models}
      />
    </>
  );
}
