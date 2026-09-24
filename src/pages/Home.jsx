import { Shield, Mail, Calendar } from "lucide-react";

const SECTIONS = [
  {
    id: "information-we-collect",
    title: "1. Information we collect",
    subsections: [
      {
        subtitle: "1.1 Account information",
        list: [
          "Guest account. When you open the App, we create an anonymous guest account with a random user ID so your coins, unlocked episodes and saved series are kept on our servers. No name or email is required.",
          "Registered account. If you sign up, we collect your email address and a password (stored only in hashed form). If you sign in with Apple or Google, we receive your email address (Apple may give us a private relay address), your name if you choose to share it, and an account identifier from that provider.",
        ],
      },
      {
        subtitle: "1.2 App activity",
        list: [
          "Your coin balance and coin history (coins earned from ads and spent on episodes).",
          "Episodes you have unlocked and series you save to your list.",
          "Viewing activity: which episodes you play, how far you watch (start, 25%, 50%, 75%, end), likes and favorites.",
        ],
      },
      {
        subtitle: "1.3 Purchases",
        paragraphs: [
          "VIP subscriptions are sold through Apple's App Store. We receive your subscription status, product, purchase and expiry dates and transaction identifiers. We never receive your payment card details; Apple processes all payments.",
        ],
      },
      {
        subtitle: "1.4 Device and advertising information",
        list: [
          "Device information such as device model, operating system version, language, IP address and app version, which our service providers use to deliver content and ads.",
          "Your device's advertising identifier (IDFA), only if you allow tracking in the App Tracking Transparency prompt. You can change this at any time in iOS Settings → Privacy & Security → Tracking.",
          "Information about ads you watch, including whether you completed a rewarded ad.",
        ],
      },
    ],
  },
  {
    id: "how-we-use-information",
    title: "2. How we use information",
    list: [
      "To create and maintain your account and keep your coins, unlocks and list across sessions and devices.",
      "To stream episodes and show you the catalog in your language.",
      "To credit coins for rewarded ads, unlock episodes and provide VIP access.",
      "To show ads, including personalized ads if you have consented.",
      "To prevent fraud and abuse, for example verifying that an ad reward is genuine and enforcing daily limits.",
      "To respond to support requests and send service emails such as sign-in codes and password resets.",
      "To comply with legal obligations.",
    ],
    paragraphs: [
      "We do not sell your personal information for money.",
    ],
  },
  {
    id: "service-providers",
    title: "3. Service providers we share information with",
    paragraphs: [
      "We share information only with providers that help us run the App:",
    ],
    list: [
      "Supabase — hosting of our database, authentication and server functions (servers in the European Union, Ireland). Stores your account, coins, unlocks and list.",
      "HuntShorts.AI — provides the drama catalog and video playback. Receives a device or user identifier, your content language, viewing activity, likes and favorites.",
      "Google AdMob — shows rewarded ads and confirms ad rewards to our server. Receives device information, ad interactions, our user ID for reward verification and, if you allow tracking, your advertising identifier.",
      "RevenueCat and Apple — process and manage in-app subscriptions.",
      "Apple and Google — only if you choose Sign in with Apple or Google.",
      "Email delivery provider — sends sign-in codes and account emails.",
    ],
    paragraphsAfter: [
      "We may also disclose information if required by law, to protect our rights or users' safety, or as part of a merger or sale of our business.",
    ],
  },
  {
    id: "advertising-and-your-choices",
    title: "4. Advertising and your choices",
    list: [
      "Tracking. The App asks for permission before accessing your advertising identifier. If you decline, you still receive ads, but they are not personalized using that identifier.",
      "Consent in the EEA, UK and Switzerland. We show a consent message from Google before personalized ads are used. You can change or withdraw your choice at any time in Profile → Ad & data settings.",
      "VIP subscribers are not shown ads.",
    ],
  },
  {
    id: "data-retention",
    title: "5. Data retention",
    paragraphs: [
      "We keep your account information while your account exists. When you delete your account, we delete your account, coins, unlocked episodes and saved list from our database. Service providers may keep limited records for a short period as their own policies and the law require, for example Apple's purchase records and backups that are overwritten on a rolling schedule.",
    ],
  },
  {
    id: "deleting-your-account",
    title: "6. Deleting your account",
    paragraphs: [
      "You can delete your account at any time in the App: Profile → Delete account. If you signed in with Apple, we also revoke the App's access to your Apple ID. Deleting your account does not cancel an App Store subscription; cancel it in your Apple ID settings. You can also ask us to delete your data by emailing support@rkdrama.com with the user ID shown in your Profile.",
    ],
  },
  {
    id: "your-rights",
    title: "7. Your rights",
    paragraphs: [
      "Depending on where you live, you may have the right to access, correct, delete or export your personal information, to object to or restrict certain processing, and to withdraw consent at any time.",
    ],
    list: [
      "EEA, UK and Switzerland (GDPR). We process your information to provide the service you request (contract), for fraud prevention and service improvement (legitimate interests), for personalized ads (your consent), and to meet legal obligations. You may complain to your local data protection authority.",
      "California (CCPA/CPRA). You may request to know and delete your personal information. Sharing an advertising identifier for personalized ads may be considered \"sharing\" under California law; you can opt out by declining tracking in the App or in iOS Settings. We will not discriminate against you for exercising your rights.",
    ],
    paragraphsAfter: [
      "To make a request, email support@rkdrama.com with your user ID.",
    ],
  },
  {
    id: "international-transfers",
    title: "8. International transfers",
    paragraphs: [
      "Our service providers may process information in countries other than yours, including the United States. Where required, transfers are protected by appropriate safeguards such as the European Commission's Standard Contractual Clauses.",
    ],
  },
  {
    id: "security",
    title: "9. Security",
    paragraphs: [
      "We use encryption in transit, access controls and server-side checks for coins and purchases. No method of transmission or storage is completely secure, but we work to protect your information.",
    ],
  },
  {
    id: "children",
    title: "10. Children",
    paragraphs: [
      "The App is not directed to children under 13 (or under 16 in the EEA and UK), and we do not knowingly collect their personal information. If you believe a child has given us information, contact us and we will delete it.",
    ],
  },
  {
    id: "changes-to-this-policy",
    title: "11. Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy. We will post the new version on this page with a new effective date and, for significant changes, notify you in the App.",
    ],
  },
  {
    id: "contact",
    title: "12. Contact",
    paragraphs: [
      "Email: support@rkdrama.com",
    ],
  },
];

