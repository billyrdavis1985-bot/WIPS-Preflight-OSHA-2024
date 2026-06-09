import { useState } from "react";

const theme = {
  bg: "#0a0c0f",
  panel: "#0f1318",
  panelLight: "#141a22",
  border: "#1e2530",
  borderBright: "#2a3545",
  amber: "#f59e0b",
  amberDim: "#92400e",
  amberGlow: "rgba(245,158,11,0.12)",
  red: "#ef4444",
  redDim: "#7f1d1d",
  green: "#22c55e",
  greenDim: "#14532d",
  blue: "#3b82f6",
  purple: "#a855f7",
  text: "#e2e8f0",
  textDim: "#64748b",
  textMid: "#94a3b8",
};

const TIER_COLORS = {
  CRITICAL: "#ef4444",
  CAUTION: "#f59e0b",
  WATCH: "#3b82f6",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Barlow+Condensed:wght@400;500;600;700;900&family=Inter:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body, #root {
    background: ${theme.bg}; color: ${theme.text};
    font-family: 'Inter', sans-serif; min-height: 100vh;
  }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .display { font-family: 'Barlow Condensed', sans-serif; }

  @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .scanline {
    position: fixed; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent);
    animation: scanline 12s linear infinite;
    pointer-events: none; z-index: 999;
  }

  .grid-bg {
    background-image:
      linear-gradient(rgba(245,158,11,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(245,158,11,0.025) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .dot {
    width: 6px; height: 6px; border-radius: 50%;
    animation: pulse-dot 2s infinite; display: inline-block;
  }

  .panel { background: ${theme.panel}; border: 1px solid ${theme.border}; border-radius: 3px; }
  .panel-header {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; border-bottom: 1px solid ${theme.border};
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: ${theme.textMid}; letter-spacing: 0.14em; text-transform: uppercase;
  }

  .badge {
    display: inline-block; padding: 2px 8px; border-radius: 2px;
    font-size: 10px; font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.1em; text-transform: uppercase;
    font-weight: 600; border: 1px solid;
  }

  .stat-card {
    background: ${theme.panel}; border: 1px solid ${theme.border};
    padding: 16px 18px; position: relative; overflow: hidden;
  }
  .stat-card::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${theme.amber}, transparent);
    opacity: 0.5;
  }

  .plant-card {
    background: ${theme.panel};
    border: 1px solid ${theme.border};
    border-left-width: 4px;
    border-radius: 3px;
    padding: 18px 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    animation: fade-in 0.4s ease forwards;
  }
  .plant-card:hover {
    background: ${theme.panelLight};
    border-color: ${theme.amber};
    transform: translateY(-1px);
  }
  .plant-card.selected {
    background: ${theme.panelLight};
    border-color: ${theme.amber};
  }

  .btn {
    padding: 8px 14px; border: 1px solid ${theme.borderBright};
    background: ${theme.panel}; color: ${theme.textMid};
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s; border-radius: 2px;
  }
  .btn:hover { background: ${theme.panelLight}; color: ${theme.text}; border-color: ${theme.amber}; }
  .btn-primary { border-color: ${theme.amber}; color: ${theme.amber}; }

  .upload-zone {
    border: 2px dashed ${theme.borderBright};
    border-radius: 4px;
    padding: 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .upload-zone:hover {
    border-color: ${theme.amber};
    background: ${theme.amberGlow};
  }

  .risk-bar {
    height: 6px;
    background: ${theme.border};
    border-radius: 3px;
    overflow: hidden;
    margin-top: 8px;
  }
  .risk-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.6s ease;
  }

  .mini-alert {
    padding: 8px 12px;
    background: ${theme.bg};
    border: 1px solid ${theme.border};
    border-left-width: 3px;
    margin-bottom: 6px;
    font-size: 12px;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${theme.bg}; }
  ::-webkit-scrollbar-thumb { background: ${theme.amberDim}; border-radius: 2px; }
`;

const getRiskColor = (score) => {
  if (score >= 60) return theme.red;
  if (score >= 45) return theme.amber;
  if (score >= 30) return theme.blue;
  return theme.green;
};

const getRiskLabel = (score) => {
  if (score >= 60) return "ELEVATED";
  if (score >= 45) return "MODERATE";
  if (score >= 30) return "WATCH";
  return "STABLE";
};

export default function WIPSCorporateDashboard() {
  const [data, setData] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json.plants || !Array.isArray(json.plants)) {
          throw new Error("Expected multi-facility JSON with 'plants' array");
        }
        setData(json);
        // Auto-select highest risk plant
        const sorted = [...json.plants].sort(
          (a, b) => b.plant.riskScore - a.plant.riskScore
        );
        setSelectedPlant(sorted[0]);
        setError(null);
      } catch (err) {
        setError("Invalid JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Upload screen
  if (!data) {
    return (
      <>
        <style>{styles}</style>
        <div className="scanline" />
        <div className="grid-bg" style={{
          minHeight: "100vh", display: "flex",
          alignItems: "center", justifyContent: "center",
          padding: 24,
        }}>
          <div style={{ maxWidth: 600, width: "100%" }}>
            <div className="display" style={{
              fontSize: 32, fontWeight: 900, color: theme.amber,
              letterSpacing: "0.05em", marginBottom: 6,
            }}>
              W.I.P.S DIRECTOR
            </div>
            <div className="mono" style={{
              fontSize: 11, color: theme.textDim,
              letterSpacing: "0.12em", marginBottom: 32,
            }}>
              MULTI-FACILITY CORPORATE VIEW · v1.0
            </div>
            <label className="upload-zone" style={{ display: "block" }}>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <div className="display" style={{
                fontSize: 22, color: theme.text, marginBottom: 8,
              }}>
                Load wips_alerts_multi.json
              </div>
              <div className="mono" style={{ fontSize: 11, color: theme.textDim }}>
                MULTI-FACILITY DATA · CLICK TO SELECT
              </div>
            </label>
            {error && (
              <div className="mono" style={{
                marginTop: 16, padding: "10px 12px",
                background: `${theme.red}15`,
                border: `1px solid ${theme.red}50`,
                color: theme.red, fontSize: 12,
              }}>
                ERROR: {error}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  const plants = data.plants;
  
  // Aggregate metrics
  const totalAlerts = plants.reduce((sum, p) => sum + p.alerts.length, 0);
  const criticalAlerts = plants.reduce((sum, p) => 
    sum + p.alerts.filter(a => a.tier === "CRITICAL").length, 0);
  const cautionAlerts = plants.reduce((sum, p) => 
    sum + p.alerts.filter(a => a.tier === "CAUTION").length, 0);
  const avgRisk = Math.round(
    plants.reduce((sum, p) => sum + p.plant.riskScore, 0) / plants.length
  );
  const totalEmployees = plants.reduce((sum, p) => 
    sum + (p.plant.employees || 0), 0);
  
  // Sort plants by risk score descending
  const sortedPlants = [...plants].sort(
    (a, b) => b.plant.riskScore - a.plant.riskScore
  );
  
  const selectedPlantAlerts = selectedPlant?.alerts || [];
  const selectedPlantData = selectedPlant?.plant;

  return (
    <>
      <style>{styles}</style>
      <div className="scanline" />
      <div className="grid-bg" style={{ minHeight: "100vh" }}>

        {/* TOP BAR */}
        <div style={{
          borderBottom: `1px solid ${theme.border}`,
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: theme.panel,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="display" style={{
              fontSize: 22, fontWeight: 900, color: theme.amber,
              letterSpacing: "0.05em",
            }}>
              W.I.P.S DIRECTOR
            </div>
            <div style={{
              padding: "2px 10px",
              border: `1px solid ${theme.borderBright}`,
              fontSize: 10, color: theme.textDim,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em",
            }}>
              CORPORATE VIEW · {plants.length} PLANTS
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div className="mono" style={{ fontSize: 11, color: theme.textDim }}>
              {data.company || "Hudson Forge Technologies"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className="dot" style={{ background: theme.green }} />
              <span className="mono" style={{ fontSize: 11, color: theme.green }}>
                LIVE
              </span>
            </div>
            <button className="btn" onClick={() => setData(null)}>
              RELOAD
            </button>
          </div>
        </div>

        {/* COMPANY HEADER */}
        <div style={{ padding: "18px 24px 6px" }}>
          <div className="display" style={{ fontSize: 28, fontWeight: 700 }}>
            {data.company || "Hudson Forge Technologies"}
          </div>
          <div className="mono" style={{
            fontSize: 11, color: theme.textDim, marginTop: 4,
          }}>
            CORPORATE SAFETY OVERVIEW · {totalEmployees.toLocaleString()} EMPLOYEES ·
            GENERATED {new Date(data.generated).toLocaleString().toUpperCase()}
          </div>
        </div>

        {/* AGGREGATE STATS */}
        <div style={{
          padding: "16px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12,
        }}>
          <div className="stat-card">
            <div className="mono" style={{
              fontSize: 10, color: theme.textDim, letterSpacing: "0.12em",
              marginBottom: 8,
            }}>AVG RISK SCORE</div>
            <div className="display" style={{
              fontSize: 44, fontWeight: 900, color: getRiskColor(avgRisk), lineHeight: 1,
            }}>{avgRisk}</div>
            <div className="mono" style={{
              fontSize: 9, color: theme.textDim, marginTop: 6,
            }}>ACROSS {plants.length} PLANTS</div>
          </div>

          <div className="stat-card">
            <div className="mono" style={{
              fontSize: 10, color: theme.textDim, letterSpacing: "0.12em",
              marginBottom: 8,
            }}>CRITICAL ALERTS</div>
            <div className="display" style={{
              fontSize: 44, fontWeight: 900, color: theme.red, lineHeight: 1,
            }}>{criticalAlerts}</div>
            <div className="mono" style={{
              fontSize: 9, color: theme.textDim, marginTop: 6,
            }}>COMPANY-WIDE</div>
          </div>

          <div className="stat-card">
            <div className="mono" style={{
              fontSize: 10, color: theme.textDim, letterSpacing: "0.12em",
              marginBottom: 8,
            }}>CAUTION ALERTS</div>
            <div className="display" style={{
              fontSize: 44, fontWeight: 900, color: theme.amber, lineHeight: 1,
            }}>{cautionAlerts}</div>
            <div className="mono" style={{
              fontSize: 9, color: theme.textDim, marginTop: 6,
            }}>COMPANY-WIDE</div>
          </div>

          <div className="stat-card">
            <div className="mono" style={{
              fontSize: 10, color: theme.textDim, letterSpacing: "0.12em",
              marginBottom: 8,
            }}>TOTAL ALERTS</div>
            <div className="display" style={{
              fontSize: 44, fontWeight: 900, color: theme.text, lineHeight: 1,
            }}>{totalAlerts}</div>
            <div className="mono" style={{
              fontSize: 9, color: theme.textDim, marginTop: 6,
            }}>ACTIVE</div>
          </div>

          <div className="stat-card">
            <div className="mono" style={{
              fontSize: 10, color: theme.textDim, letterSpacing: "0.12em",
              marginBottom: 8,
            }}>PLANTS AT RISK</div>
            <div className="display" style={{
              fontSize: 44, fontWeight: 900, color: theme.text, lineHeight: 1,
            }}>
              {plants.filter(p => p.plant.riskScore >= 45).length}
              <span style={{ fontSize: 22, color: theme.textDim }}>
                /{plants.length}
              </span>
            </div>
            <div className="mono" style={{
              fontSize: 9, color: theme.textDim, marginTop: 6,
            }}>SCORE ≥ 45</div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{
          padding: "8px 24px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}>
          {/* LEFT — PLANT CARDS */}
          <div>
            <div className="panel-header" style={{
              border: `1px solid ${theme.border}`,
              borderBottomColor: "transparent",
              background: theme.panel,
            }}>
              <span className="dot" style={{ background: theme.amber }} />
              FACILITY RANKING · RISK SCORE DESCENDING
            </div>
            <div style={{
              background: theme.panel, padding: "12px",
              border: `1px solid ${theme.border}`, borderTop: "none",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              {sortedPlants.map((plant, i) => {
                const p = plant.plant;
                const riskColor = getRiskColor(p.riskScore);
                const trendUp = !p.riskTrend.startsWith("-");
                const criticalCount = plant.alerts.filter(a => a.tier === "CRITICAL").length;
                
                return (
                  <div
                    key={p.plant_id || i}
                    className={`plant-card ${selectedPlant?.plant?.plant_id === p.plant_id ? "selected" : ""}`}
                    onClick={() => setSelectedPlant(plant)}
                    style={{
                      borderLeftColor: riskColor,
                      animationDelay: `${i * 0.06}s`,
                    }}
                  >
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}>
                      <div style={{ flex: 1 }}>
                        <div className="display" style={{
                          fontSize: 18, fontWeight: 700, marginBottom: 3,
                        }}>
                          {p.name}
                        </div>
                        <div className="mono" style={{
                          fontSize: 10, color: theme.textDim,
                          letterSpacing: "0.08em",
                        }}>
                          {p.location} · {p.employees} EMPLOYEES · {p.shifts} SHIFTS
                        </div>
                      </div>
                      <span className="badge" style={{
                        background: `${riskColor}15`,
                        color: riskColor,
                        borderColor: `${riskColor}50`,
                      }}>{getRiskLabel(p.riskScore)}</span>
                    </div>

                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 14, marginTop: 14,
                    }}>
                      <div>
                        <div className="mono" style={{
                          fontSize: 9, color: theme.textDim,
                          letterSpacing: "0.1em",
                        }}>RISK SCORE</div>
                        <div style={{
                          display: "flex", alignItems: "baseline", gap: 6,
                        }}>
                          <div className="display" style={{
                            fontSize: 26, fontWeight: 900, color: riskColor,
                          }}>{p.riskScore}</div>
                          <div className="mono" style={{
                            fontSize: 11,
                            color: trendUp ? theme.red : theme.green,
                          }}>
                            {trendUp ? "▲" : "▼"} {p.riskTrend.replace("+", "").replace("-", "")}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="mono" style={{
                          fontSize: 9, color: theme.textDim,
                          letterSpacing: "0.1em",
                        }}>CRITICAL</div>
                        <div className="display" style={{
                          fontSize: 26, fontWeight: 900,
                          color: criticalCount > 0 ? theme.red : theme.textMid,
                        }}>{criticalCount}</div>
                      </div>

                      <div>
                        <div className="mono" style={{
                          fontSize: 9, color: theme.textDim,
                          letterSpacing: "0.1em",
                        }}>ALERTS</div>
                        <div className="display" style={{
                          fontSize: 26, fontWeight: 900, color: theme.text,
                        }}>{plant.alerts.length}</div>
                      </div>
                    </div>

                    <div className="risk-bar">
                      <div className="risk-fill" style={{
                        width: `${p.riskScore}%`,
                        background: `linear-gradient(90deg, ${riskColor}80, ${riskColor})`,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — SELECTED PLANT DETAIL */}
          <div>
            <div className="panel-header" style={{
              border: `1px solid ${theme.border}`,
              borderBottomColor: "transparent",
              background: theme.panel,
            }}>
              <span className="dot" style={{
                background: getRiskColor(selectedPlantData?.riskScore || 0),
              }} />
              PLANT DETAIL · {selectedPlantData?.name || ""}
            </div>
            <div style={{
              background: theme.panel,
              border: `1px solid ${theme.border}`,
              borderTop: "none",
              padding: "18px 18px 14px",
              minHeight: 580,
            }}>
              {selectedPlant && (
                <>
                  <div style={{ marginBottom: 18 }}>
                    <div className="display" style={{
                      fontSize: 22, fontWeight: 700,
                    }}>
                      {selectedPlantData.name}
                    </div>
                    <div className="mono" style={{
                      fontSize: 11, color: theme.textDim, marginTop: 4,
                    }}>
                      {selectedPlantData.location} · 
                      {' '}{selectedPlantData.employees} EMPLOYEES · 
                      {' '}{selectedPlantData.shifts} SHIFTS
                    </div>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 10, marginBottom: 18,
                  }}>
                    <div style={{
                      padding: "10px 12px",
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                    }}>
                      <div className="mono" style={{
                        fontSize: 9, color: theme.textDim,
                      }}>RISK SCORE</div>
                      <div className="display" style={{
                        fontSize: 24, fontWeight: 900,
                        color: getRiskColor(selectedPlantData.riskScore),
                      }}>{selectedPlantData.riskScore}</div>
                    </div>
                    <div style={{
                      padding: "10px 12px",
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                    }}>
                      <div className="mono" style={{
                        fontSize: 9, color: theme.textDim,
                      }}>TREND</div>
                      <div className="display" style={{
                        fontSize: 24, fontWeight: 900,
                        color: selectedPlantData.riskTrend.startsWith("-") 
                          ? theme.green : theme.red,
                      }}>{selectedPlantData.riskTrend}</div>
                    </div>
                    <div style={{
                      padding: "10px 12px",
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                    }}>
                      <div className="mono" style={{
                        fontSize: 9, color: theme.textDim,
                      }}>ZONES UP</div>
                      <div className="display" style={{
                        fontSize: 24, fontWeight: 900,
                        color: theme.amber,
                      }}>{selectedPlantData.zonesAttention}</div>
                    </div>
                  </div>

                  <div className="mono" style={{
                    fontSize: 10, color: theme.textDim,
                    letterSpacing: "0.12em", marginBottom: 10,
                  }}>
                    TOP ALERTS · ALL ZONES
                  </div>

                  {selectedPlantAlerts.map((alert, i) => {
                    const tierColor = TIER_COLORS[alert.tier];
                    return (
                      <div
                        key={alert.id}
                        className="mini-alert"
                        style={{ borderLeftColor: tierColor }}
                      >
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          alignItems: "center", marginBottom: 4,
                        }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span className="badge" style={{
                              background: `${tierColor}15`,
                              color: tierColor,
                              borderColor: `${tierColor}50`,
                            }}>{alert.tier}</span>
                            <span className="display" style={{
                              fontSize: 14, fontWeight: 600,
                            }}>
                              {alert.location}
                            </span>
                          </div>
                          <div className="mono" style={{
                            fontSize: 11, color: theme.textDim,
                          }}>
                            {alert.riskBefore} → {alert.riskAfter}
                            <span style={{
                              color: theme.amber, marginLeft: 6,
                            }}>
                              ({alert.riskAfter > alert.riskBefore ? "+" : ""}
                              {alert.riskAfter - alert.riskBefore})
                            </span>
                          </div>
                        </div>
                        <div style={{
                          fontSize: 11, color: theme.textMid,
                        }}>
                          {alert.type}
                        </div>
                      </div>
                    );
                  })}

                  <div style={{
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: `1px solid ${theme.border}`,
                    display: "flex", gap: 8,
                  }}>
                    <button className="btn btn-primary">
                      OPEN PLANT VIEW
                    </button>
                    <button className="btn">
                      EXPORT REPORT
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{
          padding: "12px 24px",
          borderTop: `1px solid ${theme.border}`,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          color: theme.textDim,
          letterSpacing: "0.08em",
        }}>
          <div>WIPS DIRECTOR v1.0 · CORPORATE OVERVIEW · NOT A GUARANTEE</div>
          <div>MULTI-FACILITY · SYNTHETIC DATA</div>
          <div style={{ color: theme.amber }}>FULL FORCE ETERNAL</div>
        </div>
      </div>
    </>
  );
}
