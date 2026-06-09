import type { Digest } from "./types";

// A hand-written sample digest so the reading experience can be confirmed
// before the AI compile pipeline is wired up. Replaced by real data later.
export const sampleDigest: Digest = {
  date: "2026-06-09",
  topics: [
    {
      id: "rbi-repo-rate-hold",
      title: "RBI holds repo rate at 6.5% for a fourth straight meeting",
      explainer:
        "The Reserve Bank of India kept its benchmark repo rate unchanged at 6.5%, the fourth consecutive meeting without a move. The Monetary Policy Committee cited sticky food inflation, which has kept headline CPI above the RBI's comfort zone even as core inflation has cooled. The central bank retained its 'withdrawal of accommodation' stance, signalling it is not yet ready to cut rates. Coverage across outlets agreed on the decision but differed in emphasis: the Financial Times framed it around foreign-investor caution, while the Indian Express led with the impact on home-loan EMIs for households.",
      context:
        "This is the fourth hold in a row after a long tightening cycle that lifted the repo rate from pandemic-era lows. Through 2025 the MPC repeatedly flagged food inflation — driven by uneven monsoon output and vegetable price spikes — as the main obstacle to easing. Markets had largely priced in a hold, so the bigger question was the tone of the guidance rather than the rate itself.",
      implications:
        "For households, home-loan and car-loan EMIs stay where they are for now; borrowers hoping for relief will likely have to wait until at least the next meeting. For businesses, the cost of credit remains elevated, which can weigh on capital spending. If food inflation eases with a good monsoon, analysts expect the first cut could come later in the year — but a poor monsoon or a fresh oil-price shock could push that further out.",
      glossary: [
        {
          term: "repo rate",
          definition:
            "The interest rate at which the RBI lends short-term money to commercial banks. Raising it makes borrowing costlier across the economy; cutting it does the opposite.",
        },
        {
          term: "CPI",
          definition:
            "Consumer Price Index — the main measure of retail inflation, tracking the change in prices of a basket of everyday goods and services.",
        },
        {
          term: "Monetary Policy Committee",
          definition:
            "The six-member RBI committee that sets the repo rate, balancing inflation control against economic growth.",
        },
        {
          term: "withdrawal of accommodation",
          definition:
            "A policy stance meaning the central bank is gradually removing the easy-money conditions it provided earlier, leaning towards tighter (not looser) policy.",
        },
      ],
      researched: true,
      sources: [
        {
          outlet: "Financial Times",
          headline: "India's central bank stays put as inflation lingers",
          url: "https://www.ft.com/",
        },
        {
          outlet: "Indian Express",
          headline: "RBI keeps repo rate unchanged: what it means for your EMIs",
          url: "https://indianexpress.com/",
        },
      ],
    },
    {
      id: "monsoon-forecast-revised",
      title: "IMD revises monsoon forecast upward on La Niña signals",
      explainer:
        "The India Meteorological Department nudged up its seasonal rainfall forecast, now expecting an above-normal monsoon, citing strengthening La Niña conditions in the Pacific. The Wire and Scroll both highlighted the agricultural stakes — a strong monsoon supports the kharif sowing season and rural incomes — while noting the IMD's caveat that distribution matters as much as the total: too much rain in too short a window can damage crops as badly as a deficit.",
      context:
        "India's monsoon delivers roughly three-quarters of the country's annual rainfall and is the single biggest swing factor for agriculture, reservoir levels, and rural demand. La Niña years are typically associated with stronger Indian monsoons, in contrast to El Niño years which often bring deficits. The previous season's uneven rainfall was a key driver of the food inflation the RBI keeps flagging.",
      implications:
        "A genuinely above-normal, well-distributed monsoon would ease food inflation, lift rural consumption, and give the RBI more room to eventually cut rates. But the IMD's distribution caveat is the catch — concentrated downpours or regional dry spells could still hurt specific crops. Agri-input companies, FMCG firms with rural exposure, and tractor makers are the most directly affected if the forecast holds.",
      glossary: [
        {
          term: "La Niña",
          definition:
            "A climate pattern marked by cooler-than-average Pacific Ocean temperatures, generally associated with stronger monsoon rainfall over India.",
        },
        {
          term: "IMD",
          definition:
            "India Meteorological Department — the government agency responsible for weather forecasting and issuing the official monsoon outlook.",
        },
        {
          term: "kharif",
          definition:
            "The monsoon cropping season (roughly June–October), when crops like rice, cotton, and soybean are sown and depend heavily on monsoon rains.",
        },
      ],
      researched: true,
      sources: [
        {
          outlet: "Scroll",
          headline: "IMD raises monsoon forecast: why farmers are cautiously hopeful",
          url: "https://scroll.in/",
        },
        {
          outlet: "The Wire",
          headline: "Above-normal monsoon likely, but distribution is the real test",
          url: "https://thewire.in/",
        },
      ],
    },
    {
      id: "indian-saas-slowdown",
      title: "The Ken: Indian SaaS firms hit a growth slowdown",
      explainer:
        "A deep-dive argued that several Indian software-as-a-service companies are seeing growth decelerate as global enterprise customers tighten budgets and lengthen sales cycles. The piece points to slowing net revenue retention and a shift in investor focus from pure growth toward profitability, forcing some firms to cut burn and re-price deals.",
      context:
        "Indian SaaS rode a multi-year boom selling to Western enterprises, buoyed by cheap capital and rapid digital adoption. As global interest rates rose and software budgets came under scrutiny, that tailwind faded. The current debate is whether this is a cyclical pause or a structural reset in how these companies must operate.",
      implications:
        "If the slowdown persists, expect more layoffs, slower hiring, and tougher fundraising for late-stage SaaS startups, alongside pressure to demonstrate a path to profit. For founders, the bar for the next funding round has clearly risen. For customers, vendors competing harder on price could mean better deals.",
      glossary: [
        {
          term: "SaaS",
          definition:
            "Software-as-a-Service — software sold as an ongoing subscription and delivered over the internet, rather than as a one-time licensed product.",
        },
        {
          term: "net revenue retention",
          definition:
            "A metric showing how much recurring revenue from existing customers grows or shrinks over a year, after upgrades, downgrades, and cancellations.",
        },
        {
          term: "burn",
          definition:
            "The rate at which a company spends cash in excess of what it earns — its 'cash burn'.",
        },
      ],
      researched: true,
      sources: [
        {
          outlet: "The Ken",
          headline: "The great Indian SaaS deceleration",
          url: "https://the-ken.com/",
        },
      ],
    },
  ],
};
