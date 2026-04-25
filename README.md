# WIPS Preflight — OSHA ITA 2024 Manufacturing Dataset
<img width="1344" height="896" alt="preview" src="https://github.com/user-attachments/assets/c47ff96d-2994-465f-ad10-ee3f8c1d345a" />


**Author:** Billy R. Davis | IRMB Research  
**Date:** April 2026  
**Status:** Complete — Public Data Ceiling Reached

## What This Is

A preflight investigation testing whether public OSHA 
Injury Tracking Application data contains enough signal 
to identify manufacturing facilities with elevated injury 
risk. This is a validation exercise, not a production system.

A preflight runs before committing to build something at 
scale. It tests assumptions against real data and documents 
what holds before investing hundreds of hours on a 
foundation that might not be there.

---

## Data Sources

All data is publicly available from https://www.osha.gov/data

| File | Records | Description |
|---|---|---|
| ITA_300A_Summary_Data_2024 | 398,620 | Establishment injury totals |
| ITA_300A_Summary_Data_2023 | 65,743 | Prior year trajectory data |
| ITA_Case_Detail_Data_2024 | 688,649 | Individual incident records |

**Note:** Data files are not included in this repository 
due to size. Download directly from the OSHA link above.

---

## Key Findings

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

---

## Deployment Boundary

Performance on genuinely held-out test data by facility size:

| Facility Size | Employees | High Risk F1 |
|---|---|---|
| Medium | 50–249 | 0.882 |
| Large | 250–999 | 0.767 |
| Very Large | 1000+ | 0.545 |
| Small | < 50 | Insufficient test data |

**The model has validated signal for medium manufacturing 
facilities specifically.** It does not generalize reliably 
to very large or small facilities at this stage.

---

## Important Limitations

This must be stated clearly before any use of these results:

- This system **classifies historical patterns**. It does 
  not predict future risk in real time.
- The 301 case detail data covers only **18% of 
  establishments** and is biased toward larger facilities.
- Performance on company-specific private data is **unknown**.
- The medium facility result is **preliminary** — 102 test 
  records with 19 high-risk cases is promising, not confirmed.

---

## Data Leakage — Identified and Corrected

An early feature engineering version used injury-derived 
columns to predict injury risk, producing a false 97% 
accuracy result. This was caught, corrected, and documented 
in the notebook. The v3 onward results use only features 
available before injuries occur.

This is documented transparently so others building on 
this work do not repeat the same mistake.

---

## What the Public Data Ceiling Means

The OSHA public dataset has been exhausted as a primary 
signal source. The next meaningful signal layer requires:

- Company near-miss reports
- Environment variable logs (temp, noise, shift patterns)
- Equipment maintenance records
- Worker training and certification records

That data exists inside facilities. It is not public. 
Acquiring it requires trust, legal agreements, and a 
compelling case that the benefit outweighs the risk 
of sharing. That is the next phase of this research.

---

## Multi-Model Council Review

Findings were submitted to Claude, Gemini, DeepSeek, 
and Grok independently with a direct prompt to find 
problems, not strengths. All four converged on the 
same core limitation: this system classifies historical 
patterns and does not yet predict future risk in real time.

That unanimous finding is documented in the notebook 
and taken seriously.

---

## How to Run

```python
# 1. Download OSHA data files from https://www.osha.gov/data
# 2. Upload to Google Colab or local environment
# 3. Run cells in order — each cell is documented

# Required packages
pip install pandas scikit-learn matplotlib seaborn
```

**Environment:** Tested in Google Colab, Python 3.12

---

## Project Context

This preflight is Phase 1 of the WIPS (Workplace Injury 
Prediction System) research program. WIPS is a hybrid 
classical ML safety platform designed to give safety 
managers and floor leads a probabilistic risk signal — 
not a guarantee, a signal. The value is in identifying 
elevated risk zones before incidents occur.

Workplace injuries cost the US economy over $170 billion 
annually. More than 4,500 workers die on the job every year. 
These are not abstract statistics to me. I work in these 
environments.

If this system reaches the scale it is designed toward, 
the concept goes open source.

---

## License

MIT License — use freely, build on it, show me where 
I am wrong.

---

## Contact

LinkedIn: Billy R. Davis | IRMB Research  
Romans 8:28 | Full Force Eternal
