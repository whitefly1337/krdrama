import { Shield, Mail, Calendar } from "lucide-react";

const SECTIONS = [
  {
    id: "introduction",
    title: "1. Introduction",
    body: [
      "Welcome to RKDrama (\"we\", \"us\", or \"our\"). We are committed to protecting your privacy and ensuring that your personal data is handled in a safe and responsible manner.",
      "This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services. Please read this policy carefully.",
    ],
  },
  {
    id: "information-collection",
    title: "2. Information We Collect",
    body: [
      "We collect the following types of information:",
    ],
    list: [
      "Account Information: Email address, username, and password when you register.",
      "Usage Data: Information about how you interact with the app, including episodes watched, bookmarks, and preferences.",
      "Device Information: Device type, operating system version, unique identifiers, and IP address.",
      "Payment Information: Subscription details processed securely through Apple App Store and Google Play Billing. We do not store your full payment card details.",
      "Coins & Rewards: Data related to your virtual coin balance and reward history.",
    ],
  },
  {
    id: "use-of-information",
    title: "3. How We Use Your Information",
    body: [
      "We use the collected information for the following purposes:",
    ],
    list: [
      "To provide and maintain the RKDrama service, including streaming content and episode access.",
      "To manage your account, subscription, and virtual coin balance.",
      "To personalize your experience and provide content recommendations.",
      "To send important notifications about your subscription, account, or policy updates.",
      "To detect, prevent, and address technical issues, fraud, or security violations.",
      "To comply with legal obligations and protect our rights.",
    ],
  },
  {
    id: "data-sharing",
    title: "4. Sharing Your Information",
    body: [
      "We do not sell your personal data. We may share your information with:",
    ],
    list: [
      "Service Providers: Third parties that help us operate the app (e.g., hosting, analytics, advertising networks like Google AdMob).",
      "Payment Processors: Apple App Store and Google Play Billing for subscription management.",
      "Legal Authorities: When required by law, court order, or to protect our rights and safety.",
    ],
  },
  {
    id: "data-retention",
    title: "5. Data Retention",
    body: [
      "We retain your personal data for as long as your account is active or as needed to provide our services. Subscription records are kept for the duration of your subscription plus a reasonable period for legal compliance. You may request deletion of your data at any time.",
    ],
  },
  {
    id: "data-security",
    title: "6. Data Security",
    body: [
      "We implement appropriate technical and organizational measures to protect your personal data, including encrypted data transmission, secure storage, and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    id: "your-rights",
    title: "7. Your Privacy Rights",
    body: [
      "Depending on your location, you may have the following rights:",
    ],
    list: [
      "Access: Request a copy of your personal data.",
      "Rectification: Request correction of inaccurate data.",
      "Erasure: Request deletion of your personal data (\"right to be forgotten\").",
      "Restriction: Request that we limit the processing of your data.",
      "Portability: Request transfer of your data to another service.",
      "Withdrawal: Withdraw consent to data processing at any time.",
    ],
  },
  {
    id: "childrens-privacy",
    title: "8. Children's Privacy",
    body: [
      "RKDrama is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such data, please contact us and we will promptly delete it.",
    ],
  },
  {
    id: "cookies",
    title: "9. Cookies and Tracking",
    body: [
      "Our mobile app does not use traditional browser cookies. However, we may use SDKs and similar technologies from third-party providers (such as analytics and advertising partners) that collect device identifiers to provide and improve our services.",
    ],
  },
  {
    id: "changes",
    title: "10. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy within the app or by sending a notification. The effective date at the top of this page indicates when the policy was last revised.",
    ],
  },
  {
    id: "contact",
    title: "11. Contact Us",
    body: [
      "If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us at:",
    ],
    contact: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <img
              src="https://media.base44.com/images/public/6ab13de4fcc06756b5a8ee60/052a5f509_rkdrama.JPG"
              alt="RKDrama"
              className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/30"
            />
            <div>
              <h1 className="text-lg font-bold leading-none text-foreground">RKDrama</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">Privacy Policy</p>
            </div>
          </div>
          <a
            href="mailto:support@rkdrama.app"
            className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/20"
          >
            <Mail className="h-3.5 w-3.5" />
            Contact
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pt-12 pb-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 ring-1 ring-primary/20">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mt-5 text-3xl font-bold text-foreground">Privacy Policy</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Your privacy matters to us. This policy explains what data we collect and how we use it.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Last updated: September 24, 2026
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-5 pb-20">
        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              <h3 className="text-lg font-bold text-foreground">{section.title}</h3>
              <div className="mt-3 space-y-3">
                {section.body?.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
                {section.list && (
                  <ul className="space-y-2">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.contact && (
                  <div className="rounded-2xl bg-secondary p-5">
                    <a
                      href="mailto:support@rkdrama.app"
                      className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      support@rkdrama.app
                    </a>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-3xl px-5 py-8 text-center">
          <img
            src="https://media.base44.com/images/public/6ab13de4fcc06756b5a8ee60/052a5f509_rkdrama.JPG"
            alt="RKDrama"
            className="mx-auto h-10 w-10 rounded-full object-cover"
          />
          <p className="mt-3 text-xs text-muted-foreground">
            © 2026 RKDrama. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}