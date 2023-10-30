const particlesConfig = {
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
      polygon: {
        nb_sides: 5,
      },
      image: {
        src: "img/github.svg",
        width: 100,
        height: 100,
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
      distance: 250,
      color: "#6D60C1",
      opacity: 0.2,
      width: 1,
    },
    move: {
      enable: true,
      speed: 3,
      direction: "none" as const,
      random: true,
      straight: false,
      out_mode: "out" as const,
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200,
      },
    },
  },
  interactivity: {
    detect_on: "canvas" as const,
    events: {
      onhover: {
        enable: false,
        mode: "bubble" as const,
      },
      onclick: {
        enable: true,
        mode: "repulse" as const,
      },
      resize: true,
    },
    modes: {
      grab: {
        distance: 400,
        line_linked: {
          opacity: 1,
        },
      },
      bubble: {
        distance: 400,
        size: 40,
        duration: 2,
        opacity: 8,
        speed: 3,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
      push: {
        particles_nb: 4,
      },
      remove: {
        particles_nb: 2,
      },
    },
  },
  retina_detect: true,
};

export default particlesConfig;
