"use client";

import { useState, useEffect, useRef } from "react";

export default function PhasePrep() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setTimeout(() => {
      setExercises([
        { id: "1", name: "Bench Press", emoji: "🏋️", muscleGroup: "Chest", muscleColor: "#FF6B6B", sets: 4, suggestedWeight: 100 },
        { id: "2", name: "Barbell Rows", emoji: "📏", muscleGroup: "Back", muscleColor: "#00A87A", sets: 4, suggestedWeight: 120 },
        { id: "3", name: "Squats", emoji: "🦵", muscleGroup: "Legs", muscleColor: "#1A73E8", sets: 4, suggestedWeight: 140 },
        { id: "4", name: "Overhead Press", emoji: "💪", muscleGroup: "Shoulders", muscleColor: "#7C3AED", sets: 3, suggestedWeight: 70 },
      ]);
      setLoading(false);
    }, 1200);

    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4fa 0%, #ffffff 100%)" }}>
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1a2744 50%, #142952 100%)", color: "#f1f5f9", padding: "32px 20px", minHeight: "320px" }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "14px", opacity: 0.8 }}>{currentTime.toLocaleDateString("ar-SA", { weekday: "long", month: "long", day: "numeric" })}</div>
          <div style={{ fontSize: "24px", fontWeight: 700 }}>{currentTime.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 8px 0" }}>PhasePrep Exercises</h1>
        <p style={{ fontSize: "14px", opacity: 0.7, margin: 0 }}>Plan your workout with AI guidance</p>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 20px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ background: "#ffffff", borderRadius: "14px", padding: "16px", animation: "shimmer 2s infinite", backgroundImage: "linear-gradient(90deg, #ffffff 0%, #f5f5f5 50%, #ffffff 100%)" }}>
                <div style={{ width: "40px", height: "40px", background: "#e5e5e5", borderRadius: "8px", marginBottom: "12px" }}></div>
                <div style={{ width: "80%", height: "16px", background: "#e5e5e5", borderRadius: "4px", marginBottom: "8px" }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {exercises.map((exercise) => (
              <div key={exercise.id} style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "16px", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)", transition: "all 0.3s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "32px" }}>{exercise.emoji}</span>
                  <span style={{ fontSize: "18px", fontWeight: 600, color: "#0d1b2a" }}>{exercise.name}</span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", marginBottom: "12px", backgroundColor: exercise.muscleColor + "20" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: exercise.muscleColor }}></span>
                  <span style={{ color: exercise.muscleColor, fontWeight: 600 }}>{exercise.muscleGroup}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "8px", background: "#f8fafc", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Weight</span>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#0d1b2a" }}>{exercise.suggestedWeight} kg</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "8px", background: "#f8fafc", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Sets</span>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#0d1b2a" }}>{exercise.sets}x</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "8px", background: "#f8fafc", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Rest</span>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#0d1b2a" }}>90s</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "10px", background: "#ef4444", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>🎬 Tutorial</a>
                  <button style={{ flex: 1, padding: "10px", background: "#1a73e8", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>⇄ Alternative</button>
                </div>
                <button style={{ width: "100%", marginTop: "12px", padding: "12px", background: "linear-gradient(135deg, #00a87a 0%, #059669 100%)", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>✅ Mark Complete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}