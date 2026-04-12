"use client";

export default function Aurora() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Orb 1 – gold top-right */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%)",
          animation: "auroraFloat1 12s ease-in-out infinite",
        }}
      />
      {/* Orb 2 – purple bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          left: "-60px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(100,80,200,0.07) 0%, transparent 70%)",
          animation: "auroraFloat2 15s ease-in-out infinite",
        }}
      />
      {/* Orb 3 – subtle center */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "40%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 60%)",
          animation: "auroraFloat3 18s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes auroraFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 20px) scale(1.05); }
          66% { transform: translate(20px, -30px) scale(0.95); }
        }
        @keyframes auroraFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -40px) scale(1.1); }
        }
        @keyframes auroraFloat3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
      `}</style>
    </div>
  );
}
