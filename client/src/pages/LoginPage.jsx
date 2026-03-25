import {
  AppButton,
  AppButtonGroup,
  AppButtonGroupSpacer,
} from "../components/AppButton";
import {
  CardForm,
  CardFormContent,
  CardFormFooter,
  CardFormHeader,
  CardFormMessage,
  CardFormTitle,
} from "../components/CardForm";
import {
  Field,
  FieldInput,
  FieldLabel,
  FieldMessage,
  ReactHookFieldMessage,
} from "../components/Field";
import { useForm } from "react-hook-form";
import { useLoginUser } from "../api";
import { useI8n } from "../provider/context";
import { FancyLink } from "../components/FancyLink";
import { NotLoggedInGuard } from "../guard/LoginGuard";
import { useActionState } from "../hook";

function LoginPage() {
  const loginUser = useLoginUser();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const { getText } = useI8n();
  const { error, isPerformed, handlePromise } = useActionState();

  return (
    <CardForm
      onSubmit={handleSubmit((data) =>
        handlePromise(loginUser(data.email, data.password))
      )}
    >
      <CardFormHeader>
        <CardFormTitle>{getText("loginAction")}</CardFormTitle>
      </CardFormHeader>
      <CardFormContent>
        <CardFormMessage>
          {getText("notHaveAccountMessage")}{" "}
          <FancyLink to="/register">{getText("registerAction")}</FancyLink>
        </CardFormMessage>
        <Field inputId="email">
          <FieldLabel>{getText("emailField")}</FieldLabel>
          <FieldInput
            type="email"
            {...register("email", {
              required: {
                value: true,
                message: getText("emailCannotBlankMessage"),
              },
            })}
          />
          <ReactHookFieldMessage error={errors.email} />
        </Field>
        <Field inputId="password">
          <FieldLabel>{getText("passwordField")}</FieldLabel>
          <FieldInput
            type="password"
            {...register("password", {
              required: {
                value: true,
                message: getText("passwordCannotBlankMessage"),
              },
            })}
          />
          <ReactHookFieldMessage error={errors.password} />
        </Field>
        <Field inputId="">
          {error && <FieldMessage error>{error}</FieldMessage>}
        </Field>
      </CardFormContent>
      <CardFormFooter>
        <AppButtonGroup>
          <AppButtonGroupSpacer />
          <AppButton variant="primary" disabled={isPerformed}>
            {getText("loginAction")}
          </AppButton>
        </AppButtonGroup>
      </CardFormFooter>
    </CardForm>
  );
}

export function LoginPageWrapper() {
  return (
    <NotLoggedInGuard>
      <LoginPage />
    </NotLoggedInGuard>
  );
}
