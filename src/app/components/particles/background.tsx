"use client";
import React from "react";
import Particles from "react-tsparticles";
import particlesConfig from "./config";

export default function ParticleBackground() {
  return (
    <div className="left-0 top-0 w-full h-full z-2">
      <Particles params={particlesConfig} />
    </div>
  );
}
