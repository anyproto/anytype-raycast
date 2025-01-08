import fetch from "node-fetch";
import { useEffect, useState } from "react";
import { LocalStorage, showToast, Toast, List, ActionPanel, Action, Form, Icon } from "@raycast/api";

type EnsureAuthenticatedProps = {
  placeholder?: string;
  viewType: "list" | "form";
  children: React.ReactNode;
};

export default function EnsureAuthenticated({ placeholder, viewType, children }: EnsureAuthenticatedProps) {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [challengeId, setChallengeId] = useState("");
  const [userCode, setUserCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await LocalStorage.getItem<string>("auth_token");
      setHasToken(!!token);
    })();
  }, []);

  if (hasToken === null) {
    if (viewType === "form") {
      return <Form />;
    } else {
      return <List isLoading searchBarPlaceholder={placeholder} />;
    }
  }

  if (hasToken) {
    return <>{children}</>;
  }

  async function startChallenge() {
    try {
      setIsLoading(true);
      const response = await fetch("http://127.0.0.1:31009/v1/auth/display_code", { method: "POST" });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = (await response.json()) as { challenge_id: string };
      if (!data.challenge_id) {
        throw new Error("No challenge_id returned by /auth/display_code");
      }
      setChallengeId(data.challenge_id);
      showToast({
        style: Toast.Style.Success,
        title: "Challenge started",
        message: "Enter the code from the desktop app.",
      });
    } catch (error) {
      showToast({ style: Toast.Style.Failure, title: "Failed to start challenge", message: String(error) });
    } finally {
      setIsLoading(false);
    }
  }

  async function solveChallenge() {
    if (!challengeId || !userCode) {
      showToast({
        style: Toast.Style.Failure,
        title: "Challenge or code missing",
        message: "Please start the challenge and enter the code.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const url = `http://127.0.0.1:31009/v1/auth/token?challenge_id=${challengeId}&code=${userCode}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} because ${await response.text()}`);
      }
      const data = (await response.json()) as { session_token: string; app_key: string };
      if (!data.app_key) {
        throw new Error("No app_key returned by /auth/token");
      }

      await LocalStorage.setItem("auth_token", data.app_key);
      showToast({ style: Toast.Style.Success, title: "Authenticated", message: "Token stored securely." });
      setHasToken(true);
    } catch (error) {
      showToast({ style: Toast.Style.Failure, title: "Failed to solve challenge", message: String(error) });
    } finally {
      setIsLoading(false);
    }
  }

  return challengeId ? (
    <Form
      isLoading={isLoading}
      navigationTitle="Enter Authentication Code"
      actions={
        <ActionPanel>
          <Action title="Submit Code" onAction={solveChallenge} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="userCode"
        title="4-Digit Code"
        placeholder="Enter the 4-digit code from the app"
        value={userCode}
        onChange={setUserCode}
      />
    </Form>
  ) : (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Authentication Required"
      navigationTitle="Authenticate to Continue"
    >
      <List.EmptyView
        icon={Icon.Lock}
        title="Authentication Required"
        description="Authenticate to use the Anytype extension for Raycast. A 4-digit code will pop up in the Anytype desktop app."
        actions={
          <ActionPanel>
            <Action title="Start Challenge" onAction={startChallenge} />
          </ActionPanel>
        }
      />
    </List>
  );
}
