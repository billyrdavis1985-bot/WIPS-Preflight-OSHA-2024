# WIPS — Workplace Injury Prediction System

<img width="1344" height="896" alt="preview" src="https://github.com/user-attachments/assets/c47ff96d-2994-465f-ad10-ee3f8c1d345a" />

**Author:** Billy R. Davis | IRMB Research, Hudson Forge Technologies LLC
**Status:** Phase 3 Complete · Real Data Integration Pending

---

## What This Is

WIPS is an independent research program testing whether 
manufacturing facility injury risk can be predicted from 
public OSHA data and operationalized through a decision 
support system for safety managers.

This repository contains the complete research-to-prototype 
arc across four work phases — from initial validation on 
real OSHA records to a working multi-facility decision 
support interface running on synthetic data.

The system is not deployed. It is not a guarantee of safety 
outcomes. It is a probabilistic risk signal designed to 
support human decision-making, not replace it.

---

## Repository Structure


```
WIPS-Preflight-OSHA-2024/
├── phase-1-preflight/
│   └── WIPS-Preflight-OSHA-2024.ipynb
│
├── phase-2-reverse-problem/
│   └── WIPS_ReverseProblem_Analysis.ipynb
│
├── phase-2-synthetic-pipeline/
│   └── synthetic_pipeline_validation.ipynb
│
└── phase-3-decision-support/
    ├── scoring_engine.ipynb
    ├── WIPS_Floor_Dashboard_Live.jsx
    ├── WIPS_Floor_Dashboard_v2.jsx
    ├── WIPS_Director_Dashboard.jsx
    ├── WIPS_Notification_Mockup.jsx
    └── sample_data/
        ├── wips_alerts.json
        └── wips_alerts_multi.json
```

## Phase 1 — Preflight Investigation

Validation on real OSHA Injury Tracking Application data.
398,620 establishments reduced to 60,702 clean manufacturing
records. Random Forest classifier across five model versions.

### Key Findings

| Model Version | Accuracy | High Risk F1 |
|---|---|---|
| v1 Baseline (6 features) | 51% | 0.06 |
| v4 + Prior Year Trajectory | 77% | 0.59 |
| v5 + 301 Case Detail | 89% | 0.75 |
| Held-out medium facilities | — | 0.882 |

**Most important finding:** Prior year injury rate and 
trend direction account for 53% of model predictive power. 
Facilities with worsening injury trends were five times 
more likely to be high risk than stable facilities.

### Deployment Boundary

The model has validated signal for **medium manufacturing 
facilities (50–249 employees)** specifically. Performance 
degrades for very large facilities and lacks sufficient 
test data for small facilities.

### Data Leakage — Caught and Corrected

An early feature engineering version produced a false 97% 
accuracy by using injury-derived features to predict injury 
risk. This was caught, corrected, and documented as a 
lesson. The v3 onward results use only features available 
before injuries occur.

---

## Phase 2 — Reverse Problem Analysis

Inverts the original prediction question. Instead of asking 
"which facilities are high risk," asks "which facilities 
report injury rates significantly lower than their 
operational characteristics would predict."

Identifies 260 facilities reporting below expected and 328 
reporting above expected. Industry clustering revealed 
asymmetric patterns — heavy physical labor industries 
dominate below expected, food and beverage manufacturing 
dominates above expected.

**Honest limitation:** Cannot distinguish underreporting 
from legitimate safety performance using public data alone.
The analysis identifies facilities warranting deeper review 
rather than proving misconduct.

---

## Phase 2 — Synthetic Pipeline Validation

Engineering validation that the WIPS pipeline handles end-
to-end flow from data generation through model training. 
Simulates two chemical wood finishing facility profiles 
(NAICS 325510) — one well-run and one elevated-risk — and 
runs them through the same Random Forest architecture as 
the preflight.

**Engineering scope:** Pipeline architecture validation, 
not research validation. A model trained on synthetic data 
proves nothing about real-world performance. The exercise 
confirms the pipeline runs cleanly end to end.

---

## Phase 3 — Decision Support Layer

Production-pattern interfaces demonstrating what WIPS would 
look like in deployment. Built and tested against real 
scoring engine output running on synthetic facility data.

### Components

**Scoring Engine** — Python notebook that aggregates 
facility data by zone and time window, calculates 
composite risk scores, identifies Risk × Recency outliers, 
generates SHAP-style factor attribution, and outputs JSON 
alerts in the dashboard format.

