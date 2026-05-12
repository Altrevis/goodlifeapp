import React from "react";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, Database, Cookie, Mail, ChevronRight } from "lucide-react";
import "./css/mentions.css";

const pStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#94a3b8",
  lineHeight: 1.65,
  margin: "0 0 12px"
};

const Section: React.FC<{ icon: React.ReactNode; label: string; title: string; children: React.ReactNode }> = ({ icon, label, title, children }) => (
  <div style={{
    background: "rgba(10, 30, 60, 0.6)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "32px",
    marginBottom: "16px",
    backdropFilter: "blur(10px)"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
      {icon}
      <span style={{
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.07em",
        textTransform: "uppercase" as const,
        color: "#10b981"
      }}>
        {label}
      </span>
    </div>
    <h2 style={{
      fontSize: "20px",
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "#f1f5f9",
      margin: "0 0 18px"
    }}>
      {title}
    </h2>
    {children}
  </div>
);

const Callout: React.FC<{ color: "green" | "orange"; children: React.ReactNode }> = ({ color, children }) => (
  <div style={{
    background: color === "green" ? "rgba(16,185,129,0.07)" : "rgba(245,158,11,0.07)",
    border: `1px solid ${color === "green" ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
    borderRadius: "10px",
    padding: "14px 18px",
    marginTop: "14px",
    fontSize: "13px",
    color: color === "green" ? "#6ee7b7" : "#fcd34d",
    lineHeight: 1.6
  }}>
    {children}
  </div>
);

const MentionsLegales: React.FC = () => {
  return (
    <div className="mentions-legales-page">

      {/* HERO */}
      <div className="mentions-legales-hero">
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.25)",
          borderRadius: "20px",
          padding: "6px 14px",
          marginBottom: "20px"
        }}>
          <Shield size={13} color="#10b981" />
          <span style={{
            fontSize: "12px",
            color: "#10b981",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase"
          }}>
            Transparence & Confiance
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(28px, 5vw, 44px)",
          fontWeight: 700,
          letterSpacing: "-0.5px",
          margin: "0 0 14px",
          background: "linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Mentions légales
        </h1>
        <p style={{
          fontSize: "16px",
          color: "#64748b",
          maxWidth: "520px",
          margin: "0 auto 20px"
        }}>
          Tout ce que vous devez savoir sur vos droits, la protection de vos données et les conditions d'utilisation de Sport & bien-être IA.
        </p>
        <p style={{ fontSize: "12px", color: "#475569" }}>
          Dernière mise à jour : avril 2026 · Application soumise au droit français
        </p>
      </div>

      {/* CONTENU */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px 0" }}>

        {/* 01 — Éditeur */}
        <Section icon={<Shield size={20} color="#10b981" />} label="01 — Identité" title="Éditeur de l'application">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <tbody>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "10px 12px", color: "#94a3b8", width: "40%", fontWeight: 500 }}>Nom du projet</td>
                <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>Sport & bien-être IA</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "10px 12px", color: "#94a3b8", width: "40%", fontWeight: 500 }}>Nature juridique</td>
                <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>Projet étudiant à titre non commercial</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "10px 12px", color: "#94a3b8", width: "40%", fontWeight: 500 }}>Établissement</td>
                <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>YNOV Campus, Montpellier</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "10px 12px", color: "#94a3b8", width: "40%", fontWeight: 500 }}>Responsable</td>
                <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>Leo / Ryan / Alexandre</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "10px 12px", color: "#94a3b8", width: "40%", fontWeight: 500 }}>Hébergement</td>
                <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>Local</td>
              </tr>
            </tbody>
          </table>
          <Callout color="green">
            Sport & bien-être IA est un projet académique. Il n'est pas exploité à des fins commerciales et n'est pas destiné à un usage médical professionnel.
          </Callout>
        </Section>

        {/* 02 — Santé */}
        <Section icon={<AlertTriangle size={20} color="#f59e0b" />} label="02 — Avertissement" title="Informations de santé">
          <p style={pStyle}>
            Les contenus, recommandations et données affichés dans Sport & bien-être IA sont fournis à titre informatif et éducatif uniquement. Ils ne constituent en aucun cas un avis médical, un diagnostic ou une prescription.
          </p>
          <Callout color="orange">
            <strong>Sport & bien-être IA n'est pas un dispositif médical.</strong> L'application n'est pas certifiée CE et ne saurait se substituer à une consultation auprès d'un professionnel de santé qualifié. En cas de doute sur votre état de santé, consultez un médecin.
          </Callout>
        </Section>

        {/* 03 — RGPD */}
        <Section icon={<Database size={20} color="#10b981" />} label="03 — Vie privée" title="Protection des données (RGPD)">
          <p style={pStyle}>
            Conformément au RGPD (Règlement UE 2016/679) et à la loi Informatique et Libertés, Sport & bien-être IA s'engage à protéger vos données personnelles.
          </p>
          <Callout color="orange">
            <strong>Données de santé sensibles :</strong> Conformément à l'article 9 du RGPD, vos données de santé bénéficient d'une protection renforcée et ne sont traitées qu'avec votre consentement explicite.
          </Callout>
          <p style={{ ...pStyle, marginTop: "16px" }}>Vous disposez des droits suivants :</p>
          <ul style={{ margin: "8px 0", padding: 0, listStyle: "none" }}>
            {[
              "Droit d'accès et de rectification",
              "Droit à l'effacement (« droit à l'oubli »)",
              "Droit à la portabilité de vos données",
              "Droit d'opposition et de limitation du traitement",
              "Droit de retirer votre consentement à tout moment",
            ].map(d => (
              <li key={d} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontSize: "14px",
                color: "#94a3b8"
              }}>
                <ChevronRight size={14} color="#10b981" style={{ flexShrink: 0 }} />
                {d}
              </li>
            ))}
          </ul>
          <p style={{ ...pStyle, marginTop: "16px" }}>
            Pour exercer vos droits, contactez-nous via la section Contact ci-dessous. Vous pouvez également introduire une réclamation auprès de la <strong style={{ color: "#e2e8f0" }}>CNIL</strong> (www.cnil.fr).
          </p>
        </Section>

        {/* 04 — Cookies */}
        <Section icon={<Cookie size={20} color="#10b981" />} label="04 — Cookies" title="Gestion des cookies">
          <p style={pStyle}>
            Sport & bien-être IA utilise des cookies pour assurer le bon fonctionnement de l'application et mémoriser vos préférences.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginTop: "12px" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                {["Type", "Finalité", "Durée"].map(h => (
                  <th key={h} style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase" as const,
                    color: "#475569"
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Essentiels", "Authentification, sécurité", "Session"],
                ["Préférences", "Paramètres utilisateur", "12 mois"],
                ["Analytiques", "Mesure d'audience anonymisée", "13 mois"],
              ].map(([t, f, d]) => (
                <tr key={t} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "10px 12px", color: "#e2e8f0", fontWeight: 500 }}>{t}</td>
                  <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{f}</td>
                  <td style={{ padding: "10px 12px", color: "#64748b" }}>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* 05 — Contact */}
        <Section icon={<Mail size={20} color="#10b981" />} label="05 — Contact" title="Nous contacter">
          <p style={pStyle}>
            Pour toute question relative aux présentes mentions légales ou à la protection de vos données :
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <tbody>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "10px 12px", color: "#94a3b8", width: "40%", fontWeight: 500 }}>E-mail</td>
                <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>ryan.a@ynov.com</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "10px 12px", color: "#94a3b8", width: "40%", fontWeight: 500 }}>Délai de réponse</td>
                <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>Sous 30 jours ouvrés (exigence RGPD)</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "10px 12px", color: "#94a3b8", width: "40%", fontWeight: 500 }}>Autorité de contrôle</td>
                <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>CNIL — www.cnil.fr</td>
              </tr>
            </tbody>
          </table>
        </Section>

        {/* Bouton retour */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link to="/" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.25)",
            color: "#10b981",
            padding: "12px 28px",
            borderRadius: "12px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600
          }}>
            ← Retour à l'accueil
          </Link>
        </div>

      </div>
    </div>
  );
};

export default MentionsLegales;