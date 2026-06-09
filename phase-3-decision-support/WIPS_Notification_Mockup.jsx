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
  text: "#e2e8f0",
  textDim: "#64748b",
  textMid: "#94a3b8",
};

const TIER_COLORS = {
  CRITICAL: "#ef4444",
  CAUTION: "#f59e0b",
  WATCH: "#3b82f6",
};

const TIMING_RULES = {
  CRITICAL: {
    when: "Immediate",
    channel: "Push + Email",
    recipients: ["Safety Manager", "Plant Manager"],
    sla: "Within 5 minutes of detection",
  },
  CAUTION: {
    when: "Morning batch · 7:00 AM",
    channel: "Email",
    recipients: ["Safety Manager"],
    sla: "Same-day delivery",
  },
  WATCH: {
    when: "Pre-shift digest · 6:00 AM",
    channel: "Email",
    recipients: ["Safety Manager"],
    sla: "Daily summary",
  },
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
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slide-in-right {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes push-arrive {
    0% { opacity: 0; transform: translateY(-30px) scale(0.95); }
    60% { opacity: 1; transform: translateY(0) scale(1.02); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
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

  .btn {
    padding: 8px 14px; border: 1px solid ${theme.borderBright};
    background: ${theme.panel}; color: ${theme.textMid};
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s; border-radius: 2px;
  }
  .btn:hover { background: ${theme.panelLight}; color: ${theme.text}; border-color: ${theme.amber}; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary { border-color: ${theme.amber}; color: ${theme.amber}; }
  .btn-primary:hover { background: ${theme.amberGlow}; }

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

  /* Email preview */
  .email-preview {
    background: #ffffff;
    color: #1a1a1a;
    border-radius: 4px;
    overflow: hidden;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    line-height: 1.5;
  }
  .email-header {
    background: #f5f5f5;
    padding: 12px 16px;
    border-bottom: 1px solid #e0e0e0;
  }
  .email-meta {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: #666;
    margin-top: 4px;
  }
  .email-subject {
    font-weight: 600;
    color: #1a1a1a;
    font-size: 14px;
  }
  .email-body {
    padding: 18px 20px;
  }

  /* Push notification */
  .push-notif {
    background: ${theme.panelLight};
    border: 1px solid ${theme.border};
    border-radius: 12px;
    padding: 12px 14px;
    color: ${theme.text};
    box-shadow: 0 4px 14px rgba(0,0,0,0.4);
    max-width: 320px;
    animation: push-arrive 0.5s ease;
  }
  .push-app-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;
    font-size: 10px;
    color: ${theme.textDim};
    letter-spacing: 0.08em;
  }
  .push-icon {
    width: 16px; height: 16px;
    background: ${theme.amber};
    border-radius: 3px;
    display: flex; align-items: center; justify-content: center;
    color: ${theme.bg}; font-weight: 900; font-size: 9px;
  }

  .timing-tile {
    background: ${theme.panel};
    border: 1px solid ${theme.border};
    border-left-width: 4px;
    padding: 14px 16px;
    border-radius: 3px;
  }

  .delivery-log-row {
    display: grid;
    grid-template-columns: 100px 1fr 100px 80px;
    gap: 12px;
    padding: 10px 12px;
    border-bottom: 1px solid ${theme.border};
    font-size: 12px;
    align-items: center;
  }
  .delivery-log-row:last-child { border-bottom: none; }

  .tab {
    cursor: pointer;
    padding: 10px 18px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${theme.textDim};
    border-bottom: 2px solid transparent;
    transition: all 0.15s;
  }
  .tab.active {
    color: ${theme.amber};
    border-bottom-color: ${theme.amber};
  }
  .tab:hover { color: ${theme.text}; }

  .stat-card {
    background: ${theme.panel};
    border: 1px solid ${theme.border};
    padding: 14px 16px;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${theme.bg}; }
  ::-webkit-scrollbar-thumb { background: ${theme.amberDim}; border-radius: 2px; }
`;

function buildEmail(alert, plant) {
  const tier = alert.tier;
  const dashboardLink = "https://wips.hudson-forge.io/floor/plant-17";
  
  if (tier === "CRITICAL") {
    return {
      from: "wips-alerts@hudson-forge.io",
      to: ["safety.manager@plant17.com", "plant.manager@plant17.com"],
      subject: `🔴 CRITICAL ALERT · ${alert.location} · ${plant.name}`,
      body: [
        `A CRITICAL risk alert has been generated for ${alert.location}.`,
        ``,
        `Risk Score:   ${alert.riskBefore} → ${alert.riskAfter} (+${alert.riskAfter - alert.riskBefore})`,
        `Type:         ${alert.type}`,
        `Confidence:   ${(alert.confidence * 100).toFixed(0)}%`,
        `Changed:      ${alert.changedDays} days ago`,
        ``,
        `Open dashboard for full detail and recommended action:`,
        dashboardLink,
        ``,
        `— WIPS Floor`,
      ].join("\n"),
    };
  }
  
  if (tier === "CAUTION") {
    return {
      from: "wips-alerts@hudson-forge.io",
      to: ["safety.manager@plant17.com"],
      subject: `⚠ CAUTION · ${alert.location} · ${plant.name}`,
      body: [
        `A caution-level alert was generated overnight.`,
        ``,
        `Location:     ${alert.location}`,
        `Risk:         ${alert.riskBefore} → ${alert.riskAfter} (+${alert.riskAfter - alert.riskBefore})`,
        `Type:         ${alert.type}`,
        ``,
        `Review during morning rounds:`,
        dashboardLink,
        ``,
        `— WIPS Floor`,
      ].join("\n"),
    };
  }
  
  return {
    from: "wips-alerts@hudson-forge.io",
    to: ["safety.manager@plant17.com"],
    subject: `Pre-Shift Digest · ${plant.name}`,
    body: [
      `Daily summary for ${plant.name}.`,
      ``,
      `Plant Risk Score: ${plant.riskScore}`,
      `Active alerts: see dashboard for full breakdown`,
      ``,
      `Watch items currently flagged:`,
      `  ${alert.location} (${alert.tier})`,
      ``,
      `Full digest:`,
      dashboardLink,
      ``,
      `— WIPS Floor`,
    ].join("\n"),
  };
}

function buildPush(alert) {
  return {
    title: `${alert.tier} · ${alert.location}`,
    body: `${alert.type} · Risk ${alert.riskBefore}→${alert.riskAfter}. Tap to review.`,
  };
}

export default function WIPSNotificationMockup() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("preview");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [error, setError] = useState(null);
  const [pushVisible, setPushVisible] = useState(false);
  const [deliveryLog, setDeliveryLog] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json.plant || !json.alerts) {
          throw new Error("Expected single-plant JSON with 'plant' and 'alerts'");
        }
        setData(json);
        setSelectedAlert(json.alerts[0]);
        setError(null);
      } catch (err) {
        setError("Invalid JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const simulateSend = () => {
    if (!selectedAlert) return;
    const email = buildEmail(selectedAlert, data.plant);
    const rule = TIMING_RULES[selectedAlert.tier];
    const now = new Date().toLocaleTimeString([], { 
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });
    
    const newLog = {
      time: now,
      tier: selectedAlert.tier,
      location: selectedAlert.location,
      recipients: rule.recipients.length,
      channels: rule.channel,
    };
    setDeliveryLog([newLog, ...deliveryLog].slice(0, 10));
    
    if (selectedAlert.tier === "CRITICAL") {
      setPushVisible(true);
      setTimeout(() => setPushVisible(false), 5000);
    }
  };

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
              W.I.P.S NOTIFY
            </div>
            <div className="mono" style={{
              fontSize: 11, color: theme.textDim,
              letterSpacing: "0.12em", marginBottom: 32,
            }}>
              NOTIFICATION SYSTEM MOCKUP · v1.0
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
              letterSpacing: "0.08em", lineHeight: 1.7,
            }}>
              MOCKUP ONLY · NO ACTUAL EMAILS OR PUSH SENT<br/>
              DEMONSTRATES NOTIFICATION CONTENT AND TIMING
            </div>
          </div>
        </div>
      </>
    );
  }

  const plant = data.plant;
  const alerts = data.alerts;
  const currentEmail = selectedAlert ? buildEmail(selectedAlert, plant) : null;
  const currentPush = selectedAlert ? buildPush(selectedAlert) : null;
  const currentRule = selectedAlert ? TIMING_RULES[selectedAlert.tier] : null;

  return (
    <>
      <style>{styles}</style>
      <div className="scanline" />
      <div className="grid-bg" style={{ minHeight: "100vh" }}>

        {/* Push notification overlay */}
        {pushVisible && currentPush && (
          <div style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 500,
          }}>
            <div className="push-notif">
              <div className="push-app-row">
                <div className="push-icon">W</div>
                <span>WIPS · NOW</span>
              </div>
              <div style={{
                fontSize: 13, fontWeight: 600, marginBottom: 3,
              }}>
                {currentPush.title}
              </div>
              <div style={{ fontSize: 12, color: theme.textMid }}>
                {currentPush.body}
              </div>
            </div>
          </div>
        )}

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
              W.I.P.S NOTIFY
            </div>
            <div style={{
              padding: "2px 10px",
              border: `1px solid ${theme.borderBright}`,
              fontSize: 10, color: theme.textDim,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em",
            }}>
              MOCKUP · NO REAL DELIVERY
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div className="mono" style={{ fontSize: 11, color: theme.textDim }}>
              {plant.name}
            </div>
            <button className="btn" onClick={() => setData(null)}>
              RELOAD
            </button>
          </div>
        </div>

        {/* TABS */}
        <div style={{
          padding: "0 24px",
          display: "flex",
          gap: 0,
          borderBottom: `1px solid ${theme.border}`,
        }}>
          <div
            className={`tab ${activeTab === "preview" ? "active" : ""}`}
            onClick={() => setActiveTab("preview")}
          >
            Preview ({alerts.length})
          </div>
          <div
            className={`tab ${activeTab === "rules" ? "active" : ""}`}
            onClick={() => setActiveTab("rules")}
          >
            Timing Rules
          </div>
          <div
            className={`tab ${activeTab === "log" ? "active" : ""}`}
            onClick={() => setActiveTab("log")}
          >
            Delivery Log ({deliveryLog.length})
          </div>
        </div>

        {/* PREVIEW TAB */}
        {activeTab === "preview" && (
          <div style={{
            padding: "16px 24px 24px",
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: 14,
          }}>
            {/* LEFT — ALERT PICKER */}
            <div>
              <div className="panel-header" style={{
                border: `1px solid ${theme.border}`,
                borderBottomColor: "transparent",
                background: theme.panel,
              }}>
                <span className="dot" style={{ background: theme.amber }} />
                SELECT ALERT TO PREVIEW
              </div>
              <div style={{
                background: theme.panel,
                padding: "8px",
                border: `1px solid ${theme.border}`,
                borderTop: "none",
              }}>
                {alerts.map((alert) => {
                  const tierColor = TIER_COLORS[alert.tier];
                  const selected = selectedAlert?.id === alert.id;
                  return (
                    <div
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      style={{
                        padding: "10px 12px",
                        marginBottom: 4,
                        cursor: "pointer",
                        background: selected ? theme.panelLight : "transparent",
                        borderLeft: `3px solid ${selected ? tierColor : "transparent"}`,
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{
                        display: "flex", gap: 6, alignItems: "center",
                        marginBottom: 4,
                      }}>
                        <span className="badge" style={{
                          background: `${tierColor}15`,
                          color: tierColor,
                          borderColor: `${tierColor}50`,
                          fontSize: 9,
                          padding: "1px 6px",
                        }}>{alert.tier}</span>
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: selected ? theme.text : theme.textMid,
                      }}>
                        {alert.location}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 14 }}>
                <button
                  className="btn btn-primary"
                  onClick={simulateSend}
                  disabled={!selectedAlert}
                  style={{ width: "100%" }}
                >
                  SIMULATE SEND
                </button>
                <div className="mono" style={{
                  fontSize: 9, color: theme.textDim,
                  marginTop: 8, letterSpacing: "0.08em",
                  textAlign: "center",
                }}>
                  PREVIEWS WHAT THE SYSTEM WOULD SEND<br/>
                  NO ACTUAL DELIVERY OCCURS
                </div>
              </div>
            </div>

            {/* RIGHT — PREVIEW PANELS */}
            <div>
              {/* Timing rule for selected */}
              {currentRule && (
                <div className="timing-tile" style={{
                  borderLeftColor: TIER_COLORS[selectedAlert.tier],
                  marginBottom: 14,
                }}>
                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                    <div>
                      <div className="mono" style={{
                        fontSize: 9, color: theme.textDim,
                        letterSpacing: "0.12em",
                      }}>WHEN</div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                        {currentRule.when}
                      </div>
                    </div>
                    <div>
                      <div className="mono" style={{
                        fontSize: 9, color: theme.textDim,
                        letterSpacing: "0.12em",
                      }}>CHANNEL</div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                        {currentRule.channel}
                      </div>
                    </div>
                    <div>
                      <div className="mono" style={{
                        fontSize: 9, color: theme.textDim,
                        letterSpacing: "0.12em",
                      }}>RECIPIENTS</div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                        {currentRule.recipients.join(" · ")}
                      </div>
                    </div>
                    <div>
                      <div className="mono" style={{
                        fontSize: 9, color: theme.textDim,
                        letterSpacing: "0.12em",
                      }}>SLA</div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                        {currentRule.sla}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email preview */}
              {currentEmail && (
                <div style={{ marginBottom: 14 }}>
                  <div className="mono" style={{
                    fontSize: 10, color: theme.textDim,
                    letterSpacing: "0.12em", marginBottom: 8,
                  }}>
                    EMAIL PREVIEW
                  </div>
                  <div className="email-preview">
                    <div className="email-header">
                      <div className="email-subject">{currentEmail.subject}</div>
                      <div className="email-meta">
                        <div><strong>From:</strong> {currentEmail.from}</div>
                        <div><strong>To:</strong> {currentEmail.to.join(", ")}</div>
                      </div>
                    </div>
                    <div className="email-body">
                      <pre style={{
                        fontFamily: "inherit",
                        whiteSpace: "pre-wrap",
                        margin: 0,
                      }}>
                        {currentEmail.body}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Push preview only for Critical */}
              {selectedAlert?.tier === "CRITICAL" && currentPush && (
                <div>
                  <div className="mono" style={{
                    fontSize: 10, color: theme.textDim,
                    letterSpacing: "0.12em", marginBottom: 8,
                  }}>
                    PUSH NOTIFICATION PREVIEW
                  </div>
                  <div className="push-notif">
                    <div className="push-app-row">
                      <div className="push-icon">W</div>
                      <span>WIPS · NOW</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                      {currentPush.title}
                    </div>
                    <div style={{ fontSize: 12, color: theme.textMid }}>
                      {currentPush.body}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TIMING RULES TAB */}
        {activeTab === "rules" && (
          <div style={{ padding: "16px 24px 24px" }}>
            <div className="display" style={{
              fontSize: 22, fontWeight: 700, marginBottom: 4,
            }}>
              Notification Timing & Routing
            </div>
            <div className="mono" style={{
              fontSize: 11, color: theme.textDim,
              letterSpacing: "0.08em", marginBottom: 18,
            }}>
              ESTABLISHED RULES FOR EACH ALERT TIER
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {Object.entries(TIMING_RULES).map(([tier, rule]) => {
                const color = TIER_COLORS[tier];
                return (
                  <div
                    key={tier}
                    className="timing-tile"
                    style={{ borderLeftColor: color }}
                  >
                    <div style={{
                      display: "flex", alignItems: "center", gap: 12,
                      marginBottom: 14,
                    }}>
                      <span className="badge" style={{
                        background: `${color}15`,
                        color: color,
                        borderColor: `${color}50`,
                      }}>{tier}</span>
                      <div className="display" style={{
                        fontSize: 18, fontWeight: 700,
                      }}>
                        {tier === "CRITICAL" && "Immediate Critical Alert"}
                        {tier === "CAUTION" && "Same-Day Caution Email"}
                        {tier === "WATCH" && "Daily Pre-Shift Digest"}
                      </div>
                    </div>

                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 16,
                    }}>
                      <div>
                        <div className="mono" style={{
                          fontSize: 9, color: theme.textDim,
                          letterSpacing: "0.12em", marginBottom: 4,
                        }}>TRIGGER</div>
                        <div style={{ fontSize: 13 }}>{rule.when}</div>
                      </div>
                      <div>
                        <div className="mono" style={{
                          fontSize: 9, color: theme.textDim,
                          letterSpacing: "0.12em", marginBottom: 4,
                        }}>CHANNELS</div>
                        <div style={{ fontSize: 13 }}>{rule.channel}</div>
                      </div>
                      <div>
                        <div className="mono" style={{
                          fontSize: 9, color: theme.textDim,
                          letterSpacing: "0.12em", marginBottom: 4,
                        }}>RECIPIENTS</div>
                        <div style={{ fontSize: 13 }}>
                          {rule.recipients.map((r, i) => (
                            <div key={i}>{r}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="mono" style={{
                          fontSize: 9, color: theme.textDim,
                          letterSpacing: "0.12em", marginBottom: 4,
                        }}>SLA</div>
                        <div style={{ fontSize: 13 }}>{rule.sla}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              marginTop: 24,
              padding: "14px 16px",
              background: theme.amberGlow,
              border: `1px solid ${theme.amberDim}`,
              fontSize: 12,
              lineHeight: 1.6,
            }}>
              <div className="mono" style={{
                fontSize: 10, color: theme.amber,
                letterSpacing: "0.12em", marginBottom: 6,
              }}>DESIGN PRINCIPLE</div>
              Alert fatigue is the primary failure mode of safety notification systems.
              These rules optimize for precision over recall — fewer, better-targeted
              notifications that the recipient will actually read and act on.
            </div>
          </div>
        )}

        {/* DELIVERY LOG TAB */}
        {activeTab === "log" && (
          <div style={{ padding: "16px 24px 24px" }}>
            <div className="display" style={{
              fontSize: 22, fontWeight: 700, marginBottom: 4,
            }}>
              Delivery Log
            </div>
            <div className="mono" style={{
              fontSize: 11, color: theme.textDim,
              letterSpacing: "0.08em", marginBottom: 18,
            }}>
              SIMULATED DELIVERY HISTORY · NO ACTUAL EMAILS SENT
            </div>

            <div className="panel">
              <div className="panel-header">
                <span className="dot" style={{ background: theme.green }} />
                RECENT SIMULATIONS
              </div>
              {deliveryLog.length === 0 ? (
                <div style={{
                  padding: 40, textAlign: "center",
                  color: theme.textDim, fontSize: 13,
                }}>
                  No simulated deliveries yet.<br/>
                  Use SIMULATE SEND in Preview tab.
                </div>
              ) : (
                <div>
                  <div className="delivery-log-row mono" style={{
                    fontSize: 10, color: theme.textDim,
                    letterSpacing: "0.1em",
                    background: theme.panelLight,
                  }}>
                    <div>TIME</div>
                    <div>ALERT</div>
                    <div>CHANNELS</div>
                    <div>RECIPIENTS</div>
                  </div>
                  {deliveryLog.map((log, i) => {
                    const tierColor = TIER_COLORS[log.tier];
                    return (
                      <div
                        key={i}
                        className="delivery-log-row"
                        style={{
                          animation: "fade-in 0.3s ease forwards",
                        }}
                      >
                        <div className="mono" style={{ color: theme.textDim }}>
                          {log.time}
                        </div>
                        <div>
                          <span className="badge" style={{
                            background: `${tierColor}15`,
                            color: tierColor,
                            borderColor: `${tierColor}50`,
                            marginRight: 8,
                          }}>{log.tier}</span>
                          {log.location}
                        </div>
                        <div style={{ color: theme.textMid, fontSize: 11 }}>
                          {log.channels}
                        </div>
                        <div style={{ color: theme.textMid }}>
                          {log.recipients}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

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
          <div>WIPS NOTIFY v1.0 · MOCKUP ONLY · NO REAL DELIVERY</div>
          <div>EMAIL · PUSH · TIMING PREVIEW</div>
          <div style={{ color: theme.amber }}>FULL FORCE ETERNAL</div>
        </div>
      </div>
    </>
  );
}