const LOGO = "https://media.base44.com/images/public/6ab13de4fcc06756b5a8ee60/dc46cd676_ChatGPTImage24202619_07_22.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <img
              src={LOGO}
              alt="RKDrama"
              className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/30"
            />
            <div>
              <h1 className="text-lg font-bold leading-none text-foreground">RKDrama</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">Privacy Policy</p>
            </div>
          </div>
          <a
            href="mailto:support@rkdrama.com"
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
          <h2 className="mt-5 text-3xl font-bold text-foreground">RKDrama Privacy Policy</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            This Privacy Policy explains how RKDrama ("we", "us") collects, uses and shares information when you use the RKDrama mobile app and related services (the "App"). RKDrama is a streaming app for short AI-generated drama series.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Effective date: September 24, 2026
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
                {section.paragraphs?.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
                {section.subsections?.map((sub, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">{sub.subtitle}</h4>
                    {sub.paragraphs?.map((p, j) => (
                      <p key={j} className="text-sm leading-relaxed text-muted-foreground">
                        {p}
                      </p>
                    ))}
                    {sub.list && (
                      <ul className="space-y-2">
                        {sub.list.map((item, j) => (
                          <li key={j} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
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
                {section.paragraphsAfter?.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-3xl px-5 py-8 text-center">
          <img
            src={LOGO}
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