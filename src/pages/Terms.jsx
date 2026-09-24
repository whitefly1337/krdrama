import { FileText, Mail, Calendar } from "lucide-react";

const SECTIONS = [
  {
    id: "eligibility",
    title: "1. Eligibility",
    paragraphs: [
      "You must be at least 13 years old (16 in the EEA and UK) to use the App. If you are under the age of majority where you live, you may use the App only with the consent of a parent or guardian. Some content may be intended for older audiences as indicated by the App's age rating.",
    ],
  },
  {
    id: "your-account",
    title: "2. Your account",
    paragraphs: [
      "You can use the App as a guest or create an account. You are responsible for keeping your sign-in details secure and for activity under your account. Guest data is tied to your device; if you delete the App or sign out without creating an account, you may lose your coins, unlocked episodes and saved list. You can delete your account at any time in Profile → Delete account.",
    ],
  },
  {
    id: "content",
    title: "3. Content",
    paragraphs: [
      "The App offers short drama series, many of which are created with artificial intelligence. All stories, characters and events are fictional, and any resemblance to real persons or events is coincidental. Content is provided by us and our content partners and is licensed to you for personal, non-commercial viewing in the App only. You may not download (except where the App allows), copy, record, redistribute, publicly perform or sell any content. The catalog may change, and episodes or series may be removed at any time.",
    ],
  },
  {
    id: "coins",
    title: "4. Coins",
    list: [
      "Coins are a virtual in-app item used to unlock episodes. You can earn coins, for example by watching rewarded ads, and spend them in the App. Current amounts are shown in the App.",
      "Coins have no monetary value. They are not money or property, cannot be exchanged for cash, goods or anything outside the App, cannot be transferred or sold to another person, and are not refundable, except where the law requires otherwise.",
      "We grant you a limited, revocable license to use coins in the App. We may change how coins are earned or spent, including rewards per ad and daily limits. Unused coins are lost if your account is deleted or terminated.",
      "An episode unlocked with coins gives you access to that episode in the App for as long as it remains in our catalog.",
    ],
  },
  {
    id: "vip-subscription",
    title: "5. VIP subscription",
    list: [
      "VIP gives access to all episodes without coins and without ads while it is active. Available plans and prices are shown in the App before purchase.",
      "Payment is charged to your Apple ID at confirmation of purchase. Subscriptions renew automatically unless auto-renew is turned off at least 24 hours before the end of the current period. Your account is charged for renewal within 24 hours before the end of the current period, at the then-current price.",
      "You can manage or cancel your subscription in your Apple ID account settings. Deleting the App or your account does not cancel a subscription.",
      "If a free trial is offered, any unused part of it is forfeited when you purchase a subscription.",
      "All payments are processed by Apple. Refund requests are handled by Apple under its policies; we cannot issue refunds for App Store purchases.",
    ],
  },
  {
    id: "advertising",
    title: "6. Advertising",
    paragraphs: [
      "The App shows ads, including optional rewarded ads that give you coins. Rewards are credited only after the ad network confirms that you completed the ad, and daily limits apply. Using automated means, emulators, modified apps or other tricks to obtain rewards is prohibited.",
    ],
  },
  {
    id: "acceptable-use",
    title: "7. Acceptable use",
    paragraphs: ["You agree not to:"],
    list: [
      "copy, modify, reverse engineer or create derivative works of the App, except as allowed by law;",
      "circumvent paywalls, content protection, coin or ad limits, or other security features;",
      "use bots, scripts or fake accounts, or exploit bugs to gain coins, episodes or VIP access;",
      "use the App for any unlawful purpose or in a way that harms us, other users or our partners.",
    ],
    paragraphsAfter: [
      "If you find a bug that gives unintended benefits, please report it to us. We may remove coins, unlocks or access obtained in violation of these Terms.",
    ],
  },
  {
    id: "suspension-and-termination",
    title: "8. Suspension and termination",
    paragraphs: [
      "We may suspend or terminate your access if you violate these Terms or if required by law. You may stop using the App and delete your account at any time. Sections that by their nature should survive termination (including 4, 9, 10 and 11) will survive.",
    ],
  },
  {
    id: "disclaimer",
    title: "9. Disclaimer",
    paragraphs: [
      "The App and all content are provided \"as is\" and \"as available\", without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose and non-infringement, to the fullest extent permitted by law. We do not guarantee that the App will be uninterrupted, error-free or that any content will remain available.",
    ],
  },
  {
    id: "limitation-of-liability",
    title: "10. Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, we will not be liable for any indirect, incidental, special, consequential or punitive damages, or for loss of data, coins or content. Our total liability for any claim relating to the App is limited to the amount you paid us in the 12 months before the claim, or USD 50 if greater. Nothing in these Terms limits liability that cannot be limited under applicable law, including your statutory rights as a consumer.",
    ],
  },
  {
    id: "changes-to-these-terms",
    title: "11. Changes to these Terms",
    paragraphs: [
      "We may update these Terms. We will post the new version on this page with a new effective date and, for significant changes, notify you in the App. If you keep using the App after changes take effect, you accept the updated Terms.",
    ],
  },
  {
    id: "governing-law-and-disputes",
    title: "12. Governing law and disputes",
    paragraphs: [
      "Nothing in these Terms deprives you of the protection of the mandatory consumer laws of the country where you live, and you may bring claims in your local courts. Before bringing a claim, please contact us at support@rkdrama.com so we can try to resolve the issue informally.",
    ],
  },
  {
    id: "apple-app-store-terms",
    title: "13. Apple App Store terms",
    paragraphs: ["If you downloaded the App from Apple's App Store, the following also applies:"],
    list: [
      "These Terms are between you and us only, not with Apple Inc. (\"Apple\"). We, not Apple, are solely responsible for the App and its content.",
      "Your license to use the App is limited to a non-transferable license to use it on Apple-branded products that you own or control, as permitted by the Usage Rules in the Apple Media Services Terms and Conditions.",
      "Apple has no obligation to provide any maintenance or support services for the App.",
      "If the App fails to conform to any applicable warranty, you may notify Apple, and Apple will refund the purchase price of the App, if any. To the maximum extent permitted by law, Apple has no other warranty obligation with respect to the App.",
      "We, not Apple, are responsible for addressing any claims by you or a third party relating to the App, including product liability claims, claims that the App fails to conform to legal or regulatory requirements, and claims under consumer protection, privacy or similar laws.",
      "If a third party claims that the App or your use of it infringes their intellectual property rights, we, not Apple, are responsible for the investigation, defense, settlement and discharge of that claim.",
      "You represent that you are not located in a country subject to a U.S. Government embargo or designated as a \"terrorist supporting\" country, and that you are not on any U.S. Government list of prohibited or restricted parties.",
      "You must comply with any applicable third-party terms when using the App.",
      "Apple and its subsidiaries are third-party beneficiaries of these Terms, and upon your acceptance Apple will have the right to enforce these Terms against you as a third-party beneficiary.",
    ],
  },
  {
    id: "contact",
    title: "14. Contact",
    paragraphs: ["Questions, complaints or claims about the App:"],
    contact: true,
  },
];

const LOGO = "https://media.base44.com/images/public/6ab13de4fcc06756b5a8ee60/dc46cd676_ChatGPTImage24202619_07_22.png";

export default function Terms() {
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
              <p className="mt-0.5 text-xs text-muted-foreground">Terms of Use</p>
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
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mt-5 text-3xl font-bold text-foreground">RKDrama Terms of Use</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            These Terms of Use ("Terms") are an agreement between you and RKDrama ("we", "us") and govern your use of the RKDrama mobile app and related services (the "App"). By downloading or using the App you agree to these Terms and to our Privacy Policy.
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
                {section.contact && (
                  <div className="rounded-2xl bg-secondary p-5">
                    <a
                      href="mailto:support@rkdrama.com"
                      className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      support@rkdrama.com
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