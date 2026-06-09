import { useState, useEffect } from "react";

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
  text: "#e2e8f0",
  textDim: "#64748b",
  textMid: "#94a3b8",
};

const TIER_COLORS = {
  CRITICAL: "#ef4444",
  CAUTION: "#f59e0b",
  WATCH: "#3b82f6",
};

const ZONE_TYPE_FALLBACK = "Operational Status";

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
    from { opacity: 0; transform: translateY(6px); }
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

  .alert-card {
    border: 1px solid ${theme.border}; border-left-width: 3px;
    background: ${theme.panel}; padding: 14px 16px; margin-bottom: 10px;
    cursor: pointer; transition: all 0.18s ease; position: relative;
  }
  .alert-card:hover { background: ${theme.panelLight}; border-color: ${theme.borderBright}; }
  .alert-card.selected {
    background: ${theme.panelLight};
    border-color: ${theme.amber}; border-left-color: ${theme.amber};
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

  .btn {
    padding: 8px 14px; border: 1px solid ${theme.borderBright};
    background: ${theme.panel}; color: ${theme.textMid};
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s; border-radius: 2px;
  }
  .btn:hover { background: ${theme.panelLight}; color: ${theme.text}; border-color: ${theme.amber}; }
  .btn-primary { border-color: ${theme.amber}; color: ${theme.amber}; }
  .btn-primary:hover { background: ${theme.amberGlow}; }

  .factor-bar { height: 4px; background: ${theme.border}; border-radius: 2px; overflow: hidden; margin-top: 4px; }
  .factor-fill {
    height: 100%;
    background: linear-gradient(90deg, ${theme.amberDim}, ${theme.amber});
    border-radius: 2px;
  }

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

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${theme.bg}; }
  ::-webkit-scrollbar-thumb { background: ${theme.amberDim}; border-radius: 2px; }
