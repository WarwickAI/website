import { IOptions, RecursivePartial } from "react-tsparticles";

const particlesConfig: RecursivePartial<IOptions> = {
  particles: {
    number: {
      value: 20,
      density: {
        enable: true,
        value_area: 800,
      },
    },
    color: {
      value: "#6D60C1",
    },
    shape: {
      type: "circle" as const,
      stroke: {
        width: 0,
        color: "#5F5F5F",
      },
    },
    opacity: {
      value: 0.5,
      random: false,
      anim: {
        enable: false,
        speed: 1,
        opacity_min: 0.1,
        sync: false,
      },
    },
    size: {
      value: 3,
      random: true,
      anim: {
        enable: false,
        speed: 40,
        size_min: 0.1,
        sync: false,
      },
    },
    line_linked: {
      enable: true,
      distance: 300,
      color: "#6D60C1",
      opacity: 0.2,
      width: 1,
    },
    move: {
      enable: true,
      speed: 1,
      direction: "none" as const,
      random: true,
      straight: false,
      out_mode: "out" as const,
      bounce: false,
    },
  },
  interactivity: {
    detect_on: "window" as const,
    events: {
      onclick: {
        enable: true,
        mode: "repulse" as const,
      },
      resize: true,
    },
    modes: {
      repulse: {
        distance: 200,
        duration: 0.4,
      },
    },
  },
  pauseOnBlur: true,
  pauseOnOutsideViewport: true,
  retina_detect: true,
  background: {
    color: "#FFFFFF",
    image: "",
    position: "50% 50%",
    repeat: "no-repeat" as const,
    size: "cover" as const,
  },
  fpsLimit: 90,
};

export default particlesConfig;
