"use client";
import React from "react";
import Particles from "react-tsparticles";
import particlesConfig from "./config";

const particleStyle = {
  position: "fixed" as const,
  left: "0",
  top: "0",
  width: "100%",
  height: "100%",
  zIndex: "+1",
};

export default function ParticleBackground() {
  return (
    <div style={particleStyle}>
      <Particles params={particlesConfig} />
    </div>
  );
}
