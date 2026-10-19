"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  FileField,
  SelectField,
  TextField,
} from "@/components/ui";
import { idle } from "@/lib/actions/form-state";
import { regions } from "@/lib/regions";
import { documentKinds } from "@/lib/validation/installer";
import { saveProfileAction, uploadDocumentAction } from "./actions";

export function ProfileForm({
  active,
  cap,
  defaultCap,
  coveredRegions,
  locale,
}: {
  active: boolean;
  cap: number | null;
  defaultCap: number;
  coveredRegions: string[];
  locale: string;
}) {
  const t = useTranslations("portal.profile");
  const ta = useTranslations("forInstallers.apply.fields");
  const tv = useTranslations("validation");
  const tr = useTranslations("regions");
  const tl = useTranslations("language");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState(saveProfileAction, idle);
  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  return (
    <form action={action} className="space-y-6">
      {state.status === "success" && (
        <Alert tone="success" role="status">
          {t("saved")}
        </Alert>
      )}
      <Checkbox
        name="active"
        defaultChecked={active}
        label={t("active")}
        hint={t("activeHint")}
      />
      <TextField
        name="monthly_lead_cap"
        inputMode="numeric"
        label={t("cap")}
        hint={t("capHint", { cap: defaultCap })}
        optionalLabel={tc("optional")}
        defaultValue={cap ?? ""}
        error={
          errors.monthly_lead_cap ? tv(errors.monthly_lead_cap) : undefined
        }
        className="max-w-xs"
      />
      <CheckboxGroup
        name="regions"
        legend={t("regions")}
        defaultValues={coveredRegions}
        options={regions.map((r) => ({ value: r, label: tr(r) }))}
        error={errors.regions ? tv(errors.regions) : undefined}
      />
      <SelectField
        name="locale"
        label={ta("locale")}
        defaultValue={locale}
        className="max-w-xs"
        options={[
          { value: "en", label: tl("en") },
          { value: "fr", label: tl("fr") },
        ]}
      />
      <Button type="submit" disabled={pending}>
        {tc("save")}
      </Button>
    </form>
  );
}

export function UploadForm() {
  const t = useTranslations("portal.profile");
  const ta = useTranslations("forInstallers.apply.fields");
  const tv = useTranslations("validation");
  const [state, action, pending] = useActionState(uploadDocumentAction, idle);
  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  return (
    <form action={action} className="space-y-4">
      {state.status === "success" && (
        <Alert tone="success" role="status">
          {t("uploaded")}
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          name="kind"
          label={t("uploadKind")}
          options={documentKinds.map((k) => ({
            value: k,
            label: ta(`doc_${k}`),
          }))}
          error={errors.kind ? tv(errors.kind) : undefined}
        />
        <FileField
          name="file"
          label={t("uploadFile")}
          accept=".pdf,.jpg,.jpeg,.png"
          error={errors.file ? tv(errors.file) : undefined}
        />
      </div>
      <Button type="submit" variant="secondary" disabled={pending}>
        {t("upload")}
      </Button>
    </form>
  );
}
