import { useEffect, useState } from "react";
import { LocalStorage, showToast, Toast, List, ActionPanel, Action, Form, Icon } from "@raycast/api";
import { useForm } from "@raycast/utils";
import { validateToken } from "../api/validateToken";
import { displayCode } from "../api/displayCode";
import { getToken } from "../api/getToken";
import { apiAppName } from "../helpers/constants";
import { isAnytypeInstalled, isAnytypeRunning, openAppInBackground, waitForAnytypeOpen } from "../helpers/system";

type EnsureAuthenticatedProps = {
  placeholder?: string;
  viewType: "list" | "form";
  children: React.ReactNode;
};

export default function EnsureAuthenticated({ placeholder, viewType, children }: EnsureAuthenticatedProps) {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [tokenIsValid, setTokenIsValid] = useState<boolean>(false);
  const [challengeId, setChallengeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit, itemProps } = useForm<{ userCode: string }>({
    onSubmit: async (values) => {
      if (!challengeId) {
        showToast({
          style: Toast.Style.Failure,
          title: "Pairing not started",
          message: "Start the pairing before submitting the code.",
        });
        return;
      }

      try {
        setIsLoading(true);
        const { app_key } = await getToken(challengeId, values.userCode);
        await LocalStorage.setItem("app_key", app_key);
        showToast({ style: Toast.Style.Success, title: "Successfully paired" });
        setHasToken(true);
        setTokenIsValid(true);
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "Failed to pair",
          message: String(error),
        });
      } finally {
        setIsLoading(false);
      }
    },
    validation: {
      userCode: (value) => {
        if (!value) {
          return "The code is required.";
        } else if (!/^\d{4}$/.test(value)) {
          return "Code must be exactly 4 digits.";
        }
      },
    },
  });
  useEffect(() => {
    const retrieveAndValidateToken = async () => {
      const token = await LocalStorage.getItem<string>("app_key");
      if (token) {
        const isValid = await validateToken();
        setHasToken(true);
        setTokenIsValid(isValid);
      } else {
        setHasToken(false);
      }
    };
    retrieveAndValidateToken();
  }, []);

  async function startChallenge() {
    try {
      setIsLoading(true);
      const { installed, appName } = await isAnytypeInstalled();
      if (!installed) {
        showToast({
          style: Toast.Style.Failure,
          title: "Anytype not installed",
          message: "Please install Anytype and try again.",
        });
        return;
      }

      const running = await isAnytypeRunning();
      if (!running) {
        await openAppInBackground(appName!);

        showToast({
          style: Toast.Style.Animated,
          title: "Opening Anytype",
          message: "Waiting for Anytype to open...",
        });

        await waitForAnytypeOpen();
      }

      const { challenge_id } = await displayCode(apiAppName);
      setChallengeId(challenge_id);

      // Prevent window from closing
      showToast({
        style: Toast.Style.Animated,
        title: "Pairing started",
        message: "Check the app for the 4-digit code.",
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to start pairing",
        message: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (hasToken === null) {
    if (viewType === "form") {
      return <Form />;
    } else {
      return <List isLoading searchBarPlaceholder={placeholder} />;
    }
  }

  if (hasToken && tokenIsValid) {
    return <>{children}</>;
  }

  return challengeId ? (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit Code" onSubmit={handleSubmit} {...itemProps} />
        </ActionPanel>
      }
    >
      <Form.TextField
        {...itemProps.userCode}
        id="userCode"
        title="Verification Code"
        placeholder="Enter the 4-digit code from popup"
      />
    </Form>
  ) : (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Authentication required"
      navigationTitle="Authenticate to Continue"
    >
      <List.EmptyView
        icon={Icon.Lock}
        title="Authentication required"
        description="Start pairing for a 4-digit code to pop up in the app."
        actions={
          <ActionPanel>
            <Action title="Start Pairing" onAction={startChallenge} />
          </ActionPanel>
        }
      />
    </List>
  );
}
