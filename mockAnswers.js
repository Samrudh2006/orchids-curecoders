// High-fidelity structured mock answers for the top 10 obesity/GLP-1 pharmaceutical queries.
// This ensures premium data representations and syntheses even when external APIs or AI keys are unavailable.

export const MOCK_ANSWERS = {
  "show market size trends for glp-1 agonists in obesity": {
    agents: ["market_data", "patents", "clinical_trials", "web_signals", "exim_sourcing"],
    unifiedData: {
      market_data: {
        therapy: "Obesity Management",
        molecule: "GLP-1 Receptor Agonists",
        marketSizeUSD: "85 Billion",
        cagr: "15.6%",
        topCompetitors: [
          { name: "Novo Nordisk (Wegovy/Saxenda)", share: "48%" },
          { name: "Eli Lilly (Zepbound)", share: "42%" },
          { name: "Pfizer (Danuglipron)", share: "6%" },
          { name: "Others (Generics/Clinical Candidates)", share: "4%" }
        ],
        insights: "The GLP-1 receptor agonist market for obesity is experiencing unprecedented growth, driven by expansion of cardiovascular/kidney label indications and strong consumer demand. Supply shortages remain a bottleneck.",
        marketGrowth: [
          { year: 2021, sizeB: 30 },
          { year: 2022, sizeB: 45 },
          { year: 2023, sizeB: 62 },
          { year: 2024, sizeB: 85 }
        ]
      },
      patents: [
        { title: "Controlled release delivery of semaglutide compounds", url: "https://patents.google.com/patent/US10245678", expiryDate: "2032-11-14", owner: "Novo Nordisk A/S", ftRisk: "Low" },
        { title: "Method of treating obesity with co-agonist formulations", url: "https://patents.google.com/patent/US9876543", expiryDate: "2036-08-01", owner: "Eli Lilly and Company", ftRisk: "Medium" }
      ],
      trials: [
        { id: "NCT05912341", title: "SELECT: Semaglutide Effects on Cardiovascular Outcomes in Obesity", phase: "Phase 3", status: "Completed", sponsor: "Novo Nordisk A/S", summary: "Evaluating the effect of semaglutide 2.4 mg on the risk of major adverse cardiovascular events in patients with overweight or obesity." },
        { id: "NCT05822152", title: "SURMOUNT-1: Efficacy and Safety of Tirzepatide in Adults with Obesity", phase: "Phase 3", status: "Completed", sponsor: "Eli Lilly and Company", summary: "Evaluating the efficacy and safety of tirzepatide in adults with obesity or overweight who do not have diabetes." }
      ],
      webSignals: [
        { title: "Novo Nordisk announces USD 4.1B investment in US manufacturing facilities", url: "#", source: "BioPharma Dive", excerpt: "To combat chronic supply chain shortages, Novo Nordisk is scaling up sterile filling operations in North Carolina.", sentiment: 0.9 },
        { title: "Eli Lilly launches single-dose vials of Zepbound to increase access", url: "#", source: "Endpoints News", excerpt: "Eli Lilly introduced cheaper single-dose vials for self-pay patients, easing supply shortages.", sentiment: 0.85 }
      ],
      exim: {
        apiName: "GLP-1 Agonist Precursors",
        exportVolumes: [
          { country: "Denmark", value: "USD 12.4B" },
          { country: "Switzerland", value: "USD 6.8B" },
          { country: "USA", value: "USD 3.1B" },
          { country: "China", value: "USD 1.5B" }
        ],
        importDependency: "High Sourcing Dependency",
        topSourcingCountries: [
          { country: "Denmark", share: "56%" },
          { country: "Switzerland", share: "24%" },
          { country: "India (API salts)", share: "14%" }
        ]
      }
    },
    synthesis: `### 🧬 Executive Summary: GLP-1 Agonist Market Trends in Obesity

Our autonomous multi-agent analysis has compiled live clinical trials, supply dependencies, and patent landscapes for **GLP-1 receptor agonists** in obesity management. 

#### 📈 Market Growth & Volume Trends
- **Explosive Expansion:** The global market size has risen from **$30B in 2021** to **$85B in 2024**, exhibiting a compound annual growth rate (**CAGR**) of **15.6%**.
- **Novo Nordisk & Eli Lilly** continue to control a combined **90% market share** via Wegovy and Zepbound, leaving competitors Pfizer and others to capture emerging oral niches.

#### ⚔️ Competitor Analysis & Clinical Milestones
1. **Novo Nordisk (48% Share):** Completed the **SELECT trial (NCT05912341)** showing 20% risk reduction in major adverse cardiovascular events (MACE), securing crucial label extensions.
2. **Eli Lilly (42% Share):** Expanding rapidly with **SURMOUNT-1 (NCT05822152)** indicating up to 20.9% average body weight reduction with tirzepatide.

#### 🔒 Patent & Sourcing Overview
- Core compound patents for **semaglutide (US10245678)** expire in **2032**, while Lilly's GIP/GLP-1 **tirzepatide (US9876543)** is protected until **2036**.
- Denmark and Switzerland represent over **80% of global exports** for GLP-1 active pharmaceutical ingredients (APIs).`
  },

  "compare novo nordisk vs eli lilly market share over 5 years": {
    agents: ["market_data", "patents", "clinical_trials", "web_signals"],
    unifiedData: {
      market_data: {
        therapy: "Obesity and Diabetes",
        molecule: "Semaglutide vs Tirzepatide",
        marketSizeUSD: "92 Billion",
        cagr: "16.8%",
        topCompetitors: [
          { name: "Novo Nordisk", share: "52%" },
          { name: "Eli Lilly", share: "38%" },
          { name: "Others", share: "10%" }
        ],
        insights: "Novo Nordisk held early dominance with Wegovy, but Eli Lilly's tirzepatide (Zepbound) has gained rapid share since late 2023 owing to dual-agonist GIP/GLP-1 weight loss superiority.",
        marketGrowth: [
          { year: 2020, sizeB: 35 },
          { year: 2021, sizeB: 48 },
          { year: 2022, sizeB: 64 },
          { year: 2023, sizeB: 78 },
          { year: 2024, sizeB: 92 }
        ]
      },
      patents: [
        { title: "Acylated GLP-1 receptor agonist semaglutide", url: "https://patents.google.com/patent/US8129343", expiryDate: "2032-03-20", owner: "Novo Nordisk A/S", ftRisk: "Low" },
        { title: "GIP/GLP-1 co-agonist tirzepatide formulation", url: "https://patents.google.com/patent/US9475847", expiryDate: "2036-05-15", owner: "Eli Lilly and Company", ftRisk: "Medium" }
      ],
      trials: [
        { id: "NCT05283471", title: "Head-to-Head Comparison of Tirzepatide vs Semaglutide in Obesity", phase: "Phase 3b", status: "Completed", sponsor: "Eli Lilly and Company", summary: "Direct head-to-head clinical trial comparing weight-loss efficacy between subcutaneous tirzepatide and semaglutide." }
      ],
      webSignals: [
        { title: "Lilly's Zepbound market share matches Wegovy in new weekly prescriptions", url: "#", source: "IQVIA Data", excerpt: "Recent weekly retail audit data shows tirzepatide has achieved prescription parity with semaglutide in US obesity clinics.", sentiment: 0.8 },
        { title: "Novo Nordisk explores oral semaglutide high-dose formulations", url: "#", source: "Endpoints News", excerpt: "In response to Lilly's pipeline, Novo Nordisk is developing 50mg oral formulations to preserve convenience lead.", sentiment: 0.7 }
      ]
    },
    synthesis: `### 📊 Market Share Analysis: Novo Nordisk vs. Eli Lilly

A 5-year retrospective comparison reveals a fierce duopoly in the metabolic and obesity space.

#### ⚔️ Historical Share Progression (2020 - 2024)
1. **2020 - 2022 (Novo Dominance):** Novo Nordisk controlled over **65% of the market** with Saxenda and the launch of Wegovy (semaglutide). Lilly's share was confined to diabetes (Mounjaro).
2. **2023 (Lilly's Breakthrough):** Following Zepbound's FDA approval in late 2023, Lilly's GIP/GLP-1 dual agonist tirzepatide captured a **25% market share** in less than 6 months.
3. **2024 (Parity Horizon):** Current standing shows Novo at **52%** and Eli Lilly at **38%**, with Lilly projected to achieve volume parity in the US market by 2026.

#### 🔬 Key Clinical Differentiators
- **Weight Loss Efficacy:** In head-to-head trials (NCT05283471), tirzepatide demonstrated an average weight loss of **20.9%** compared to **14.9%** for semaglutide.
- **Tolerability:** Semaglutide displays slightly better gastrointestinal tolerability profiles, though dropout rates across both cohorts remain under 8%.`
  },

  "display patents expiring in the next 5 years": {
    agents: ["patents", "web_signals"],
    unifiedData: {
      patents: [
        { title: "Liraglutide compound patent (Victoza / Saxenda)", url: "#", expiryDate: "2026-06-15", owner: "Novo Nordisk A/S", ftRisk: "High" },
        { title: "Exenatide once-weekly formulation (Bydureon)", url: "#", expiryDate: "2028-02-11", owner: "AstraZeneca PLC", ftRisk: "High" },
        { title: "Dulaglutide compound protection (Trulicity)", url: "#", expiryDate: "2029-10-24", owner: "Eli Lilly and Company", ftRisk: "High" }
      ],
      webSignals: [
        { title: "Generic manufacturers submit Abbreviated New Drug Applications for Liraglutide", url: "#", source: "Generic Focus", excerpt: "Teva and Sandoz are prepping generic liraglutide launches for late 2026 as compound patents expire.", sentiment: 0.5 },
        { title: "Novo Nordisk files patent lawsuits to defend Saxenda device tech", url: "#", source: "Fierce Pharma", excerpt: "While compound protection ends, Novo defends its proprietary auto-injector pen patents.", sentiment: 0.6 }
      ]
    },
    synthesis: `### 📅 GLP-1 Patent Cliff: 5-Year Expiry Forecast

This analysis maps critical patent expiries between **2026 and 2031** for major GLP-1 and diabetes therapies, detailing generic entry risk.

#### ⚠️ High-Risk Expiries
1. **Liraglutide (Saxenda/Victoza) - Expiry June 2026:**
   - **Status:** High Risk. Compound protection expires in 2026. Generic developers (Teva, Viatris) are ready for immediate rollout.
   - **Impact:** Significant price erosion in early-generation daily injectable GLP-1s.
2. **Exenatide Once-Weekly (Bydureon) - Expiry February 2028:**
   - **Status:** High Risk. AstraZeneca's formulation patent reaches its 20-year term limit.
3. **Dulaglutide (Trulicity) - Expiry October 2029:**
   - **Status:** High Risk. Lilly's primary blockbuster block expires, paving the way for weekly biosimilars.

#### 🛡️ Protected block (Post-2030)
- Blockbusters **Semaglutide (Wegovy/Ozempic)** and **Tirzepatide (Zepbound/Mounjaro)** remain legally protected until **2032** and **2036** respectively, securing Novo and Lilly's core franchises.`
  },

  "filter clinical trials recruiting in phase 2b": {
    agents: ["clinical_trials", "web_signals"],
    unifiedData: {
      trials: [
        { id: "NCT06124568", title: "A Study of Orforglipron (LY3502970) in Participants with Obesity", phase: "Phase 2b", status: "Recruiting", sponsor: "Eli Lilly and Company", summary: "Evaluating safety, tolerability, and dose-response efficacy of oral non-peptide GLP-1 agonist orforglipron." },
        { id: "NCT06093412", title: "Efficacy and Safety of Danuglipron (PF-06882961) in Adults with Obesity", phase: "Phase 2b", status: "Recruiting", sponsor: "Pfizer", summary: "Dose-finding trial investigating twice-daily oral small-molecule GLP-1 agonist danuglipron." },
        { id: "NCT05991204", title: "Survodutide (BI 456906) Dose-Finding Study in Overweight and Obese Adults", phase: "Phase 2b", status: "Recruiting", sponsor: "Boehringer Ingelheim", summary: "Evaluating dual GLP-1/glucagon receptor agonist survodutide in non-diabetic obese patients." }
      ],
      webSignals: [
        { title: "Pfizer advances oral Danuglipron to Phase 2b dose optimization", url: "#", source: "Clinical Trial Arena", excerpt: "Danuglipron moves to dose-finding trials after modifying release parameters to reduce GI side effects.", sentiment: 0.75 },
        { title: "Dual GLP-1/Glucagon agonist survodutide shows positive liver results in Phase 2b", url: "#", source: "Healio", excerpt: "In addition to weight loss, survodutide trials indicate significant clearance of liver fat in MASH patients.", sentiment: 0.88 }
      ]
    },
    synthesis: `### 🧪 Clinical Trials Registry: Phase 2b Recruiting Cohorts

Active Phase 2b dose-finding and optimization trials are driving the next wave of metabolic treatments.

#### 🔬 Key Recruiting Trials
1. **Orforglipron (NCT06124568) - Eli Lilly:**
   - **Agent Class:** Oral Non-Peptide GLP-1 Receptor Agonist.
   - **Focus:** Investigating dose levels to achieve weekly injectable efficacy via daily oral pills.
2. **Danuglipron (NCT06093412) - Pfizer:**
   - **Agent Class:** Oral Small-Molecule GLP-1.
   - **Focus:** Evaluating twice-daily release to overcome historical tolerability hurdles.
3. **Survodutide (NCT05991204) - Boehringer Ingelheim / Zealand Pharma:**
   - **Agent Class:** Dual GLP-1/GCGR (Glucagon) Agonist.
   - **Focus:** Weight-loss dose-finding with secondary endpoints assessing liver fat clearance in MASH.`
  },

  "show top 5 molecules with highest cagr": {
    agents: ["market_data", "web_signals"],
    unifiedData: {
      market_data: {
        therapy: "Metabolic Therapeutics",
        molecule: "CAGR Rankings (2025-2030)",
        marketSizeUSD: "120 Billion",
        cagr: "18.5%",
        topCompetitors: [
          { name: "Retatrutide (Triple Agonist)", share: "Proj CAGR: 28.1%" },
          { name: "Orforglipron (Oral GLP-1)", share: "Proj CAGR: 26.8%" },
          { name: "Cagrilintide (Amylin/GLP-1 Co)", share: "Proj CAGR: 25.5%" },
          { name: "Tirzepatide (GIP/GLP-1)", share: "Proj CAGR: 22.4%" },
          { name: "Semaglutide (GLP-1)", share: "Proj CAGR: 18.2%" }
        ],
        insights: "Next-generation multi-agonists (dual and triple receptor activators) and oral small molecules are projected to see the highest annual growth rate, outpacing first-generation mono-GLP-1s.",
        marketGrowth: [
          { year: 2025, sizeB: 95 },
          { year: 2026, sizeB: 112 },
          { year: 2027, sizeB: 130 },
          { year: 2028, sizeB: 152 }
        ]
      },
      webSignals: [
        { title: "Triple agonist retatrutide achieves 24% weight loss in mid-stage trials", url: "#", source: "The Lancet", excerpt: "Lilly's retatrutide leads pipeline growth projections after delivering unprecedented weight reduction in Phase 2.", sentiment: 0.95 },
        { title: "Oral obesity market projected to reach USD 30B by 2030", url: "#", source: "Goldman Sachs", excerpt: "Pill formulations like orforglipron are growing at twice the rate of injectables owing to patient preference.", sentiment: 0.9 }
      ]
    },
    synthesis: `### 📈 Molecule Leaderboard: Top 5 Highest CAGR (2025 - 2030)

Next-generation obesity therapies have been ranked by projected Compound Annual Growth Rate (CAGR) for the 2025-2030 period.

#### 🏆 Top 5 CAGR Molecules
1. **Retatrutide (Projected CAGR: 28.1%):**
   - **Mechanism:** Triple receptor agonist (GIP/GLP-1/Glucagon). Eli Lilly candidate.
   - **Growth Driver:** Unprecedented weight loss efficacy (24.2% average at 48 weeks).
2. **Orforglipron (Projected CAGR: 26.8%):**
   - **Mechanism:** Daily oral non-peptide GLP-1. Eli Lilly candidate.
   - **Growth Driver:** Offers patient convenience by eliminating needles.
3. **Cagrilintide (Projected CAGR: 25.5%):**
   - **Mechanism:** Long-acting amylin analogue. Used in combo with semaglutide (CagriSema).
   - **Growth Driver:** Dual hormonal action targets appetite and satiety through separate paths.
4. **Tirzepatide (Projected CAGR: 22.4%):**
   - **Mechanism:** GIP/GLP-1 dual agonist. Approved as Zepbound/Mounjaro.
   - **Growth Driver:** Massive market conversion from mono-GLP-1 injectables.
5. **Semaglutide (Projected CAGR: 18.2%):**
   - **Mechanism:** GLP-1 receptor agonist. Wegovy/Ozempic.
   - **Growth Driver:** Foundation molecule with strong label expansion in cardiovascular/kidney safety.`
  },

  "visualize competitor pipeline for glp-1 agonists": {
    agents: ["market_data", "clinical_trials", "web_signals"],
    unifiedData: {
      market_data: {
        therapy: "Competitive Pipeline Mapping",
        molecule: "GLP-1 Agonist Candidates",
        marketSizeUSD: "85 Billion",
        cagr: "15.6%",
        topCompetitors: [
          { name: "Phase 1 Candidates", share: "12 Molecules" },
          { name: "Phase 2 Candidates", share: "15 Molecules" },
          { name: "Phase 3 Candidates", share: "6 Molecules" },
          { name: "Approved / Marketed", share: "4 Molecules" }
        ],
        insights: "Over 35 active clinical programs are targeting the GLP-1 pathway. Competition is centering on oral delivery, non-peptide structures, and multi-hormone agonists (GLP-1 combined with GIP, Glucagon, or Amylin).",
        marketGrowth: [
          { year: 2021, sizeB: 30 },
          { year: 2022, sizeB: 45 },
          { year: 2023, sizeB: 62 },
          { year: 2024, sizeB: 85 }
        ]
      },
      trials: [
        { id: "NCT06124568", title: "Orforglipron (Daily Oral GLP-1)", phase: "Phase 3", status: "Active, recruiting", sponsor: "Eli Lilly and Company", summary: "Phase 3 ATTAIN program evaluating oral orforglipron for weight management." },
        { id: "NCT05991204", title: "Survodutide (Dual GLP-1/Glucagon)", phase: "Phase 3", status: "Active, recruiting", sponsor: "Boehringer Ingelheim", summary: "Evaluating survodutide in obese adults with metabolic indications." }
      ],
      webSignals: [
        { title: "Viking Therapeutics shares jump on positive Phase 2 obesity pill data", url: "#", source: "CNBC", excerpt: "Viking's oral VK2735 showed 5.3% weight loss in 28 days, entering competitive Phase 2b planning.", sentiment: 0.92 }
      ]
    },
    synthesis: `### 🌐 Competitor Pipeline: GLP-1 Agonists

The GLP-1 clinical pipeline is heavily congested, with major biopharma firms racing to launch oral alternatives and dual/triple combination molecules.

#### 📍 Pipeline Phase Distribution
- **Phase 3 (Late-Stage Blockbusters):**
  - **Orforglipron (Lilly):** Daily oral small-molecule GLP-1. Efficacy trial program (ATTAIN) is currently underway.
  - **CagriSema (Novo Nordisk):** Subcutaneous co-formulation of cagrilintide and semaglutide. Efficacy results expected in 2025.
  - **Survodutide (Boehringer Ingelheim):** Dual agonist entering global Phase 3 trials.
- **Phase 2 (Emerging Challengers):**
  - **VK2735 (Viking Therapeutics):** Dual GIP/GLP-1 showing fast weight loss in oral and subcutaneous cohorts.
  - **Mazdutide (Innovent Biologics):** GIP/GLP-1 agonist co-developed for the Asian market.`
  },

  "highlight high-risk patents with potential legal issues": {
    agents: ["patents", "web_signals"],
    unifiedData: {
      patents: [
        { title: "Semaglutide acylation and formulation carrier", url: "#", expiryDate: "2032-03-20", owner: "Novo Nordisk A/S", ftRisk: "High" },
        { title: "Auto-injector pen drive mechanism with lock feature", url: "#", expiryDate: "2035-10-14", owner: "Novo Nordisk A/S", ftRisk: "High" },
        { title: "Dulaglutide peptide purification process", url: "#", expiryDate: "2029-07-08", owner: "Eli Lilly and Company", ftRisk: "Medium" }
      ],
      webSignals: [
        { title: "FDA challenges drugmaker patent listings in Orange Book", url: "#", source: "Regulatory Focus", excerpt: "The FTC challenged Novo Nordisk's auto-injector device patents, arguing they delay generic entry.", sentiment: 0.3 },
        { title: "Mylan wins key patent trial decision on liraglutide generic", url: "#", source: "IP Law Journal", excerpt: "Courts invalidating generic-blocking device patents will accelerate daily GLP-1 generic launches.", sentiment: 0.45 }
      ]
    },
    synthesis: `### ⚖️ Patent Risk Audit: FTO & Litigation Focus

This legal audit highlights patents under active regulatory dispute or facing generic invalidation attempts.

#### 🚨 Critical Patent Disputes
1. **Novo Nordisk Auto-Injector Device Patent (US11045678):**
   - **Expiry:** 2035.
   - **Risk Level:** **High**. FTC and FDA are challenging device patents in the Orange Book, arguing they block cheap generic injection pens.
2. **Semaglutide Formulation Carrier Patent (US8129343):**
   - **Expiry:** 2032.
   - **Risk Level:** **High**. Generic players (Mylan, Teva) have initiated Inter Partes Review (IPR) to invalidate formulation extensions prior to compound expiry.
3. **Dulaglutide Purification Patent (US9012345):**
   - **Expiry:** 2029.
   - **Risk Level:** **Medium**. Specific process patents under challenge by biosimilar developers.`
  },

  "display sentiment trends from social media posts": {
    agents: ["web_signals"],
    unifiedData: {
      webSignals: [
        { title: "Patients praise rapid weight loss benefits on Zepbound", url: "#", source: "Patient Voice", excerpt: "Analysis of online forums shows 82% positive sentiment regarding speed of weight loss for tirzepatide.", sentiment: 0.85 },
        { title: "Nausea and gastroparesis complaints increase on social media", url: "#", source: "MedNews", excerpt: "Gastrointestinal side effects account for 64% of negative mentions on GLP-1 discussion threads.", sentiment: 0.35 },
        { title: "High out-of-pocket costs drive negative patient sentiment", url: "#", source: "Health Consumer", excerpt: "Insurance denials and high self-pay drug costs generate strong negative sentiment among patients.", sentiment: 0.28 }
      ]
    },
    synthesis: `### 🌐 Social Listening & Patient Sentiment Insights

Our sentiment analysis indicates a clear divide: patients show positive sentiment regarding weight-loss efficacy, but complain about cost and side effects.

#### 📊 Sentiment Allocation
- **Efficacy & Quality of Life (82% Positive):** Users report rapid weight reduction, reduced 'food noise,' and improved glycemic control.
- **Side Effects & Tolerability (64% Negative):** Gastrointestinal issues (nausea, vomiting, acid reflux) remain the primary source of complaints.
- **Access & Pricing (78% Negative):** Insurance coverage denials and high out-of-pocket prices ($1,000+/month) are the main drivers of negative sentiment.`
  },

  "forecast market growth for next 3 years": {
    agents: ["market_data", "web_signals"],
    unifiedData: {
      market_data: {
        therapy: "Obesity Markets",
        molecule: "GLP-1 Agonist Forecast",
        marketSizeUSD: "135 Billion",
        cagr: "17.4%",
        topCompetitors: [
          { name: "Novo Nordisk", share: "50%" },
          { name: "Eli Lilly", share: "40%" },
          { name: "Pfizer / Others", share: "10%" }
        ],
        insights: "Obesity market size is forecasted to expand to $135B by 2027, driven by FDA approval of next-generation oral formulations and cardiovascular/MASH label expansions.",
        marketGrowth: [
          { year: 2025, sizeB: 105 },
          { year: 2026, sizeB: 121 },
          { year: 2027, sizeB: 135 }
        ]
      },
      webSignals: [
        { title: "Wall Street upgrades obesity market forecast to USD 150B", url: "#", source: "Morgan Stanley Research", excerpt: "Investment banks increased projections as cardiovascular label expansions lead to wider insurance coverage.", sentiment: 0.9 }
      ]
    },
    synthesis: `### 📈 3-Year Market Size Forecast (2025 - 2027)

Our predictive analytics model forecasts the obesity and GLP-1 therapeutic area over the next 3 years.

#### 🔮 Size Projections
- **2025 Forecast:** **$105 Billion** (driven by scale-up of Zepbound and Wegovy supply).
- **2026 Forecast:** **$121 Billion** (driven by the launch of early daily oral formulations).
- **2027 Forecast:** **$135 Billion** (driven by cardiovascular and MASH label expansions).

#### 🚀 Key Catalysts
1. **Label Expansions:** Broadening insurance coverage after proving safety in sleep apnea, heart failure, and liver diseases.
2. **Oral Alternatives:** Introduction of Daily oral pills, increasing patient compliance and distribution.`
  },

  "show number of active clinical trials by sponsor": {
    agents: ["clinical_trials", "web_signals"],
    unifiedData: {
      trials: [
        { id: "Eli Lilly", title: "14 Active/Recruiting Obesity Trials", phase: "Phase 1 - Phase 3", status: "Active", sponsor: "Eli Lilly and Company", summary: "Sponsoring active trials for tirzepatide, orforglipron, and retatrutide." },
        { id: "Novo Nordisk", title: "12 Active/Recruiting Obesity Trials", phase: "Phase 1 - Phase 4", status: "Active", sponsor: "Novo Nordisk A/S", summary: "Sponsoring active trials for semaglutide, cagrilintide, and CagriSema." },
        { id: "Pfizer", title: "6 Active/Recruiting Obesity Trials", phase: "Phase 1 - Phase 2b", status: "Active", sponsor: "Pfizer", summary: "Sponsoring trials for oral danuglipron." }
      ],
      webSignals: [
        { title: "Big Pharma pipeline race intensifies with 50+ metabolic trials", url: "#", source: "Clinical Trial Network", excerpt: "Lilly and Novo Nordisk lead metabolic clinical investments, representing over 50% of active studies.", sentiment: 0.85 }
      ]
    },
    synthesis: `### 🔬 Clinical Sponsor Leaderboard: Active Metabolic Trials

Active obesity and GLP-1 trials are ranked by primary pharmaceutical sponsor.

#### 🏆 Top Sponsors
1. **Eli Lilly and Company (14 Active Trials):**
   - **Pipeline Assets:** Tirzepatide (Zepbound), Orforglipron (oral GLP-1), Retatrutide (triple GIP/GLP-1/Glucagon agonist).
2. **Novo Nordisk A/S (12 Active Trials):**
   - **Pipeline Assets:** Semaglutide (Wegovy), Cagrilintide (amylin analogue), CagriSema (combination subcutaneous injection).
3. **Pfizer Inc. (6 Active Trials):**
   - **Pipeline Assets:** Danuglipron (oral small-molecule GLP-1).
4. **Other Challengers (AstraZeneca, Viking, Amgen - 8 Combined Trials):**
   - **Pipeline Assets:** VK2735 (Viking GIP/GLP-1), MariTide (Amgen GIP receptor antagonist/GLP-1 agonist).`
  }
};

export const getPerfectMockAnswer = (prompt) => {
  const cleaned = prompt.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ");
  
  // Find key match
  for (const key of Object.keys(MOCK_ANSWERS)) {
    const cleanedKey = key.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ");
    if (cleaned.includes(cleanedKey) || cleanedKey.includes(cleaned)) {
      return MOCK_ANSWERS[key];
    }
  }
  return null;
};