`;

// Map zone names to display types - matches scoring engine
const ZONE_TYPES = {
  "MIXING LINE 3": "Chemical Splash Risk",
  "FILLING STATION B": "Repetitive Motion Pattern",
  "COATINGS PREP — ZONE 4": "Equipment Status Drift",
  "WAREHOUSE LOADING": "Schedule Pressure Pattern",
  "QUALITY CONTROL LAB": "Training Currency Gap",
  "PRODUCTION FLOOR": "General Operational Status",
};

export default function WIPSFloorDashboard() {
  const [data, setData] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [acknowledged, setAcknowledged] = useState({});
  const [error, setError] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setData(json);
        if (json.alerts && json.alerts.length > 0) {
          setSelectedAlert(json.alerts[0]);
        }
        setError(null);
      } catch (err) {
        setError("Invalid JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleAcknowledge = (id) => {
    setAcknowledged({ ...acknowledged, [id]: true });
  };

  // Upload screen if no data loaded
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
              W.I.P.S FLOOR
            </div>
            <div className="mono" style={{
              fontSize: 11, color: theme.textDim,
              letterSpacing: "0.12em", marginBottom: 32,
            }}>
              SAFETY MANAGER DECISION SUPPORT · v1.0
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
                Load wips_alerts.json
              </div>
              <div className="mono" style={{ fontSize: 11, color: theme.textDim }}>
                CLICK TO SELECT FILE FROM YOUR SYSTEM
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

            <div className="mono" style={{
              marginTop: 32, fontSize: 10, color: theme.textDim,
              letterSpacing: "0.08em",
            }}>
              EXPECTED FORMAT: JSON OUTPUT FROM SCORING ENGINE<br />
              STRUCTURE: {`{ plant: {...}, alerts: [...] }`}
            </div>
          </div>
        </div>
      </>
    );
  }

  const plant = data.plant;
  const alerts = data.alerts || [];

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
              W.I.P.S FLOOR
            </div>
            <div style={{
              padding: "2px 10px",
              border: `1px solid ${theme.borderBright}`,
              fontSize: 10, color: theme.textDim,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em",
            }}>
              LIVE DATA · v1.0
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div className="mono" style={{ fontSize: 11, color: theme.textDim }}>
              {plant.shift || "DAY SHIFT"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className="dot" style={{ background: theme.green }} />
              <span className="mono" style={{ fontSize: 11, color: theme.green }}>
                LIVE
              </span>
            </div>
            <button
              className="btn"
              onClick={() => setData(null)}
              style={{ marginLeft: 8 }}
            >
              RELOAD
            </button>
          </div>
        </div>

        {/* PLANT NAME */}
        <div style={{ padding: "18px 24px 6px" }}>
          <div className="display" style={{ fontSize: 28, fontWeight: 700 }}>
            {plant.name}
          </div>
          <div className="mono" style={{
            fontSize: 11, color: theme.textDim, marginTop: 4,
          }}>
            GENERATED {new Date(plant.generated).toLocaleString().toUpperCase()}
          </div>
        </div>

        {/* STATS ROW */}
        <div style={{
          padding: "16px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}>
          <div className="stat-card">
            <div className="mono" style={{
              fontSize: 10, color: theme.textDim, letterSpacing: "0.12em",
              marginBottom: 8,
            }}>PLANT RISK SCORE</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <div className="display" style={{
                fontSize: 44, fontWeight: 900, color: theme.amber, lineHeight: 1,
              }}>{plant.riskScore}</div>
              <div className="mono" style={{ fontSize: 13, color: theme.red }}>
                ▲ {plant.riskTrend}
              </div>
            </div>
            <div className="mono" style={{
              fontSize: 9, color: theme.textDim, marginTop: 6,
            }}>vs PREVIOUS WINDOW</div>
          </div>

          <div className="stat-card">
            <div className="mono" style={{
              fontSize: 10, color: theme.textDim, letterSpacing: "0.12em",
              marginBottom: 8,
            }}>ALERTS REQUIRING ACTION</div>
            <div className="display" style={{
              fontSize: 44, fontWeight: 900, color: theme.text, lineHeight: 1,
            }}>{plant.alertsOpen}</div>
            <div className="mono" style={{
              fontSize: 9, color: theme.textDim, marginTop: 6,
            }}>OF {alerts.length} TOTAL FLAGGED</div>
          </div>

          <div className="stat-card">
            <div className="mono" style={{
              fontSize: 10, color: theme.textDim, letterSpacing: "0.12em",
              marginBottom: 8,
            }}>ZONES TRENDING UP</div>
            <div className="display" style={{
              fontSize: 44, fontWeight: 900, color: theme.text, lineHeight: 1,
            }}>{plant.zonesAttention}</div>
            <div className="mono" style={{
              fontSize: 9, color: theme.textDim, marginTop: 6,
            }}>WITH POSITIVE DELTA</div>
          </div>

          <div className="stat-card">
            <div className="mono" style={{
              fontSize: 10, color: theme.textDim, letterSpacing: "0.12em",
              marginBottom: 8,
            }}>HIGHEST CONFIDENCE</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <div className="display" style={{
                fontSize: 44, fontWeight: 900, color: theme.text, lineHeight: 1,
              }}>
                {alerts.length > 0
                  ? Math.round(Math.max(...alerts.map(a => a.confidence)) * 100)
                  : 0}%
              </div>
            </div>
            <div className="mono" style={{
              fontSize: 9, color: theme.textDim, marginTop: 6,
            }}>TOP ALERT CONFIDENCE</div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{
          padding: "8px 24px 24px",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 14,
        }}>
          {/* LEFT — ALERTS LIST */}
          <div>
            <div className="panel-header" style={{
              border: `1px solid ${theme.border}`,
              borderBottomColor: "transparent",
              background: theme.panel,
            }}>
              <span className="dot" style={{ background: theme.amber }} />
              THIS WEEK'S FOCUS · RANKED BY RISK × RECENCY
            </div>
            <div style={{
              background: theme.panel, padding: "10px 12px 12px",
              border: `1px solid ${theme.border}`, borderTop: "none",
            }}>
              {alerts.map((alert, i) => {
                const tierColor = TIER_COLORS[alert.tier] || theme.blue;
                return (
                  <div
                    key={alert.id}
                    className={`alert-card ${selectedAlert?.id === alert.id ? "selected" : ""}`}
                    onClick={() => setSelectedAlert(alert)}
                    style={{
                      borderLeftColor: tierColor,
                      animationDelay: `${i * 0.05}s`,
                      animation: "fade-in 0.3s ease forwards",
                    }}
                  >
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", marginBottom: 6,
                    }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="badge" style={{
                            background: `${tierColor}15`,
                            color: tierColor,
                            borderColor: `${tierColor}50`,
                          }}>{alert.tier}</span>
                          <span className="mono" style={{
                            fontSize: 10, color: theme.textDim,
                          }}>
                            #{String(alert.id).padStart(3, "0")}
                          </span>
                          {acknowledged[alert.id] && (
                            <span className="mono" style={{
                              fontSize: 10, color: theme.green,
                            }}>✓ ACK</span>
                          )}
                        </div>
                        <div className="display" style={{
                          fontSize: 16, fontWeight: 600, marginTop: 5,
                        }}>
                          {alert.location}
                        </div>
                        <div style={{
                          fontSize: 13, color: theme.textMid, marginTop: 2,
                        }}>
                          {alert.type || ZONE_TYPES[alert.location] || ZONE_TYPE_FALLBACK}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="mono" style={{
                          fontSize: 9, color: theme.textDim,
                          letterSpacing: "0.1em",
                        }}>CHANGED</div>
                        <div className="display" style={{
                          fontSize: 18, fontWeight: 700, color: theme.amber,
                        }}>
                          {alert.changedDays}d
                        </div>
                        <div className="mono" style={{
                          fontSize: 10, color: theme.textDim,
                        }}>
                          {alert.riskBefore} → {alert.riskAfter}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — DETAIL PANEL */}
          <div>
            {selectedAlert && (
              <>
                <div className="panel-header" style={{
                  border: `1px solid ${theme.border}`,
                  borderBottomColor: "transparent",
                  background: theme.panel,
                }}>
                  <span className="dot" style={{
                    background: TIER_COLORS[selectedAlert.tier] || theme.blue,
                  }} />
                  ALERT DETAIL · {selectedAlert.location}
                </div>
                <div style={{
                  background: theme.panel,
                  border: `1px solid ${theme.border}`,
                  borderTop: "none",
                  padding: "18px 18px 14px",
                  minHeight: 580,
                }}>
                  <div style={{ marginBottom: 16 }}>
                    <span className="badge" style={{
                      background: `${TIER_COLORS[selectedAlert.tier]}15`,
                      color: TIER_COLORS[selectedAlert.tier],
                      borderColor: `${TIER_COLORS[selectedAlert.tier]}50`,
                    }}>{selectedAlert.tier}</span>
                    <div className="display" style={{
                      fontSize: 22, fontWeight: 700, marginTop: 8,
                    }}>
                      {selectedAlert.type || ZONE_TYPES[selectedAlert.location] || ZONE_TYPE_FALLBACK}
                    </div>
                    <div className="mono" style={{
                      fontSize: 11, color: theme.textDim, marginTop: 4,
                    }}>
                      CONFIDENCE: {(selectedAlert.confidence * 100).toFixed(0)}% ·
                      CHANGED {selectedAlert.changedDays} DAYS AGO
                    </div>
                  </div>

                  <div style={{
                    padding: "10px 12px",
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    borderLeft: `3px solid ${TIER_COLORS[selectedAlert.tier]}`,
                    marginBottom: 14, fontSize: 13, lineHeight: 1.5,
                  }}>
                    {selectedAlert.summary}
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <div className="mono" style={{
                      fontSize: 10, color: theme.textDim,
                      letterSpacing: "0.12em", marginBottom: 8,
                    }}>
                      RISK CHANGE
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "10px 12px",
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                    }}>
                      <div style={{ textAlign: "center", flex: 1 }}>
                        <div className="mono" style={{
                          fontSize: 9, color: theme.textDim,
                        }}>BEFORE</div>
                        <div className="display" style={{
                          fontSize: 26, fontWeight: 700, color: theme.textMid,
                        }}>{selectedAlert.riskBefore}</div>
                      </div>
                      <div style={{
                        flex: 0.3, fontSize: 22,
                        color: TIER_COLORS[selectedAlert.tier],
                        textAlign: "center",
                      }}>→</div>
                      <div style={{ textAlign: "center", flex: 1 }}>
                        <div className="mono" style={{
                          fontSize: 9, color: theme.textDim,
                        }}>NOW</div>
                        <div className="display" style={{
                          fontSize: 26, fontWeight: 700,
                          color: TIER_COLORS[selectedAlert.tier],
                        }}>{selectedAlert.riskAfter}</div>
                      </div>
                      <div style={{ textAlign: "center", flex: 1 }}>
                        <div className="mono" style={{
                          fontSize: 9, color: theme.textDim,
                        }}>DELTA</div>
                        <div className="display" style={{
                          fontSize: 26, fontWeight: 700, color: theme.amber,
                        }}>
                          {selectedAlert.riskAfter - selectedAlert.riskBefore > 0 ? "+" : ""}
                          {selectedAlert.riskAfter - selectedAlert.riskBefore}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <div className="mono" style={{
                      fontSize: 10, color: theme.textDim,
                      letterSpacing: "0.12em", marginBottom: 10,
                    }}>
                      CONTRIBUTING FACTORS · SHAP ATTRIBUTION
                    </div>
                    {selectedAlert.factors && selectedAlert.factors.map((f, i) => (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          fontSize: 12,
                        }}>
                          <span>{f.name}</span>
                          <span className="mono" style={{ color: theme.amber }}>
                            {(f.weight * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="factor-bar">
                          <div className="factor-fill" style={{
                            width: `${f.weight * 100}%`,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div className="mono" style={{
                      fontSize: 10, color: theme.amber,
                      letterSpacing: "0.12em", marginBottom: 8,
                    }}>
                      RECOMMENDED ACTION
                    </div>
                    <div style={{
                      padding: "12px 14px",
                      background: theme.amberGlow,
                      border: `1px solid ${theme.amberDim}`,
                      fontSize: 13, lineHeight: 1.55,
                    }}>
                      {selectedAlert.action}
                    </div>
                  </div>

                  <div style={{
                    display: "flex", gap: 8, paddingTop: 14,
                    borderTop: `1px solid ${theme.border}`,
                  }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAcknowledge(selectedAlert.id)}
                    >
                      {acknowledged[selectedAlert.id] ? "✓ ACKNOWLEDGED" : "ACKNOWLEDGE"}
                    </button>
                    <button className="btn">INVESTIGATE</button>
                    <button className="btn">DISMISS</button>
                    <div style={{ flex: 1 }} />
                    <button className="btn">EXPORT</button>
                  </div>
                </div>
              </>
            )}
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
          <div>WIPS FLOOR v1.0 · DECISION SUPPORT TOOL · NOT A GUARANTEE</div>
          <div>SYNTHETIC DATA · PROTOTYPE</div>
          <div style={{ color: theme.amber }}>FULL FORCE ETERNAL</div>
        </div>
      </div>
    </>
  );
}
