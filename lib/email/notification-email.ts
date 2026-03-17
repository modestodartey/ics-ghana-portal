import nodemailer from "nodemailer";

type NotificationEmailPayload = {
  recipients: string[];
  title: string;
  body: string;
  audienceLabel: string;
  createdByEmail: string;
};

type NotificationEmailResult = {
  sentCount: number;
  failedCount: number;
  warning: string | null;
};

type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

type EmailFailureContext = {
  recipient?: string;
  title: string;
  error: unknown;
};

class EmailConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailConfigurationError";
  }
}

function readEnvValue(primaryKey: string, legacyKey?: string) {
  return process.env[primaryKey] ?? (legacyKey ? process.env[legacyKey] : undefined) ?? "";
}

function getEmailConfig(): EmailConfig {
  const host = readEnvValue("SMTP_HOST", "EMAIL_SMTP_HOST");
  const port = Number(readEnvValue("SMTP_PORT", "EMAIL_SMTP_PORT") || "587");
  const secureSetting = readEnvValue("SMTP_SECURE", "EMAIL_SMTP_SECURE");
  const user = readEnvValue("SMTP_USER", "EMAIL_SMTP_USER");
  const pass = readEnvValue("SMTP_PASS", "EMAIL_SMTP_PASS");
  const from =
    readEnvValue("SMTP_FROM") ||
    (() => {
      const fromAddress = readEnvValue("EMAIL_FROM_ADDRESS");
      const fromName = readEnvValue("EMAIL_FROM_NAME") || "ICS Ghana Portal";

      return fromAddress ? `${fromName} <${fromAddress}>` : "";
    })();

  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    secure: secureSetting === "true" || secureSetting === "1" || port === 465,
    user,
    pass,
    from
  };
}

function getMissingConfigKeys(config: EmailConfig) {
  const missingKeys: string[] = [];

  if (!config.host) {
    missingKeys.push("SMTP_HOST");
  }

  if (!config.port) {
    missingKeys.push("SMTP_PORT");
  }

  if (!config.user) {
    missingKeys.push("SMTP_USER");
  }

  if (!config.pass) {
    missingKeys.push("SMTP_PASS");
  }

  if (!config.from) {
    missingKeys.push("SMTP_FROM");
  }

  return missingKeys;
}

function assertEmailConfig(config: EmailConfig) {
  const missingKeys = getMissingConfigKeys(config);

  if (missingKeys.length === 0) {
    return;
  }

  throw new EmailConfigurationError(
    `Email delivery is not configured on this server. Add ${missingKeys.join(", ")} before sending notification emails.`
  );
}

function buildEmailText(payload: NotificationEmailPayload) {
  return [
    "ICS Ghana Portal Notification",
    "",
    `Title: ${payload.title}`,
    `Audience: ${payload.audienceLabel}`,
    `Sent by: ${payload.createdByEmail}`,
    "",
    payload.body,
    "",
    "Please sign in to the ICS Ghana Portal for full details."
  ].join("\n");
}

function buildEmailHtml(payload: NotificationEmailPayload) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <p style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: #0f6b46; font-weight: 700;">
        ICS Ghana Portal
      </p>
      <h2 style="margin: 0 0 12px; color: #0f172a;">${payload.title}</h2>
      <p style="margin: 0 0 8px;"><strong>Audience:</strong> ${payload.audienceLabel}</p>
      <p style="margin: 0 0 16px;"><strong>Sent by:</strong> ${payload.createdByEmail}</p>
      <p style="margin: 0 0 18px;">${payload.body.replace(/\n/g, "<br />")}</p>
      <p style="margin: 0; color: #475569;">Please sign in to the ICS Ghana Portal for full details.</p>
    </div>
  `;
}

function getFriendlyEmailDeliveryMessage(error: unknown) {
  if (error instanceof EmailConfigurationError) {
    return error.message;
  }

  if (error instanceof Error) {
    return `Notification email delivery failed: ${error.message}`;
  }

  return "Notification email delivery failed on the server.";
}

function logEmailFailure(context: EmailFailureContext) {
  console.error("ICS Ghana Portal: notification email delivery failed.", {
    recipient: context.recipient ?? null,
    title: context.title,
    error: context.error
  });
}

export async function sendNotificationEmails(payload: NotificationEmailPayload): Promise<NotificationEmailResult> {
  if (payload.recipients.length === 0) {
    return {
      sentCount: 0,
      failedCount: 0,
      warning: "No matching recipients were available for email delivery."
    };
  }

  const config = getEmailConfig();
  assertEmailConfig(config);

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  if (typeof transporter.verify === "function") {
    try {
      await transporter.verify();
    } catch (error) {
      logEmailFailure({
        title: payload.title,
        error
      });

      throw new Error(getFriendlyEmailDeliveryMessage(error));
    }
  }

  let sentCount = 0;
  let failedCount = 0;

  for (const recipient of payload.recipients) {
    try {
      await transporter.sendMail({
        from: config.from,
        to: recipient,
        subject: payload.title,
        text: buildEmailText(payload),
        html: buildEmailHtml(payload)
      });

      sentCount += 1;
    } catch (error) {
      failedCount += 1;
      logEmailFailure({
        recipient,
        title: payload.title,
        error
      });
    }
  }

  return {
    sentCount,
    failedCount,
    warning:
      failedCount > 0
        ? `Some notification emails could not be delivered. ${failedCount} recipient${
            failedCount === 1 ? "" : "s"
          } failed.`
        : null
  };
}

export function getFriendlyEmailDeliveryMessageForAdmin(error: unknown) {
  return getFriendlyEmailDeliveryMessage(error);
}