**WIPS Floor Dashboard (Live)** — React interface for the 
safety manager view. Reads live JSON from the scoring 
engine and displays ranked alerts with contributing 
factors, risk delta visualization, and recommended actions.

**WIPS Floor Dashboard v2** — Adds full workflow state 
management. Acknowledge alerts (stays visible with 
timestamp), Investigate (schedule with due date), Dismiss 
(required reason picker with five preset options). State 
persists via browser localStorage.

**WIPS Director Dashboard** — Corporate multi-facility 
view. Aggregates risk across multiple plants, ranks 
facilities by risk score, drills into any plant for full 
alert detail. Tested with three-plant synthetic data.

**WIPS Notify** — Notification system mockup demonstrating 
email and push templates for each alert tier. Includes 
timing rules (Critical immediate, Caution morning batch, 
Watch pre-shift digest), recipient routing logic, and 
delivery log simulation. No actual notifications sent.

### Design Principles

- **Risk × Recency ranking** — Surfaces zones with recent 
  change, not just zones with high absolute risk
- **Five alert maximum** — Hard cap prevents alert fatigue, 
  which was identified as the primary failure mode
- **SHAP attribution per alert** — Every flag explains 
  itself rather than relying on a black box
- **Confidence display** — Each alert shows model 
  confidence so users can weight system signals against 
  their own judgment

---

## Important Limitations

These apply to every phase of the work:

- The model **classifies historical patterns**. It does not 
  predict future risk in real time.
- The 301 case detail data covers only **18% of 
  establishments** and is biased toward larger facilities.
- Performance on **company-specific private data is unknown**.
- The medium facility result (F1=0.882) is **preliminary** — 
  102 test records with 19 high-risk cases is promising, 
  not confirmed.
- Phase 3 dashboards run on **synthetic data**. They 
  demonstrate the architecture but do not validate 
  production performance.

---

## What's Next

Three honest priorities for future work:

**Real data integration** — Partner with a manufacturing 
company willing to share anonymized facility data to test 
WIPS predictions against ground truth. This is the gate 
between prototype and product.

**External validation** — Cross-reference flagged facilities 
from the reverse problem analysis against state-level OSHA 
enforcement data and workers compensation records. Partial 
validation work is underway.

**Underlying ML rigor** — Add baseline model comparison 
(Random Forest vs Neural Network vs simple prior-year-rate 
predictor), calibration curves, confidence intervals on 
small-sample findings, and cross-validation variance reporting.

---

## Multi-Model Council Review

Findings were submitted to Claude, Gemini, DeepSeek, and 
Grok independently with a direct prompt to find problems, 
not strengths. All four converged on the same core 
limitation — this system classifies historical patterns 
and does not yet predict future risk in real time. That 
finding is documented and taken seriously.

---

## Data Sources

All preflight data is publicly available from 
https://www.osha.gov/data

| File | Records | Description |
|---|---|---|
| ITA_300A_Summary_Data_2024 | 398,620 | Establishment injury totals |
| ITA_300A_Summary_Data_2023 | 65,743 | Prior year trajectory data |
| ITA_Case_Detail_Data_2024 | 688,649 | Individual incident records |

Data files are not included in this repository due to size. 
Download directly from the OSHA link above.

---

## How to Run

```python
# Preflight and reverse problem notebooks:
# 1. Download OSHA data files from https://www.osha.gov/data
# 2. Upload to Google Colab or local environment
# 3. Run cells in order

# Required packages
pip install pandas scikit-learn matplotlib seaborn

# Dashboards:
# 1. Open any .jsx file in a React environment
# 2. Upload corresponding JSON from sample_data folder
# 3. Dashboard renders with live data
```

**Environment:** Tested in Google Colab, Python 3.12

---

## Project Context

WIPS exists because workplace injuries cost the US economy 
over $170 billion annually and more than 4,500 workers die 
on the job every year. These are not abstract statistics — 
I work in these environments.

The research is conducted independently at Hudson Forge 
Technologies LLC. No institutional backing, no proprietary 
data, no funding. If WIPS reaches the scale it is designed 
toward, the concept goes open source.

---

## License

MIT License — use freely, build on it, show me where 
I am wrong.

---

## Contact

LinkedIn: Billy R. Davis | IRMB Research  
Romans 8:28 | Full Force Eternal
