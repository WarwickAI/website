import { IOptions, RecursivePartial } from "@tsparticles/engine";

const particlesConfig: RecursivePartial<IOptions> = {
  autoPlay: true,
  background: {
    color: {
      value: "#FFFFFF",
    },
    position: "50% 50%",
    repeat: "no-repeat",
  },
  detectRetina: true,
  fpsLimit: 90,
  fullScreen: {
    enable: true,
    zIndex: 0,
  },
  interactivity: {
    detectsOn: "window",
    events: {
      onClick: {
        enable: true,
        mode: "repulse",
      },
      resize: {
        enable: true,
      },
    },
    modes: {
      repulse: {
        distance: 200,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: "#6D60C1",
    },
    links: {
      color: {
        value: "#6D60C1",
      },
      distance: 300,
      enable: true,
      opacity: 0.2,
      width: 1,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: "out",
      random: true,
      speed: 1,
      straight: false,
    },
    number: {
      density: {
        enable: true,
      },
      value: 40,
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: "circle",
    },
    size: {
      value: {
        max: 3,
        min: 1,
      },
    },
  },
  pauseOnBlur: true,
  pauseOnOutsideViewport: true,
};

export default particlesConfig;
